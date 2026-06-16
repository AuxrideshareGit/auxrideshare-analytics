import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import ProductList from './components/ProductList';
export const metadata = {
  title: 'Product List'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="List view" subtitle="Products" />
      <ProductList />
    </main>;
};
export default Page;