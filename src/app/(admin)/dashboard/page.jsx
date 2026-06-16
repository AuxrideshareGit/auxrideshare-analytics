'use client';

import PageBreadcrumb from '@/components/PageBreadcrumb';
import React, { useState, useEffect } from 'react';
import DateFilter from './components/DateFilter';
import StripeBalance from './components/StripeBalance';
import RidePaymentCharts from './components/RidePaymentCharts';
import DailyStats from './components/DailyStats';
import DriversPaymentTable from './components/DriversPaymentTable';
import { useAuthContext } from '@/context/useAuthContext';
import { getDelayedCommissionSummary, getCommissionTransferSummary, getDriverPayoutBatchSummary } from '@/utils/api';

const Page = () => {
  const { token } = useAuthContext();
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  const [commissionData, setCommissionData] = useState(null);
  const [transferData, setTransferData] = useState(null);
  const [payoutBatchData, setPayoutBatchData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCommonData = async () => {
      if (!token) return;
      setLoading(true);

      // Clear data to show loading states in sub-components
      setCommissionData(null);
      setTransferData(null);
      setPayoutBatchData(null);

      try {
        const [delayedResult, actualResult, batchResult] = await Promise.allSettled([
          getDelayedCommissionSummary(token, selectedDate),
          getCommissionTransferSummary(token, selectedDate),
          getDriverPayoutBatchSummary(token, selectedDate),
        ]);

        if (!isMounted) return; // Ignore results if date changed or component unmounted

        if (delayedResult.status === 'fulfilled') setCommissionData(delayedResult.value);
        else console.error('Failed to load commission summary:', delayedResult.reason?.message);

        if (actualResult.status === 'fulfilled') setTransferData(actualResult.value);
        else console.error('Failed to load transfer summary:', actualResult.reason?.message);

        if (batchResult.status === 'fulfilled') setPayoutBatchData(batchResult.value);
        else console.error('Failed to load payout batch summary:', batchResult.reason?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCommonData();

    return () => {
      isMounted = false;
    };
  }, [token, selectedDate]);

  return (
    <main>
      <div className="mb-6 w-full">
        <PageBreadcrumb title="Dashboard" subtitle="Dashboard" />
      </div>

      {/* Stripe Balance with Header DateFilter */}
      <StripeBalance 
        headerSlot={<DateFilter value={selectedDate} onDateChange={setSelectedDate} disabled={loading} />}
      />

      {/* Ride payment pie charts */}
      <RidePaymentCharts
        selectedDate={selectedDate}
        commissionData={commissionData}
        loadingCommon={loading}
      />

      {/* Daily stats bar charts */}
      <DailyStats
        date={selectedDate}
        data={commissionData}
        actualPaidData={transferData}
        loading={loading}
      />

      {/* Drivers payment table */}
      <DriversPaymentTable
        date={selectedDate}
        payoutBatchData={payoutBatchData}
        loading={loading}
      />
    </main>
  );
};

export default Page;