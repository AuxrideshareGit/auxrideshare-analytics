import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import PspOverview from './components/PspOverview';

export const metadata = {
  title: 'PSP Commission & Payout History'
};

const Page = async ({ params }) => {
  const { id } = await params;
  return (
    <main>
      <PageBreadcrumb subtitle="PSP Users" title={`PSP Commission & Payout History`} />
      <PspOverview pspId={id} />
    </main>
  );
};

export default Page;
