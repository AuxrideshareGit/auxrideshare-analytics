import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import EmailLineChart from './components/EmailLineChart';
import EmailBarChart from './components/EmailBarChart';
import EmailData from './components/EmailData';
import EmailMarketing from './components/EmailMarketing';
import ComposeEmail from './components/ComposeEmail';
import EmailPerformance from './components/EmailPerformance';
export const metadata = {
  title: 'Email'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Email Analytics" subtitle="Dashboard" />
      <EmailLineChart />
      <EmailBarChart />
      <div className="grid lg:grid-cols-4 grid-cols-1 gap-5 mb-5">
        <EmailData />
        <EmailMarketing />
        <ComposeEmail />
      </div>
      <EmailPerformance />
    </main>;
};
export default Page;