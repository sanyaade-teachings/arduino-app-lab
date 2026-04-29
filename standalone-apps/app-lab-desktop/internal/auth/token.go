package auth

import (
	"errors"
	"fmt"

	"github.com/zalando/go-keyring"
)

const service = "AppLab"

func SetRefreshToken(user string, token string) error {
	err := keyring.Set(service, user, token)
	if err != nil {
		return fmt.Errorf("failed to set refresh token in keyring: %w", err)
	}
	return nil
}

func GetRefreshToken(user string) (string, error) {
	token, err := keyring.Get(service, user)
	if err != nil {
		if errors.Is(err, keyring.ErrNotFound) {
			return "", nil
		}
		return "", fmt.Errorf("failed to get refresh token: %w", err)
	}
	return token, nil
}

func DeleteRefreshToken(user string) error {
	err := keyring.Delete(service, user)
	if err != nil {
		if errors.Is(err, keyring.ErrNotFound) {
			return nil
		}
		return fmt.Errorf("failed to delete refresh token: %w", err)
	}
	return nil
}
