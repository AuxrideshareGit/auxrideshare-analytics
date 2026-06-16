import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import UserListTabel from './components/UserListTabel';
export const metadata = {
  title: 'Affiliate Users'
};
const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Users" title="Affiliate Users" />
    <UserListTabel />
  </main>;
};
export default Page;