package storage

import (
	"context"
	"fmt"
	"io"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/technonicol/snowbag/api/internal/config"
)

type S3 struct {
	client *minio.Client
	bucket string
}

func NewS3(cfg config.Config) (*S3, error) {
	endpoint := strings.TrimPrefix(strings.TrimPrefix(cfg.S3Endpoint, "https://"), "http://")
	useSSL := strings.HasPrefix(cfg.S3Endpoint, "https://")
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.S3AccessKey, cfg.S3SecretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, err
	}
	return &S3{client: client, bucket: cfg.S3Bucket}, nil
}

func (s *S3) Ping(ctx context.Context) error {
	_, err := s.client.BucketExists(ctx, s.bucket)
	return err
}

func (s *S3) Upload(ctx context.Context, projectID uuid.UUID, filename string, r io.Reader, size int64, contentType string) (key string, err error) {
	ext := path.Ext(filename)
	key = fmt.Sprintf("projects/%s/%s%s", projectID, uuid.New().String(), ext)
	_, err = s.client.PutObject(ctx, s.bucket, key, r, size, minio.PutObjectOptions{ContentType: contentType})
	return key, err
}

func (s *S3) PublicURL(cfg config.Config, key string) string {
	base := strings.TrimSuffix(cfg.S3Endpoint, "/")
	return fmt.Sprintf("%s/%s/%s", base, s.bucket, key)
}

func (s *S3) Open(ctx context.Context, key string) (*minio.Object, error) {
	return s.client.GetObject(ctx, s.bucket, key, minio.GetObjectOptions{})
}

func (s *S3) Delete(ctx context.Context, key string) error {
	if key == "" {
		return nil
	}
	return s.client.RemoveObject(ctx, s.bucket, key, minio.RemoveObjectOptions{})
}

func PresignedGet(ctx context.Context, s *S3, cfg config.Config, key string) (string, error) {
	u, err := s.client.PresignedGetObject(ctx, s.bucket, key, 24*time.Hour, nil)
	if err != nil {
		return "", err
	}
	// rewrite host for browser access in dev
	url := u.String()
	if cfg.S3PublicEndpoint != "" {
		url = strings.Replace(url, strings.TrimPrefix(cfg.S3Endpoint, "http://"), cfg.S3PublicEndpoint, 1)
	}
	return url, nil
}
