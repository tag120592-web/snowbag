package config

import (
	"os"
	"strings"
)

type Config struct {
	Port               string
	DatabaseURL        string
	RedisURL           string
	S3Endpoint         string
	S3PublicEndpoint   string
	S3AccessKey        string
	S3SecretKey        string
	S3Bucket           string
	CORSOrigins        []string
	YandexMapsAPIKey   string
	RecognizerURL      string
}

func Load() Config {
	return Config{
		Port:             env("API_PORT", "8080"),
		DatabaseURL:      env("DATABASE_URL", "postgres://snowbag:snowbag@localhost:5432/snowbag?sslmode=disable"),
		RedisURL:         env("REDIS_URL", "redis://localhost:6379"),
		S3Endpoint:       env("S3_ENDPOINT", "http://localhost:9000"),
		S3PublicEndpoint: env("S3_PUBLIC_ENDPOINT", ""),
		S3AccessKey:      env("S3_ACCESS_KEY", "snowbag"),
		S3SecretKey:      env("S3_SECRET_KEY", "snowbag123"),
		S3Bucket:         env("S3_BUCKET", "snowbag-files"),
		CORSOrigins:      splitEnv("CORS_ORIGIN", "http://localhost:5173,http://localhost:3000"),
		YandexMapsAPIKey: firstEnv("YANDEX_MAPS_API_KEY", "VITE_YANDEX_MAPS_API_KEY"),
		RecognizerURL:    env("RECOGNIZER_URL", "http://host.docker.internal:8090"),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func firstEnv(keys ...string) string {
	for _, key := range keys {
		if v := os.Getenv(key); v != "" {
			return v
		}
	}
	return ""
}

func splitEnv(key, fallback string) []string {
	raw := env(key, fallback)
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if s := strings.TrimSpace(p); s != "" {
			out = append(out, s)
		}
	}
	return out
}
