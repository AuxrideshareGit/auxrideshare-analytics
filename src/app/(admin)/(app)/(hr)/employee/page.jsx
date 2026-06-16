import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import EmployeeDetails from './components/EmployeeDetails';
import EditEmployeeData from './components/EditEmployeeData';
import EmployeeDelete from './components/EmployeeDelete';
export const metadata = {
  title: 'Employee List'
};
const Page = () => {
  return <>
      <main>
        <PageBreadcrumb title="Employee List" subtitle="Menu" />
        <EmployeeDetails />
      </main>
      <EditEmployeeData />
      <EmployeeDelete />
    </>;
};
export default Page;