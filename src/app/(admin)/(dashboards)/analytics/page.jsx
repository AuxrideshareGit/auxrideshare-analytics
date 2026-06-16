import React from 'react';
import Analytics from './components/Analytics';
import PerspectiveChart from './components/PerspectiveChart';
import LocationBased from './components/LocationBased';
import PagesInteraction from './components/PagesInteraction';
import UserChart from './components/UserChart';
import ProductsStatistics from './components/ProductsStatistics';
import AnalyticsReports from './components/AnalyticsReports';
import StatusOfMonthlyCampaign from './components/StatusOfMonthlyCampaign';
import SubscriptionDistribution from './components/SubscriptionDistribution';
import TrafficSource from './components/TrafficSource';
import PageBreadcrumb from '@/components/PageBreadcrumb';
export const metadata = {
  title: 'Analytics'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Analytics" subtitle="Dashboard" />
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-5 mb-5">
        <Analytics />
        <PerspectiveChart />
      </div>
      <div className="grid lg:grid-cols-12 grid-cols-1 gap-5 mb-5">
        <LocationBased />
        <PagesInteraction />
      </div>
      <UserChart />
      <ProductsStatistics />
      <div className="grid lg:grid-cols-4 grid-cols-1 gap-5">
        <AnalyticsReports />
        <StatusOfMonthlyCampaign />
        <SubscriptionDistribution />
        <TrafficSource />
      </div>
    </main>;
};
export default Page;