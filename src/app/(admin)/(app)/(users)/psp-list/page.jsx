import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import UserListTabel from './components/UserListTabel';
export const metadata = {
  title: 'PSP Users'
};
const Page = () => {
  return <main>
      <PageBreadcrumb subtitle="Users" title="PSP Users" />
      <UserListTabel />
    </main>;
};
export default Page;