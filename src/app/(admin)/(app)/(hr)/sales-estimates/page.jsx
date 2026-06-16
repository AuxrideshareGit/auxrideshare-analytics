import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import Estimates from './components/Estimates';
import EstimentModal from './components/EstimentModal';
const Page = () => {
  return <>
      <main>
        <PageBreadcrumb title="Sales Estimates" subtitle="Menu" />
        <Estimates />
        <EstimentModal />
      </main>
    </>;
};
export default Page;