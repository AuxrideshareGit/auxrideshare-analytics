import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import HoliyDays from './components/HoliyDays';
import HolidaysLeaveDeleteModal from './components/HolidaysLeaveDeleteModal';
import HoliydaysAdd from './components/HoliydaysAdd';
export const metadata = {
  title: 'Holidays'
};
const Page = () => {
  return <>
      <main>
        <PageBreadcrumb title="Holidays" subtitle="Menu" />
        <HoliyDays />
      </main>
      <HolidaysLeaveDeleteModal />
      <HoliydaysAdd />
    </>;
};
export default Page;