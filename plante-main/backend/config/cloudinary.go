package config

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

func InitCloudinary() error {
	var err error
	cld, err = cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	return err
}

func UploadImage(file interface{}, folder string) (string, error) {
	ctx := context.Background()

	// Upload the image
	result, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:       folder,
		ResourceType: "image",
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload image: %v", err)
	}

	return result.SecureURL, nil
}

func DeleteImage(publicID string) error {
	ctx := context.Background()

	// Delete the image
	_, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	if err != nil {
		return fmt.Errorf("failed to delete image: %v", err)
	}

	return nil
}

// Extract public ID from Cloudinary URL
func GetPublicIDFromURL(url string) string {
	// Example URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/image.jpg
	// We need to extract: folder/image
	parts := strings.Split(url, "/upload/")
	if len(parts) != 2 {
		return ""
	}

	// Remove version and file extension
	path := parts[1]
	path = strings.Split(path, "/v")[0]
	path = strings.Split(path, ".")[0]

	return path
}
