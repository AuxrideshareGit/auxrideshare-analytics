import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import Pricing from './components/PricingCard';
import HorizontalPricing from './components/HorizontalPricing';
export const metadata = {
  title: 'Pricing'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Pricing" subtitle="Pages" />
      <Pricing />
      <HorizontalPricing />
    </main>;
};
export default Page;