import {
  AppExamples,
  ArrowDown,
  MyApps,
} from '@cloud-editor-mono/images/assets/icons';
import { Link } from '@tanstack/react-router';
import { clsx } from 'clsx';
import { Fragment } from 'react';

import {
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator,
} from '../../../essential/breadcrumb';
import { useI18n } from '../../../i18n/useI18n';
import { XSmall } from '../../../typography';
import { sidePanelItems } from '../side-panel';
import styles from './top-bar.module.scss';

interface BackProps {
  label: string;
  onClick: () => void;
}

export const Back: React.FC<BackProps> = (props: BackProps) => {
  const { onClick, label } = props;
  return (
    <BreadcrumbItem className={clsx(styles['item'])}>
      <div
        className={styles['label']}
        onClick={onClick}
        onKeyUp={onClick}
        role="button"
        tabIndex={0}
      >
        <ArrowDown className={styles['back-button']} title="Back" />
        <XSmall className={styles['item-label']}>{label}</XSmall>
      </div>
    </BreadcrumbItem>
  );
};

interface TopBarProps {
  pathItems: React.ReactNode[];
  children?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = (props: TopBarProps) => {
  const { pathItems, children } = props;

  const { formatMessage } = useI18n();

  const currentItem =
    pathItems.length > 0 && typeof pathItems[0] === 'string'
      ? sidePanelItems.find((item) => item.id === pathItems[0])
      : null;

  const getBackIcon = (pathItem: React.ReactNode): JSX.Element | null => {
    if (typeof pathItem === 'string') {
      if (pathItem === 'my-apps') {
        return <MyApps className={styles['back-app-button']} title="My Apps" />;
      }
      if (pathItem === 'examples') {
        return (
          <AppExamples className={styles['back-app-button']} title="Examples" />
        );
      }
      return <ArrowDown className={styles['back-button']} title="Back" />;
    }
    return null;
  };

  return (
    <div className={clsx(styles['top-bar'])}>
      <Breadcrumbs size="md" className={clsx(styles['breadcrumbs'])}>
        {pathItems.map((item, index) => {
          const BackIcon = getBackIcon(item);
          const isCurrentItem = index === pathItems.length - 1;
          return (
            <Fragment key={index}>
              <div
                className={clsx(styles['wrapper'], {
                  [styles['wrapper-active']]: isCurrentItem,
                })}
              >
                {typeof item === 'string' ? (
                  <BreadcrumbItem
                    className={clsx(
                      styles['item'],
                      isCurrentItem ? styles['item-active'] : '',
                    )}
                  >
                    <Link
                      className={clsx(styles['label'], {
                        [styles['active']]: isCurrentItem,
                      })}
                      to={`/${pathItems
                        .slice(0, index + 1)
                        .reduce<string[]>(
                          (acc, it) =>
                            typeof it === 'string' ? [...acc, it] : acc,
                          [],
                        )
                        .join('/')}`}
                      disabled={isCurrentItem}
                    >
                      {index === 0 &&
                        pathItems.length > 1 &&
                        BackIcon &&
                        BackIcon}
                      {index === 0 && currentItem ? (
                        <XSmall className={styles['item-label']}>
                          {formatMessage(currentItem.label)}
                        </XSmall>
                      ) : (
                        <XSmall className={styles['item-label']}>{item}</XSmall>
                      )}
                    </Link>
                  </BreadcrumbItem>
                ) : (
                  item
                )}
              </div>
              {index !== pathItems.length - 1 && (
                <BreadcrumbSeparator className={styles['breadcrumb-separator']}>
                  <XSmall>/</XSmall>
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </Breadcrumbs>
      {children}
    </div>
  );
};
export default TopBar;
