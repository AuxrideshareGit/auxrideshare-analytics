import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import Activities from './components/Activities';
import EmployeDetails from './components/EmployeeDetails';
import ApplicationReceived from './components/ApplicationReceived';
import EmployeePerformance from './components/EmployeePerformance';
import TotalProjects from './components/TotalProjects';
import UpcomingInterview from './components/UpcomingInterview';
import BirthdayCard from './components/BirthdayCard';
import RecentPayroll from './components/RecentPayroll';
import UpcomingScheduled from './components/UpcomingScheduled';
export const metadata = {
  title: 'HR'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="HR" subtitle="Dashboard" />
      <Activities />
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 mb-5">
        <EmployeDetails />
        <ApplicationReceived />
      </div>
      <div className="grid lg:grid-cols-4 grid-cols-1 gap-5">
        <div className="lg:col-span-3 col-span-1">
          <EmployeePerformance />
          <div className="grid lg:grid-cols-3 col-span-1 gap-5">
            <TotalProjects />
            <UpcomingInterview />
            <div className="col-span-1">
              <BirthdayCard />
              <RecentPayroll />
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <UpcomingScheduled />
        </div>
      </div>
    </main>;
};
export default Page;