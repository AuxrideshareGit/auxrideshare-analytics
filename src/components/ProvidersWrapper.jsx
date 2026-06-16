'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import LayoutProvider from '@/context/useLayoutContext';
import AuthProvider from '@/context/useAuthContext';

const ProvidersWrapper = ({ children }) => {
  const path = usePathname();

  useEffect(() => {
    import('preline/preline').then(() => {
      if (window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
      }
    });
  }, []);

  useEffect(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit();
    }
  }, [path]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <AuthProvider>
        <LayoutProvider>{children}</LayoutProvider>
      </AuthProvider>
    </>
  );
};

export default ProvidersWrapper;