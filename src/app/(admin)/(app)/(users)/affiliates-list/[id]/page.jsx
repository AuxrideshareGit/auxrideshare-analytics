import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import AffiliateOverview from './components/AffiliateOverview';

export const metadata = {
  title: 'PSP Commission & Payout History'
};

const Page = async ({ params }) => {
  const { id } = await params;
  return (
    <main>
      <PageBreadcrumb subtitle="PSP Users" title={`PSP Commission & Payout History`} />
      <AffiliateOverview affiliateId={id} />
    </main>
  );
};

export default Page;
