import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import ProductCreat from './components/ProductCreat';
import Preview from './components/Preview';
export const metadata = {
  title: 'Product Create'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Add New" subtitle="Menu" />
      <div className="grid lg:grid-cols-12 grid-cols-1 gap-6">
        <ProductCreat />
        <Preview />
      </div>
    </main>;
};
export default Page;