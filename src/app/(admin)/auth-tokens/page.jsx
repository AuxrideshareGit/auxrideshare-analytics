import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import AuthTokensTable from './components/AuthTokensTable';

export const metadata = { title: 'Auth Tokens' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="System" title="Auth Tokens" />
    <AuthTokensTable />
  </main>;
};

export default Page;
