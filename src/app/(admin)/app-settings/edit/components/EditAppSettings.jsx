"use client";
import React, { useState, useEffect } from 'react';
import { LuSave, LuLoader, LuArrowLeft, LuCar, LuClock, LuBanknote, LuWallet, LuMapPin, LuBell, LuCircleCheck } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import Link from 'next/link';

// Helper input wrapper for mapping fields
const InputField = ({ label, value, onChange, type = "text", suffix, trueValue = "yes", falseValue = "no" }) => {
  if (type === "boolean") {
    return (
      <div className="flex items-center justify-between py-2 border-b border-default-200 last:border-0 hover:bg-default-50 transition-colors px-2 rounded -mx-2">
        <label className="text-sm font-medium text-default-700 cursor-pointer w-[60%] select-none leading-snug">{label}</label>
        <div className="flex items-center justify-end w-[40%]">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={value === trueValue || value === true || value === 'yes' || value === 'enabled' || value === 'show' || value === 'stripe_transaction'}
              onChange={(e) => onChange(e.target.checked ? trueValue : falseValue)}
            />
            <div className="w-9 h-5 bg-default-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between py-2 border-b border-default-200 last:border-0 hover:bg-default-50 transition-colors px-2 rounded -mx-2">
       <label className="text-sm font-medium text-default-700 whitespace-nowrap mr-4">{label}</label>
       <div className="flex items-center gap-1.5 w-full max-w-[50%]">
          <input 
            type={type === 'number' ? 'number' : 'text'}
            className="form-input form-input-sm w-full rounded-md border border-default-200 px-3 py-1.5 text-sm"
            value={value !== null && value !== undefined ? value : ''}
            onChange={(e) => onChange(type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
          />
          {suffix && <span className="text-xs font-semibold text-default-500 whitespace-nowrap bg-default-100 rounded px-1.5 py-1">{suffix}</span>}
       </div>
    </div>
  );
};

const SettingsGroupConfig = ({ title, icon: Icon, children }) => (
  <div className="card h-full">
    <div className="card-header border-b border-default-200 px-6 py-4 bg-default-50/50">
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

const EditAppSettings = () => {
   const { token } = useAuthContext();
   const [settings, setSettings] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [confirmSave, setConfirmSave] = useState(false);
   const [error, setError] = useState(null);
   const [success, setSuccess] = useState(false);

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
         setError("Failed to load settings from server.");
       } finally {
         setLoading(false);
       }
     };
     fetchSettings();
   }, [token]);

   const handleChange = (key, value) => {
     setSettings(prev => ({ ...prev, [key]: value }));
   };

   const handleSave = async () => {
     setSaving(true);
     setError(null);
     setSuccess(false);
     try {
        await apiFetch(`/api/v1/admin/system/app-settings/${settings.id}/`, {
          method: 'PUT',
          token,
          body: JSON.stringify(settings)
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
     } catch (err) {
        console.error("Failed to save", err);
        setError(err.message || "An error occurred while saving the configurations.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
     } finally {
        setSaving(false);
     }
   };

   if (loading) return <div className="p-20 flex flex-col items-center justify-center min-h-[50vh]"><LuLoader className="animate-spin size-10 text-primary" /><p className="mt-4 text-default-500 font-medium">Loading editable application settings...</p></div>;
   if (!settings && !loading) return <div className="p-10 text-center text-danger bg-danger/10 rounded-xl my-10 font-medium">Critical Error: No master settings profile available to edit.</div>;

   return (
      <div className="flex flex-col gap-6 relative">
         <div className="flex items-center justify-between">
           <Link href="/app-settings" className="btn bg-white border border-default-200 text-default-600 hover:bg-default-50 transition-colors flex items-center gap-2">
              <LuArrowLeft className="size-4" /> Go Back
           </Link>
         </div>

         {error && <div className="p-4 bg-danger/10 text-danger rounded-lg text-sm border border-danger/20 font-medium">{error}</div>}
         {success && <div className="p-4 bg-success/10 text-success rounded-lg text-sm flex items-center gap-2 border border-success/20 font-medium scale-100 transition-all shadow-sm"><LuCircleCheck className="size-5" /> Settings updated securely! Changes are now live.</div>}

         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
           <SettingsGroupConfig title="Ride Booking & Payments" icon={LuCar}>
              <InputField type="boolean" label="Auto Accept Rides" value={settings.ride_auto_accept} onChange={(val) => handleChange('ride_auto_accept', val)} />
              <InputField type="number" suffix="m" label="Scheduled Ride Auto Accept" value={settings.scheduled_ride_auto_accept_minutes} onChange={(val) => handleChange('scheduled_ride_auto_accept_minutes', val)} />
              <InputField type="number" suffix="$" label="Default Cancellation Charge" value={settings.cancellation_charge_default} onChange={(val) => handleChange('cancellation_charge_default', val)} />
              <InputField type="boolean" label="Ask Payment Card" value={settings.ask_payment_card} onChange={(val) => handleChange('ask_payment_card', val)} />
              <InputField type="boolean" label="Card Required" value={settings.is_payment_card_required} onChange={(val) => handleChange('is_payment_card_required', val)} />
              <InputField type="boolean" label="Card Required Before Ride" value={settings.is_payment_card_required_before_ride} onChange={(val) => handleChange('is_payment_card_required_before_ride', val)} />
              <InputField type="boolean" label="Actual Distance Based Cost" value={settings.actual_distance_based_ride_cost} onChange={(val) => handleChange('actual_distance_based_ride_cost', val)} />
           </SettingsGroupConfig>

           <SettingsGroupConfig title="Driver Timings & Assignment" icon={LuClock}>
              <InputField type="boolean" label="Availability Blocking Enabled" value={settings.driver_availability_blocking_enabled} onChange={(val) => handleChange('driver_availability_blocking_enabled', val)} trueValue="enabled" falseValue="disabled" />
              <InputField type="number" suffix="sec" label="Ride Claim Timeout" value={settings.ride_claim_timeout_seconds} onChange={(val) => handleChange('ride_claim_timeout_seconds', val)} />
              <InputField type="number" suffix="m" label="Assignment Auto Expire" value={settings.driver_assignment_auto_expire_minutes} onChange={(val) => handleChange('driver_assignment_auto_expire_minutes', val)} />
              <InputField type="number" suffix="m" label="Booking Expire Time" value={settings.driver_booking_expire_time} onChange={(val) => handleChange('driver_booking_expire_time', val)} />
              <InputField type="number" suffix="m" label="Pre-order Conf. Timeout" value={settings.driver_preorder_confirmation_timeout_minutes} onChange={(val) => handleChange('driver_preorder_confirmation_timeout_minutes', val)} />
              <InputField type="number" suffix="m" label="Assignment Pre-order Expire" value={settings.driver_assignment_preorder_expire_minutes} onChange={(val) => handleChange('driver_assignment_preorder_expire_minutes', val)} />
              <InputField type="number" suffix="m" label="Pre-Ride Block Time" value={settings.pre_ride_block_time_minutes} onChange={(val) => handleChange('pre_ride_block_time_minutes', val)} />
              <InputField type="number" suffix="m" label="Post-Ride Block Time" value={settings.post_ride_block_time_minutes} onChange={(val) => handleChange('post_ride_block_time_minutes', val)} />
           </SettingsGroupConfig>

           <SettingsGroupConfig title="Driver Earnings & Commission" icon={LuBanknote}>
               <InputField type="boolean" label="Commission Transfer Delay" value={settings.driver_commission_transfer_delay_enabled} onChange={(val) => handleChange('driver_commission_transfer_delay_enabled', val)} trueValue="enabled" falseValue="disabled" />
               <InputField type="number" suffix="m" label="Transfer Delay Time" value={settings.driver_commission_transfer_delay_minutes} onChange={(val) => handleChange('driver_commission_transfer_delay_minutes', val)} />
               <InputField type="boolean" label="Earnings Cutoff Feature" value={settings.driver_earnings_cutoff_feature} onChange={(val) => handleChange('driver_earnings_cutoff_feature', val)} trueValue="enabled" falseValue="disabled" />
               <InputField type="text" label="Earnings Cutoff Date" value={settings.driver_earnings_cutoff_date} onChange={(val) => handleChange('driver_earnings_cutoff_date', val)} />
               <InputField type="number" suffix="%" label="Negative Balance Settlement" value={settings.negative_balance_settlement_percentage} onChange={(val) => handleChange('negative_balance_settlement_percentage', val)} />
           </SettingsGroupConfig>

           <SettingsGroupConfig title="Instant Withdrawals" icon={LuWallet}>
               <InputField type="boolean" label="Instant Withdrawal Config" value={settings.instant_withdrawal_enabled} onChange={(val) => handleChange('instant_withdrawal_enabled', val)} trueValue="enabled" falseValue="disabled" />
               <InputField type="text" label="Charge Type" value={settings.instant_withdrawal_charge_type} onChange={(val) => handleChange('instant_withdrawal_charge_type', val)} />
               <InputField type="number" suffix="%" label="Charge Percentage" value={settings.instant_withdrawal_charge_percentage} onChange={(val) => handleChange('instant_withdrawal_charge_percentage', val)} />
               <InputField type="number" suffix="$" label="Charge Flat Amount" value={settings.instant_withdrawal_charge_flat} onChange={(val) => handleChange('instant_withdrawal_charge_flat', val)} />
               <InputField type="text" label="Display Message" value={settings.instant_withdrawal_message} onChange={(val) => handleChange('instant_withdrawal_message', val)} />
           </SettingsGroupConfig>

           <SettingsGroupConfig title="Location, Tracking & UI" icon={LuMapPin}>
               <InputField type="number" suffix="sec" label="Sync Location Interval" value={settings.sync_location_interval} onChange={(val) => handleChange('sync_location_interval', val)} />
               <InputField type="number" suffix="m" label="Sync Location Driver Moves" value={settings.sync_location_driver_moves} onChange={(val) => handleChange('sync_location_driver_moves', val)} />
               <InputField type="boolean" label="Boarding Del. Btn" value={settings.boarding_display_delete_btn} onChange={(val) => handleChange('boarding_display_delete_btn', val)} trueValue="show" falseValue="hide" />
               <InputField type="boolean" label="Show Hourly" value={settings.show_hourly} onChange={(val) => handleChange('show_hourly', val)} trueValue="yes" falseValue="no" />
               <InputField type="boolean" label="Wallet View Trans." value={settings.view_wallet_transaction} onChange={(val) => handleChange('view_wallet_transaction', val)} trueValue="stripe_transaction" falseValue="wallet_transaction" />
           </SettingsGroupConfig>

           <SettingsGroupConfig title="Notifications & Alerts" icon={LuBell}>
               <InputField type="boolean" label="Driver Accept Notification" value={settings.enable_driver_accept_notification} onChange={(val) => handleChange('enable_driver_accept_notification', val)} />
               <InputField type="boolean" label="Driver Cancel Notification" value={settings.enable_driver_cancellation_notification} onChange={(val) => handleChange('enable_driver_cancellation_notification', val)} />
               <InputField type="number" suffix="m" label="Notify Driver Before Finish" value={settings.notify_driver_before_ride_completion_minutes} onChange={(val) => handleChange('notify_driver_before_ride_completion_minutes', val)} />
           </SettingsGroupConfig>
         </div>
         
         <div className="flex justify-end mt-4 sticky bottom-6 z-50">
            <button onClick={() => setConfirmSave(true)} disabled={saving} className="btn bg-primary text-white flex items-center gap-2 px-8 py-3.5 rounded-full shadow-xl hover:bg-primary/90 hover:shadow-2xl transition-all font-semibold disabled:opacity-50 text-base">
                {saving ? <LuLoader className="animate-spin size-5" /> : <LuSave className="size-5" />} Save Settings
            </button>
         </div>

         {confirmSave && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
             <div className="relative w-full max-w-sm rounded-[1rem] bg-white shadow-2xl dark:bg-default-50 text-center scale-100 transition-all">
               <div className="flex flex-col items-center justify-center p-6 space-y-4">
                 <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                   <LuSave className="size-8 text-primary" />
                 </div>
                 <h3 className="text-xl font-bold text-default-800">Save Configuration?</h3>
                 <p className="text-sm text-default-500 max-w-[16rem]">
                   Are you sure you want to deploy these setting changes to the live application?
                 </p>
                 <div className="flex justify-center flex-row gap-3 w-full mt-4">
                   <button
                     type="button"
                     className="w-1/2 rounded-lg border border-default-200 bg-white px-5 py-2.5 text-sm font-medium text-default-700 hover:bg-default-100 transition-colors"
                     onClick={() => setConfirmSave(false)}
                   >
                     Cancel
                   </button>
                   <button
                     type="button"
                     onClick={() => { setConfirmSave(false); handleSave(); }}
                     className="w-1/2 flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                   >
                     Confirm
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}
      </div>
   );
};

export default EditAppSettings;
