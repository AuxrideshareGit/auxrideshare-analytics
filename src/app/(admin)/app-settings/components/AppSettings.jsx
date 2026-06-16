"use client";
import React, { useState, useEffect } from 'react';
import { LuLoader, LuCar, LuClock, LuBanknote, LuWallet, LuMapPin, LuBell, LuCheck, LuCircleX, LuSettings, LuSquarePen } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import Link from 'next/link';

const SettingItem = ({ label, value, type = 'text', suffix = '' }) => {
  let displayValue = value;
  let isPositive = false;
  let isNegative = false;
  
  // Transform boolean-like texts
  if (value === 'yes' || value === 'show' || value === 'enabled') {
    isPositive = true;
    displayValue = value.charAt(0).toUpperCase() + value.slice(1);
  } else if (value === 'no' || value === 'hide' || value === 'disabled') {
    isNegative = true;
    displayValue = value.charAt(0).toUpperCase() + value.slice(1);
  } else if (type === 'money') {
    displayValue = `$${parseFloat(value || 0).toFixed(2)}`;
  } else if (value === null || value === undefined || value === '') {
    displayValue = 'N/A';
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-default-200 last:border-0 hover:bg-default-50 transition-colors px-2 rounded -mx-2">
      <span className="text-default-700 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {isPositive && <LuCheck className="size-4 text-success" />}
        {isNegative && <LuCircleX className="size-4 text-danger" />}
        <span className={`text-sm ${isPositive ? 'text-success font-semibold' : isNegative ? 'text-danger font-semibold' : 'text-default-600 font-mono'}`}>
          {displayValue} {suffix && value !== 'N/A' && value !== null ? <span className="text-xs text-default-400 font-normal">{suffix}</span> : ''}
        </span>
      </div>
    </div>
  );
};

const SettingsGroupConfig = ({ title, icon: Icon, children }) => (
  <div className="card h-full">
    <div className="card-header border-b border-default-200 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
          <Icon className="size-5" />
        </div>
        <h3 className="text-base font-semibold text-default-800 m-0">{title}</h3>
      </div>
    </div>
    <div className="p-6">
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  </div>
);

const AppSettings = () => {
  const { token } = useAuthContext();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const result = await apiFetch(`/api/v1/admin/system/app-settings/`, { token });
        if (result.data && result.data.length > 0) {
          setSettings(result.data[0]);
        }
      } catch (error) {
        console.error("Error fetching App Settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <LuLoader className="animate-spin size-8 text-primary" />
        <span className="mt-4 text-default-500 font-medium tracking-wide">Loading system configurations...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="card p-10 text-center flex flex-col items-center gap-3">
        <LuSettings className="size-10 text-warning" />
        <h3 className="text-lg font-semibold text-default-800">No Settings Found</h3>
        <p className="text-default-500">The application settings could not be retrieved from the server.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Link href="/app-settings/edit" className="btn bg-primary text-white flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm hover:bg-primary/90 transition-all font-medium">
          <LuSquarePen className="size-4" /> Edit Settings
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      
      <SettingsGroupConfig title="Ride Booking & Payments" icon={LuCar}>
        <SettingItem label="Auto Accept Rides" value={settings.ride_auto_accept} />
        <SettingItem label="Scheduled Ride Auto Accept" value={settings.scheduled_ride_auto_accept_minutes} suffix="mins" />
        <SettingItem label="Default Cancellation Charge" value={settings.cancellation_charge_default} type="money" />
        <SettingItem label="Ask Payment Card" value={settings.ask_payment_card} />
        <SettingItem label="Card Required" value={settings.is_payment_card_required} />
        <SettingItem label="Card Required Before Ride" value={settings.is_payment_card_required_before_ride} />
        <SettingItem label="Actual Distance Based Cost" value={settings.actual_distance_based_ride_cost} />
      </SettingsGroupConfig>

      <SettingsGroupConfig title="Driver Timings & Assignment" icon={LuClock}>
        <SettingItem label="Availability Blocking" value={settings.driver_availability_blocking_enabled} />
        <SettingItem label="Ride Claim Timeout" value={settings.ride_claim_timeout_seconds} suffix="secs" />
        <SettingItem label="Assignment Auto Expire" value={settings.driver_assignment_auto_expire_minutes} suffix="mins" />
        <SettingItem label="Booking Expire Time" value={settings.driver_booking_expire_time} suffix="mins" />
        <SettingItem label="Pre-order Conf. Timeout" value={settings.driver_preorder_confirmation_timeout_minutes} suffix="mins" />
        <SettingItem label="Assignment Pre-order Expire" value={settings.driver_assignment_preorder_expire_minutes} suffix="mins" />
        <SettingItem label="Pre-Ride Block Time" value={settings.pre_ride_block_time_minutes} suffix="mins" />
        <SettingItem label="Post-Ride Block Time" value={settings.post_ride_block_time_minutes} suffix="mins" />
      </SettingsGroupConfig>

      <SettingsGroupConfig title="Driver Earnings & Commission" icon={LuBanknote}>
        <SettingItem label="Commission Transfer Delay" value={settings.driver_commission_transfer_delay_enabled} />
        <SettingItem label="Transfer Delay Time" value={settings.driver_commission_transfer_delay_minutes} suffix="mins" />
        <SettingItem label="Earnings Cutoff Feature" value={settings.driver_earnings_cutoff_feature} />
        <SettingItem label="Earnings Cutoff Date" value={settings.driver_earnings_cutoff_date} />
        <SettingItem label="Negative Balance Settlement" value={settings.negative_balance_settlement_percentage} suffix="%" />
      </SettingsGroupConfig>

      <SettingsGroupConfig title="Instant Withdrawals" icon={LuWallet}>
        <SettingItem label="Instant Withdrawal" value={settings.instant_withdrawal_enabled} />
        <SettingItem label="Charge Type" value={settings.instant_withdrawal_charge_type} />
        <SettingItem label="Charge Percentage" value={settings.instant_withdrawal_charge_percentage} suffix="%" />
        <SettingItem label="Charge Flat Amount" value={settings.instant_withdrawal_charge_flat} type="money" />
        <SettingItem label="Display Message" value={settings.instant_withdrawal_message} />
      </SettingsGroupConfig>

      <SettingsGroupConfig title="Location, Tracking & UI" icon={LuMapPin}>
        <SettingItem label="Sync Location Interval" value={settings.sync_location_interval} suffix="secs" />
        <SettingItem label="Sync Location Driver Moves" value={settings.sync_location_driver_moves} suffix="meters" />
        <SettingItem label="Boarding Del. Btn" value={settings.boarding_display_delete_btn} />
        <SettingItem label="Show Hourly" value={settings.show_hourly} />
        <SettingItem label="Wallet View Trans." value={settings.view_wallet_transaction} />
      </SettingsGroupConfig>

      <SettingsGroupConfig title="Notifications & Alerts" icon={LuBell}>
        <SettingItem label="Driver Accept Notification" value={settings.enable_driver_accept_notification} />
        <SettingItem label="Driver Cancel Notification" value={settings.enable_driver_cancellation_notification} />
        <SettingItem label="Notify Driver Before Finish" value={settings.notify_driver_before_ride_completion_minutes} suffix="mins" />
      </SettingsGroupConfig>
    </div>
  </div>
  );
};

export default AppSettings;
