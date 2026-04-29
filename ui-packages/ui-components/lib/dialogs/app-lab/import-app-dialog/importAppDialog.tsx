import {
  TriangleSharp,
  UploadLight as Upload,
} from '@cloud-editor-mono/images/assets/icons';
import React, {
  DragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  useI18n,
} from '../../../components-by-app/app-lab';
import { ErrorBanner } from '../../../error-banner/ErrorBanner';
import { AppLabDialog } from '../app-lab-dialog/AppLabDialog';
import { importAppDialogMessages as messages } from '../messages';
import styles from './import-app-dialog.module.scss';
import { ImportAppDialogProps, ImportStatus } from './importAppDialog.type';

export type {
  ImportAppDialogLogic,
  ImportAppDialogProps,
  ImportStatus,
} from './importAppDialog.type';

export const ImportAppDialog: React.FC<ImportAppDialogProps> = ({
  logic,
}: ImportAppDialogProps) => {
  const { formatMessage } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    open,
    status = ImportStatus.UploadFailed,
    errorMessage,
    onOpenChange,
    startImport,
    handleFileDrop,
  } = logic();

  const title = useMemo(() => {
    return formatMessage(messages.title);
  }, [formatMessage]);

  const footer = useMemo((): React.ReactNode => {
    if (status === ImportStatus.UploadFailed) {
      return (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={(): void => onOpenChange(false)}
        >
          {formatMessage(messages.goToMyApp)}
        </Button>
      );
    }

    return null;
  }, [formatMessage, status, onOpenChange]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        // Check if file is a zip
        if (file.name.endsWith('.zip')) {
          handleFileDrop(file);
        }
      }
    },
    [handleFileDrop],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.name.endsWith('.zip')) {
          handleFileDrop(file);
        }
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileDrop],
  );

  const handleButtonClick = useCallback(() => {
    // In Wails, we use the Go function to open file dialog
    startImport();
  }, [startImport]);

  return (
    <AppLabDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      closeable={status !== ImportStatus.Uploading}
      footer={footer}
      classes={{ body: styles['dialog-body'] }}
    >
      <div className={styles['import-dialog']}>
        {status === ImportStatus.Idle && (
          <>
            <div className={styles['dialog-header']}>
              <h2 className={styles['dialog-title']}>
                {formatMessage(messages.uploadTitle)}
              </h2>
              <div className={styles['dialog-description']}>
                <p>{formatMessage(messages.uploadDescriptionLine1)}</p>
                <p>{formatMessage(messages.uploadDescriptionLine2)}</p>
              </div>
            </div>

            {/* Hidden file input for drag & drop fallback */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

            <div
              className={`${styles['upload-area']} ${
                isDragging ? styles['upload-area--dragging'] : ''
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className={styles['upload-icon-wrapper']}>
                <Upload className={styles['upload-icon']} />
              </div>
              <p className={styles['upload-text']}>
                {formatMessage(messages.dragDrop)}
              </p>
              <span className={styles['upload-or']}>
                {formatMessage(messages.or)}
              </span>
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                onClick={handleButtonClick}
                Icon={Upload}
                iconPosition="right"
                classes={{ button: styles['white-icon-button'] }}
              >
                {formatMessage(messages.importFromComputer)}
              </Button>
              <span className={styles['upload-support']}>
                {formatMessage(messages.supportZip)}
              </span>
            </div>
          </>
        )}

        {status === ImportStatus.Uploading && (
          <div className={styles['loading-state']}>
            <div className={styles['spinner']} />
            <h3>{formatMessage(messages.uploadingFile)}</h3>
            <p>{formatMessage(messages.processTakesTime)}</p>
          </div>
        )}

        {status === ImportStatus.UploadFailed && (
          <div className={styles['upload-failed']}>
            <div className={styles['upload-failed--icon']}>
              <TriangleSharp />
            </div>
            <h3>{formatMessage(messages.uploadFailed)}</h3>
            <span className={styles['upload-failed--description']}>
              {formatMessage(messages.uploadFailedDescription)}
            </span>
            {errorMessage && <ErrorBanner message={errorMessage} />}
          </div>
        )}
      </div>
    </AppLabDialog>
  );
};
