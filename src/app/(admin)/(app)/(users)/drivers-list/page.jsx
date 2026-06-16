import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import UserListTabel from './components/UserListTabel';
export const metadata = {
  title: 'Drivers'
};
const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Users" title="Drivers" />
    <UserListTabel />
  </main>;
};
export default Page;