"use client";
import React, { useState, useEffect } from 'react';
import DriverPSPCommissionTable from './DriverPSPCommissionTable';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import { LuLoader, LuCircleX } from 'react-icons/lu';

const ConfigItem = ({ label, value, type = 'money' }) => {
  const displayValue = value === null || value === undefined ? '0.00' : parseFloat(value).toFixed(2);
  const prefix = type === 'money' ? '$' : '';
  const suffix = type === 'percentage' ? '%' : '';

  return (
    <div className="flex items-center justify-between py-3 border-b border-default-100 last:border-0 hover:bg-default-50 px-3 transition-colors rounded -mx-3">
      <span className="text-default-700 text-sm font-medium">{label}</span>
      <span className="text-sm font-bold text-default-800">
        {prefix}{displayValue}{suffix}
      </span>
    </div>
  );
};

const PaymentGatewayFees = ({ settings }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="card shadow-sm border border-default-200">
        <div className="p-4 border-b border-default-200 bg-default-50 rounded-t">
          <h4 className="font-semibold text-default-800">System Commissions</h4>
        </div>
        <div className="p-4 flex flex-col">
          <ConfigItem label="Admin With PSP Component" value={settings?.admin_with_psp} type="percentage" />
          <ConfigItem label="Admin Without PSP Component" value={settings?.admin_without_psp} type="percentage" />
          <ConfigItem label="PSP Percentage" value={settings?.psp_percentage} type="percentage" />
        </div>
      </div>

      <div className="card shadow-sm border border-default-200">
        <div className="p-4 border-b border-default-200 bg-default-50 rounded-t">
          <h4 className="font-semibold text-default-800">Gateway Fee Distribution</h4>
        </div>
        <div className="p-4 flex flex-col">
          <ConfigItem label="Gateway Driver Pays" value={settings?.gateway_driver_percentage} type="percentage" />
          <ConfigItem label="Gateway Admin Pays" value={settings?.gateway_admin_percentage} type="percentage" />
          <ConfigItem label="Gateway PSP Pays" value={settings?.gateway_psp_percentage} type="percentage" />
        </div>
      </div>

      <div className="card shadow-sm border border-default-200">
        <div className="p-4 border-b border-default-200 bg-default-50 rounded-t">
          <h4 className="font-semibold text-default-800">Stripe Integration</h4>
        </div>
        <div className="p-4 flex flex-col">
          <ConfigItem label="Stripe Fixed Fee" value={settings?.stripe_fixed_fee} type="money" />
          <ConfigItem label="Stripe Percentage Fee" value={settings?.stripe_percentage_fee} type="percentage" />
        </div>
      </div>

      <div className="card shadow-sm border border-default-200">
        <div className="p-4 border-b border-default-200 bg-default-50 rounded-t">
          <h4 className="font-semibold text-default-800">PayPal Integration</h4>
        </div>
        <div className="p-4 flex flex-col">
          <ConfigItem label="PayPal Fixed Fee" value={settings?.paypal_fixed_fee} type="money" />
          <ConfigItem label="PayPal Percentage Fee" value={settings?.paypal_percentage_fee} type="percentage" />
        </div>
      </div>
    </div>
  );
};

const TipConfigurations = ({ settings }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="card shadow-sm border border-default-200">
        <div className="p-4 border-b border-default-200 bg-default-50 rounded-t">
          <h4 className="font-semibold text-default-800">Predefined Tip Amounts</h4>
        </div>
        <div className="p-4 flex flex-col">
          <ConfigItem label="Tip Option 1" value={settings?.predefined_tip_1} type="money" />
          <ConfigItem label="Tip Option 2" value={settings?.predefined_tip_2} type="money" />
          <ConfigItem label="Tip Option 3" value={settings?.predefined_tip_3} type="money" />
          <ConfigItem label="Tip Option 4" value={settings?.predefined_tip_4} type="money" />
          <ConfigItem label="Tip Option 5" value={settings?.predefined_tip_5} type="money" />
        </div>
      </div>

      <div className="card shadow-sm border border-default-200">
        <div className="p-4 border-b border-default-200 bg-default-50 rounded-t">
          <h4 className="font-semibold text-default-800">Express Checkout</h4>
        </div>
        <div className="p-4 flex flex-col">
          <ConfigItem label="Express Checkout Tip" value={settings?.express_checkout_tip_percentage} type="percentage" />
        </div>
      </div>
    </div>
  );
};

const DriverMappingsPage = () => {
  const { token } = useAuthContext();
  const [activeTab, setActiveTab] = useState('commission');
  const [settings, setSettings] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    // Only fetch config if we need it (second/third tab) to avoid unnecessary requests
    if (activeTab === 'commission') return;
    if (settings) return; // already fetched

    const fetchConfig = async () => {
      setLoadingConfig(true);
      try {
        const result = await apiFetch(`/api/v1/admin/system/psp-settings/`, { token });
        if (result.data && result.data.length > 0) {
          setSettings(result.data[0]);
        }
      } catch (error) {
        console.error("Error fetching PSP settings:", error);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [activeTab, token, settings]);

  const tabs = [
    { id: 'commission', label: 'Driver PSP Commission' },
    { id: 'gateway', label: 'Payment Gateway Fees' },
    { id: 'tips', label: 'Tip Configurations' }
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

      <div className="bg-white min-h-[300px]">
        {activeTab === 'commission' && <DriverPSPCommissionTable />}
        
        {/* Render loading state for configs */}
        {activeTab !== 'commission' && loadingConfig && (
           <div className="flex flex-col items-center justify-center p-20">
             <LuLoader className="animate-spin size-8 text-primary" />
             <span className="mt-4 text-default-500">Loading configurations...</span>
           </div>
        )}

        {/* Not loading but null config */}
        {activeTab !== 'commission' && !loadingConfig && !settings && (
          <div className="flex flex-col items-center justify-center p-20">
            <LuCircleX className="size-10 text-warning mb-2" />
            <span className="text-default-800 font-medium">Configurations Unavailable</span>
          </div>
        )}

        {/* Ready configs */}
        {activeTab === 'gateway' && !loadingConfig && settings && (
          <PaymentGatewayFees settings={settings} />
        )}

        {activeTab === 'tips' && !loadingConfig && settings && (
          <TipConfigurations settings={settings} />
        )}
      </div>
    </div>
  );
};

export default DriverMappingsPage;
