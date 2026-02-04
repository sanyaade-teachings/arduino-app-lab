import { Checkmark, Copy } from '@cloud-editor-mono/images/assets/icons';
import React, { useCallback, useState } from 'react';

import styles from './error-banner.module.scss';

export interface ErrorBannerProps {
  message: string;
  onCopy?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      onCopy?.();

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [message, onCopy]);

  return (
    <div className={styles['error-banner']}>
      <span className={styles['error-label']}>Error:</span>
      <span className={styles['error-message']} title={message}>
        {message}
      </span>
      <button
        className={styles['copy-button']}
        onClick={handleCopy}
        aria-label="Copy error message"
        type="button"
      >
        {copied ? <Checkmark /> : <Copy />}
      </button>
    </div>
  );
};
