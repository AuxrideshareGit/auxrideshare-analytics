import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import FaqsCard from './components/FaqsCard';
import Questions from './components/Questions';
import ProductsVideo from './components/ProductsVideo';
export const metadata = {
  title: 'FAQs'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="FAQs" subtitle="Pages" />
      <FaqsCard />
      <Questions />
      <ProductsVideo />
    </main>;
};
export default Page;