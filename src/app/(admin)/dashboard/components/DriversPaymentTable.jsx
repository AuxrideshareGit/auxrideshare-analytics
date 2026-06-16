'use client';

import React, { useState } from 'react';
import { LuDownload, LuChevronDown, LuChevronRight } from 'react-icons/lu';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
    `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Derive a human-readable status and badge style from the driver row */
const getStatusInfo = (driver) => {
    const { status, to_be_paid_today, actually_paid_today_stripe } = driver;

    if (status === 'transferred') {
        return { label: 'Transferred', cls: 'bg-success/10 text-success border-success/30' };
    }
    if (actually_paid_today_stripe > 0 && to_be_paid_today === 0) {
        return { label: 'In Progress', cls: 'bg-info/10 text-info border-info/30' };
    }
    if (to_be_paid_today > 0) {
        return { label: 'Pending', cls: 'bg-warning/10 text-warning border-warning/30' };
    }
    return { label: 'On Hold', cls: 'bg-default-100 text-default-500 border-default-200' };
};

/** Derive an alert message comparing expected vs actually paid */
const getAlertInfo = (driver) => {
    const { to_be_paid_today, actually_paid_today_stripe, status } = driver;

    if (to_be_paid_today === 0 && actually_paid_today_stripe === 0) {
        return { label: '—', cls: 'text-default-400' };
    }

    // We only care about over paid if they were SCHEDULED to be paid today
    // Or if the payment wildly exceeds the hold amount.
    // In Michael Brown's case: scheduled $0.00, but actually paid $59.46.
    // If to_be_paid_today is empty (meaning they weren't strictly scheduled for payout *today*), 
    // it shouldn't be framed as an error unless it exceeds total hold.
    const diff = actually_paid_today_stripe - (to_be_paid_today || 0);

    if (Math.abs(diff) < 0.01) {
        return { label: 'All good', cls: 'text-success font-medium' };
    }

    // If they were paid more than they were scheduled to be paid today:
    if (diff > 0) {
        // Did they have any to_be_paid_today?
        if (to_be_paid_today === 0 && status === 'transferred') {
            return { label: `Paid ${fmt(diff)}`, cls: 'text-success font-medium' }; // It's just a payment
        }
        return { label: `Over paid ${fmt(diff)}`, cls: 'text-danger font-medium' };
    }

    // Under paid — only flag if it was supposed to be paid
    if (status === 'transferred') {
        return { label: `Under paid ${fmt(Math.abs(diff))}`, cls: 'text-warning font-medium' };
    }

    return { label: '—', cls: 'text-default-400' };
};

// ─── Component ────────────────────────────────────────────────────────────────

const DriversPaymentTable = ({ date, payoutBatchData, loading }) => {
    const [expandedDrivers, setExpandedDrivers] = useState(new Set());
    const dateRange = payoutBatchData?.date_range;
    const summary = payoutBatchData?.summary;
    const drivers = payoutBatchData?.drivers || [];

    const toggleExpand = (driverName) => {
        setExpandedDrivers(prev => {
            const next = new Set(prev);
            if (next.has(driverName)) {
                next.delete(driverName);
            } else {
                next.add(driverName);
            }
            return next;
        });
    };

    const renderTitle = () => {
        if (loading) return `Loading payments for ${date}...`;
        return (
            <div className="flex flex-col">
                <span>Driver Payouts for <span className="text-primary">{date}</span></span>
                {dateRange?.ride_batch_for_day && (
                    <p className="text-[10px] text-default-400 font-normal">
                        (Batch: {dateRange.ride_batch_for_day} → {dateRange.payout_target_date || date})
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="card mb-5">
            <div className="card-header flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                    <h6 className={`card-title truncate ${loading ? 'animate-pulse' : ''}`}>
                        {renderTitle()}
                    </h6>
                    {dateRange?.description && !loading && (
                        <span className="text-xs text-default-400 italic hidden sm:inline">
                            {dateRange.description}
                        </span>
                    )}
                </div>

                {/* Summary badges */}
                {summary && !loading && (
                    <div className="flex flex-wrap items-center gap-3 ms-auto text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 font-semibold border border-violet-200">
                            Hold: {fmt(summary.total_hold_amount)}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold border border-amber-200">
                            To Pay: {fmt(summary.total_to_be_paid_today)}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold border border-green-200">
                            Paid (Stripe): {fmt(summary.total_actual_stripe)}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-default-100 text-default-600 font-semibold border border-default-200">
                            {summary.driver_count} Drivers
                        </span>
                        <button
                            className="btn btn-sm border border-default-200 bg-transparent text-default-600 hover:bg-default-50 flex items-center gap-1.5"
                            disabled={loading}
                        >
                            <LuDownload className="size-3.5" />
                            Export
                        </button>
                    </div>
                )}
                {(!summary || loading) && (
                    <button
                        className="btn btn-sm border border-default-200 bg-transparent text-default-600 hover:bg-default-50 ms-auto flex items-center gap-1.5"
                        disabled={loading}
                    >
                        <LuDownload className="size-3.5" />
                        Export
                    </button>
                )}
            </div>

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-default-200">
                                <thead className="bg-default-100">
                                    <tr className="text-xs font-semibold text-default-500 whitespace-nowrap">
                                        <th className="px-3.5 py-3 text-start">#</th>
                                        <th className="px-3.5 py-3 text-start">Driver</th>
                                        <th className="px-3.5 py-3 text-start">Wallet Amount</th>
                                        <th className="px-3.5 py-3 text-start">Hold Amount</th>
                                        <th className="px-3.5 py-3 text-start">Boardings</th>
                                        <th className="px-3.5 py-3 text-start">To Be Paid Today</th>
                                        <th className="px-3.5 py-3 text-start">Actually Paid (Stripe)</th>
                                        {/* <th className="px-3.5 py-3 text-start">Scheduled #</th> */}
                                        <th className="px-3.5 py-3 text-start">Status</th>
                                        <th className="px-3.5 py-3 text-start">Alert</th>
                                        <th className="px-3.5 py-3 text-start">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-default-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="10" className="px-3.5 py-10 text-center text-default-400 italic animate-pulse">
                                                Fetching driver payout details...
                                            </td>
                                        </tr>
                                    ) : drivers.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="px-3.5 py-10 text-center text-default-400 italic">
                                                No driver payout data available for this date.
                                            </td>
                                        </tr>
                                    ) : (
                                        drivers.map((driver, idx) => {
                                            const { label: statusLabel, cls: statusCls } = getStatusInfo(driver);
                                            const { label: alertLabel, cls: alertCls } = getAlertInfo(driver);
                                            const isExpanded = expandedDrivers.has(driver.driver_name);
                                            return (
                                                <React.Fragment key={driver.driver_name + idx}>
                                                    <tr
                                                        onClick={() => toggleExpand(driver.driver_name)}
                                                        className={`text-default-800 text-sm font-normal ${idx % 2 === 1 ? 'bg-default-50' : ''} hover:bg-default-100 transition-colors cursor-pointer`}
                                                    >
                                                        <td className="px-3.5 py-2.5 text-default-400 text-xs">{idx + 1}</td>
                                                        <td className="px-3.5 py-2.5 whitespace-nowrap font-medium flex items-center gap-2">
                                                            {isExpanded ? <LuChevronDown className="text-default-400 size-4 shrink-0" /> : <LuChevronRight className="text-default-400 size-4 shrink-0" />}
                                                            {driver.driver_name}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 font-semibold text-violet-700">
                                                            {fmt(driver.driver_wallet_amount || 0)}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 font-semibold text-violet-700">
                                                            {fmt(driver.transfer_hold_amount || driver.transfer_amount || driver.total_amount)}
                                                        </td>
                                                        <td className="px-3.5 py-2.5">{driver.boarding_count}</td>
                                                        <td className="px-3.5 py-2.5 font-semibold text-amber-700">
                                                            {driver.to_be_paid_today > 0 ? fmt(driver.to_be_paid_today) : <span className="text-default-300">—</span>}
                                                        </td>
                                                        <td className="px-3.5 py-2.5 font-semibold text-green-700">
                                                            {driver.actually_paid_today_stripe > 0 ? fmt(driver.actually_paid_today_stripe) : <span className="text-default-300">—</span>}
                                                        </td>
                                                        {/* <td className="px-3.5 py-2.5 text-center">
                                                            {driver.scheduled_transfer_count > 0
                                                                ? <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{driver.scheduled_transfer_count}</span>
                                                                : <span className="text-default-300">—</span>
                                                            }
                                                        </td> */}
                                                        <td className="px-3.5 py-2.5">
                                                            <span className={`inline-flex items-center py-0.5 px-2.5 rounded text-xs font-medium border ${statusCls}`}>
                                                                {statusLabel}
                                                            </span>
                                                        </td>
                                                        <td className={`px-3.5 py-2.5 text-xs ${alertCls}`}>
                                                            {alertLabel}
                                                        </td>
                                                        <td className="px-3.5 py-2.5">
                                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                                {/* <button className="text-xs text-primary hover:underline font-medium">Pay now</button>
                                                                <span className="text-default-300">|</span>
                                                                <button className="text-xs text-default-500 hover:text-primary hover:underline font-medium">Details</button> */}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && driver.ride_details && driver.ride_details.length > 0 && (
                                                        <tr className="bg-default-50/50">
                                                            <td colSpan="10" className="px-0 py-0 border-b border-default-200">
                                                                <div className="px-5 py-4">
                                                                    <div className="rounded-lg border border-default-200 bg-white dark:bg-default-50 overflow-hidden shadow-sm">
                                                                        <table className="min-w-full divide-y divide-default-200">
                                                                            <thead className="bg-default-100/50">
                                                                                <tr className="text-xs font-semibold text-default-500 text-start">
                                                                                    <th className="px-4 py-2 text-start font-semibold">Ride ID</th>
                                                                                    <th className="px-4 py-2 text-start font-semibold">Pickup</th>
                                                                                    <th className="px-4 py-2 text-start font-semibold">Dropoff</th>
                                                                                    <th className="px-4 py-2 text-end font-semibold">Payable</th>
                                                                                    <th className="px-4 py-2 text-end font-semibold">Preauth</th>
                                                                                    <th className="px-4 py-2 text-end font-semibold">Hold Amount</th>
                                                                                    <th className="px-4 py-2 text-end font-semibold">Transferred</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-default-100 text-xs">
                                                                                {driver.ride_details.map(ride => (
                                                                                    <tr key={ride.ride_request_id} className="hover:bg-default-50 transition-colors">
                                                                                        <td className="px-4 py-2 font-medium text-default-700">#{ride.ride_request_id}</td>
                                                                                        <td className="px-4 py-2 max-w-[200px] truncate text-default-600" title={ride.pickup}>{ride.pickup}</td>
                                                                                        <td className="px-4 py-2 max-w-[200px] truncate text-default-600" title={ride.dropoff}>{ride.dropoff}</td>
                                                                                        <td className="px-4 py-2 text-end text-default-700">{fmt(ride.payable_amount)}</td>
                                                                                        <td className="px-4 py-2 text-end text-default-700">{fmt(ride.preauthorized_amount)}</td>
                                                                                        <td className="px-4 py-2 text-end font-semibold text-violet-600">{fmt(ride.driver_transfer_hold_amount)}</td>
                                                                                        <td className="px-4 py-2 text-end font-semibold text-green-600">{fmt(ride.transferred_driver_amount)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriversPaymentTable;
