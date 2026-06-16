import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import Product from './components/Product';
import ProductDetails from './components/ProductDetails';
import Ratings from './components/Ratings';
export const metadata = {
  title: 'Product Overview'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Overview" subtitle="Menu" />
      <div className="grid lg:grid-cols-3 grid-cols-1 lg:gap-5">
          <Product />
        <div className="lg:col-span-2 col-span-1">
          <div className="card">
            <div className="card-body">
              <ProductDetails />
              <Ratings />
            </div>
          </div>
        </div>
      </div>
    </main>;
};
export default Page;