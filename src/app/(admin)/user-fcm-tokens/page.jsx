import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import UserFCMTokensTable from './components/UserFCMTokensTable';

export const metadata = { title: 'User FCM Tokens' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="System" title="User FCM Tokens" />
    <UserFCMTokensTable />
  </main>;
};

export default Page;
