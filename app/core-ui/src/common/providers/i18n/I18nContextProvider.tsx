import { Locales, LocaleType } from '@cloud-editor-mono/common';
import { useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';

import { I18nContext } from './i18nContext';

interface I18nProviderProps {
  children?: React.ReactNode;
}

const DEFAULT_LOCALE = Locales.ENGLISH;

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
}: I18nProviderProps) => {
  const [currentLocale, setCurrentLocale] = useState<LocaleType>(
    () => DEFAULT_LOCALE,
  );

  const contextValue = useMemo(
    () => ({ currentLocale, setCurrentLocale }),
    [currentLocale, setCurrentLocale],
  );

  return (
    <I18nContext.Provider value={contextValue}>
      <IntlProvider locale={currentLocale} defaultLocale={DEFAULT_LOCALE}>
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
};
