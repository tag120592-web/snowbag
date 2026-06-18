package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/technonicol/snowbag/api/internal/config"
	"github.com/technonicol/snowbag/api/internal/handler"
	"github.com/technonicol/snowbag/api/internal/storage"
	"github.com/technonicol/snowbag/api/internal/store"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	db, err := store.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer db.Close()

	if err := db.WaitReady(ctx, 30*time.Second); err != nil {
		log.Fatalf("database not ready: %v", err)
	}
	if err := store.EnsureMigrations(ctx, db.Pool()); err != nil {
		log.Printf("migrations warning: %v", err)
	}

	var s3 *storage.S3
	s3client, err := storage.NewS3(cfg)
	if err != nil {
		log.Printf("storage init: %v (file upload disabled)", err)
	} else {
		s3 = s3client
	}

	h := handler.New(db, s3, cfg)
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      h.Routes(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 120 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("snowbag api listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
}
