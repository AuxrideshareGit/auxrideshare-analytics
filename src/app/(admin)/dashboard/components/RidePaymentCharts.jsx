'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ApexChartClient from '@/components/client-wrapper/ApexChartClient';
import { getTransactionSum, getBoardingSummary } from '@/utils/api';
import { useAuthContext } from '@/context/useAuthContext';
import { LuRefreshCw } from 'react-icons/lu';

// ─── Multi-slice pie (Stripe + PayPal + remainder) ────────────────────────────
const getSplitPieOptions = (colors, labels) => ({
    chart: { type: 'pie', toolbar: { show: false }, animations: { enabled: true } },
    labels,
    colors,
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: { enabled: true, y: { formatter: (val) => `$${val.toLocaleString()}` } },
    states: { hover: { filter: { type: 'lighten', value: 0.05 } } },
    plotOptions: { pie: { expandOnClick: false } },
});

// ─── Constants ─────────────────────────────────────────────────────────────
const STRIPE_COLOR = '#4f46e5'; // Indigo/Blue for "Expected"
const PAYPAL_COLOR = '#7c3aed'; // Violet/Purple for "Expected"
const GATEWAY_STRIPE_COLOR = '#0d9488'; // Teal for "Received"
const GATEWAY_PAYPAL_COLOR = '#115e59'; // Dark Teal/Blue for "Received" (PayPal)
const REST_COLOR = '#e2e8f0';   // light grey remainder

const EXPECTED_COLORS = [STRIPE_COLOR, PAYPAL_COLOR];
const RECEIVED_COLORS = [GATEWAY_STRIPE_COLOR, GATEWAY_PAYPAL_COLOR];
const PIE_LABELS = ['Stripe', 'PayPal'];

// ─── Shared Split Card Component ─────────────────────────────────────────────
const SplitPieCard = ({ title, stripeAmount, paypalAmount, boardings, colors, loading, error, prefix = "$" }) => {
    const totalAmount = (stripeAmount || 0) + (paypalAmount || 0);
    const series = useMemo(() => [stripeAmount || 0, paypalAmount || 0], [stripeAmount, paypalAmount]);
    const isNoData = series.every(v => v === 0);

    const chartOptions = useMemo(() => getSplitPieOptions(colors, PIE_LABELS), [colors]);

    return (
        <div className="card h-full">
            <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-default-700">{title}</p>
                    {!loading && !error && !isNoData && (
                        <span className="text-sm font-bold text-default-900">
                            Total: {prefix}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    )}
                </div>

                {error ? (
                    <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-default-500 mb-4">
                            <span className="flex items-center gap-1.5 text-nowrap">
                                <span className="inline-block size-2.5 rounded-full" style={{ background: colors[0] }} />
                                Stripe: <strong className="text-default-800">{prefix}{(stripeAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                            </span>
                            <span className="flex items-center gap-1.5 text-nowrap">
                                <span className="inline-block size-2.5 rounded-full" style={{ background: colors[1] }} />
                                PayPal: <strong className="text-default-800">{prefix}{(paypalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                            </span>
                            <span className="flex items-center gap-1.5 text-nowrap">
                                <span className={`inline-flex items-center justify-center size-5 rounded-full text-white text-[10px] font-bold ${title.includes('expected') ? 'bg-indigo-500' : 'bg-teal-500'}`}>
                                    {loading ? '...' : boardings}
                                </span>
                                Boardings
                            </span>
                        </div>

                        <div className="flex justify-center relative">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-default-50/50 rounded-lg">
                                    <LuRefreshCw className="size-6 text-primary animate-spin" />
                                </div>
                            )}
                            {isNoData && !loading ? (
                                <div className="h-[200px] w-full flex items-center justify-center text-default-400 text-sm italic">
                                    No data for selected date
                                </div>
                            ) : (
                                <ApexChartClient
                                    key={`${title}-${loading}-${series.join(',')}`} // Force re-mount on data/loading change
                                    getOptions={chartOptions}
                                    series={series}
                                    type="pie"
                                    height={200}
                                    width={220}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const RidePaymentCharts = ({ selectedDate, commissionData, loadingCommon }) => {
    const { token } = useAuthContext();
    const [gatewayData, setGatewayData] = useState(null);
    const [boardingData, setBoardingData] = useState(null);
    const [loadingLocal, setLoadingLocal] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoadingLocal(true);
            setError('');
            try {
                const [gtRes, bdRes] = await Promise.all([
                    getTransactionSum(token, selectedDate),
                    getBoardingSummary(token, selectedDate)
                ]);
                setGatewayData(gtRes);
                setBoardingData(bdRes);
            } catch (err) {
                setError(err.message || 'Failed to load data.');
            } finally {
                setLoadingLocal(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token, selectedDate]);

    // Use common loading for header, local loading for chart content
    const isHeadingLoading = loadingCommon || !commissionData;
    const isChartLoading = loadingLocal;

    return (
        <div className="mb-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h6 className="text-base font-semibold text-default-800">
                    Stats for <span className="text-primary">{selectedDate}</span>
                </h6>
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
                {/* Amount expected from rides — Split by Stripe/PayPal */}
                <SplitPieCard
                    title="Amount expected from rides"
                    stripeAmount={boardingData?.stripe?.total_amount}
                    paypalAmount={boardingData?.paypal?.total_amount}
                    boardings={boardingData?.total?.boarding_count || 0}
                    colors={EXPECTED_COLORS}
                    loading={isChartLoading}
                    error={error}
                />

                {/* Received in payment gateways — Split by Stripe/PayPal */}
                <SplitPieCard
                    title="Received in payment gateways"
                    stripeAmount={gatewayData?.stripe?.total_sum}
                    paypalAmount={gatewayData?.paypal?.total_sum}
                    boardings={(gatewayData?.stripe?.transaction_count || 0) + (gatewayData?.paypal?.transaction_count || 0)}
                    colors={RECEIVED_COLORS}
                    loading={isChartLoading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default RidePaymentCharts;
