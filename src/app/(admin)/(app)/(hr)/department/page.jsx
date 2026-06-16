import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import DeleteModal from './components/DeleteModal';
import AddDepartment from './components/AddDepartment';
import Departments from './components/Departments';
export const metadata = {
  title: 'Departments'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Departments" subtitle="Menu" />
      <Departments />
      <DeleteModal />
      <AddDepartment />
    </main>;
};
export default Page;