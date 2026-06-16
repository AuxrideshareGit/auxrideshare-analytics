import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import UserGrid from './components/UserGrid';
export const metadata = {
  title: 'Grid View'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Grid View" subtitle="Mesnu" />
      <UserGrid />
    </main>;
};
export default Page;