'use client';

import React, { useEffect, useState } from 'react';
import { LuBanknote, LuRefreshCw, LuTrendingUp, LuWallet } from 'react-icons/lu';
import { getStripeBalance } from '@/utils/api';
import { useAuthContext } from '@/context/useAuthContext';

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

const BalanceCard = ({ icon: Icon, iconClass, bgClass, label, value, loading }) => (
    <div className="flex-1 min-w-[180px] border border-default-200 rounded-xl p-5 flex items-start gap-4">
        <div className={`shrink-0 flex items-center justify-center size-11 rounded-full ${bgClass}`}>
            <Icon className={`size-5 ${iconClass}`} />
        </div>
        <div>
            <p className="text-xs font-medium text-default-500 mb-1">{label}</p>
            {loading ? (
                <div className="h-7 w-28 bg-default-200 animate-pulse rounded-md" />
            ) : (
                <p className="text-2xl font-bold text-default-900 tabular-nums">{value}</p>
            )}
        </div>
    </div>
);

const StripeBalance = ({ headerSlot }) => {
    const { token } = useAuthContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBalance = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await getStripeBalance(token);
            setData(result);
        } catch (err) {
            setError(err.message || 'Failed to load Stripe balance.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <div className="card mb-5">
            <div className="card-header flex items-center justify-between flex-wrap gap-3">
                <h6 className="card-title flex items-center gap-2">
                    <LuBanknote className="size-4 text-primary" />
                    Stripe balance details
                </h6>
                <div className="flex items-center gap-3">
                    {headerSlot && <div className="w-56 md:w-64">{headerSlot}</div>}
                    <button
                        onClick={fetchBalance}
                        disabled={loading}
                        className="btn btn-sm border-default-200 text-default-500 hover:text-primary disabled:opacity-40 bg-transparent flex items-center justify-center size-8 p-0"
                        title="Refresh"
                    >
                        <LuRefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="card-body">
                {error ? (
                    <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-3">
                        {error}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        <BalanceCard
                            icon={LuWallet}
                            iconClass="text-primary"
                            bgClass="bg-primary/10"
                            label="Available Balance"
                            value={formatCurrency(data?.available_total)}
                            loading={loading}
                        />
                        <BalanceCard
                            icon={LuTrendingUp}
                            iconClass="text-warning"
                            bgClass="bg-warning/10"
                            label="Upcoming"
                            value={formatCurrency(data?.pending_total)}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StripeBalance;
