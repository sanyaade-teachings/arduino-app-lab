package auth

import (
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
	return keyring.Get(service, user)
}

func DeleteRefreshToken(user string) error {
	return keyring.Delete(service, user)
}
