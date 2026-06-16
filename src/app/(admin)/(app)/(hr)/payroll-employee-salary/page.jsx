import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import EmployeeTotalSalary from './components/EmployeeTotalSalary';
import Salary from './components/Salary';
export const metadata = {
  title: 'Employee Salary'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Employee Salary" subtitle="Menu" />
      <EmployeeTotalSalary />
      <Salary />
    </main>;
};
export default Page;