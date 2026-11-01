/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
  setPrivacy: (value: boolean) => void;
  maskCurrency: (
    value: number,
    options?: {
      prefix?: string;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    }
  ) => string;
  maskNumber: (value: number, fallbackMask?: string) => string;
  maskText: (text: string, fallbackMask?: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const PRIVACY_STORAGE_KEY = 'valorum_privacy_mode';
const DEFAULT_MASK = '••••••';

interface PrivacyProviderProps {
  children: ReactNode;
}

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const [isPrivate, setIsPrivate] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(PRIVACY_STORAGE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const togglePrivacy = useCallback(() => {
    setIsPrivate((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PRIVACY_STORAGE_KEY, String(next));
      } catch (e) {
        console.warn('Failed to save privacy preference', e);
      }
      return next;
    });
  }, []);

  const setPrivacy = useCallback((value: boolean) => {
    setIsPrivate(value);
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, String(value));
    } catch (e) {
      console.warn('Failed to save privacy preference', e);
    }
  }, []);

  // Global Keyboard Shortcut: 'H' or 'Ctrl+H' / 'Cmd+H'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check for standalone 'h' / 'H' or Ctrl+H / Cmd+H
      if (e.key === 'h' || e.key === 'H') {
        // If ctrl or cmd is pressed, prevent browser default (e.g. Chrome history)
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
        togglePrivacy();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePrivacy]);

  const maskCurrency = useCallback(
    (
      value: number,
      options: {
        prefix?: string;
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
      } = {}
    ): string => {
      const prefix = options.prefix ?? 'R$ ';
      if (isPrivate) {
        return `${prefix}${DEFAULT_MASK}`;
      }
      const minDigits = options.minimumFractionDigits ?? 2;
      const maxDigits = options.maximumFractionDigits ?? 2;

      return `${prefix}${value.toLocaleString('pt-BR', {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      })}`;
    },
    [isPrivate]
  );

  const maskNumber = useCallback(
    (value: number, fallbackMask = DEFAULT_MASK): string => {
      if (isPrivate) return fallbackMask;
      return value.toLocaleString('pt-BR');
    },
    [isPrivate]
  );

  const maskText = useCallback(
    (text: string, fallbackMask = DEFAULT_MASK): string => {
      if (isPrivate) return fallbackMask;
      return text;
    },
    [isPrivate]
  );

  return (
    <PrivacyContext.Provider
      value={{
        isPrivate,
        togglePrivacy,
        setPrivacy,
        maskCurrency,
        maskNumber,
        maskText,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextType => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
