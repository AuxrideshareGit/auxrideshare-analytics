"use client";
import React, { useState } from 'react';
import NegativeBalanceTable from './NegativeBalanceTable';
import ChargeDeductionLogsTable from './ChargeDeductionLogsTable';

const DriverBalancesTabs = () => {
  const [activeTab, setActiveTab] = useState('negative_balance_charges');

  const tabs = [
    { id: 'negative_balance_charges', label: 'Negative Balance Charges' },
    { id: 'charge_deduction_logs', label: 'Charge Deduction Logs' }
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
        {activeTab === 'negative_balance_charges' && <NegativeBalanceTable />}
        {activeTab === 'charge_deduction_logs' && <ChargeDeductionLogsTable />}
      </div>
    </div>
  );
};

export default DriverBalancesTabs;
