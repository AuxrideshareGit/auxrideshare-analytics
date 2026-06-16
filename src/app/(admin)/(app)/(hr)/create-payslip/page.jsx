import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import CreatesSlip from './components/CreatesSlip';
export const metadata = {
  title: 'Create Payslip'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Create Payslip" subtitle="Menu" />
      <CreatesSlip />
    </main>;
};
export default Page;