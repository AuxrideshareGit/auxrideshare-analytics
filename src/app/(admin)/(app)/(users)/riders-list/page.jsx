import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import UserListTabel from './components/UserListTabel';
export const metadata = {
  title: 'Riders'
};
const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Users" title="Riders" />
    <UserListTabel />
  </main>;
};
export default Page;