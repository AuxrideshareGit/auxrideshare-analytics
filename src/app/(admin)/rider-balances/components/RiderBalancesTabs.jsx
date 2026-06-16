"use client";
import React, { useState } from 'react';
import RiderBalancesTable from './RiderBalancesTable';
import RiderBalanceHistoryTable from './RiderBalanceHistoryTable';
import InsufficientFundsHistoryTable from './InsufficientFundsHistoryTable';

const RiderBalancesTabs = () => {
  const [activeTab, setActiveTab] = useState('rider_balances');

  const tabs = [
    { id: 'rider_balances', label: 'Rider Balances' },
    { id: 'rider_balance_history', label: 'Balance History Logs' },
    { id: 'insufficient_funds_history', label: 'Insufficient Funds History' }
  ];

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-default-200 px-6 pt-4 flex gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 outline-none ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-default-500 hover:text-default-800 hover:border-default-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white min-h-[400px]">
        {activeTab === 'rider_balances' && <RiderBalancesTable />}
        {activeTab === 'rider_balance_history' && <RiderBalanceHistoryTable />}
        {activeTab === 'insufficient_funds_history' && <InsufficientFundsHistoryTable />}
      </div>
    </div>
  );
};

export default RiderBalancesTabs;
