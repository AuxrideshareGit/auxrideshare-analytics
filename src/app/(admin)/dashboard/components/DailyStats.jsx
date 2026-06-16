'use client';

import React, { useMemo, useState } from 'react';
import ApexChartClient from '@/components/client-wrapper/ApexChartClient';
import EChartsClient from '@/components/client-wrapper/EChartsClient';
import { LuRefreshCw, LuUsers, LuSearch } from 'react-icons/lu';

// ─── Regular PieCard Options ─────────────────────────────────────────────────
const getPieOptions = (primaryColor, remainderColor, labels) => () => ({
    chart: { type: 'pie', toolbar: { show: false }, animations: { enabled: true } },
    labels: labels ?? ['Amount', 'Remaining'],
    colors: [primaryColor, remainderColor],
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: {
        enabled: true,
        y: {
            formatter: (val) => {
                if (typeof val !== 'number') return '$0.00';
                return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        }
    },
    states: { hover: { filter: { type: 'lighten', value: 0.1 } } },
    plotOptions: { pie: { expandOnClick: false } },
});

// Segment colors for driver split
const PURPLE_SHADES = [
    '#7c3aed', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe',
    '#8b5cf6', '#6d28d9', '#5b21b6', '#4c1d95', '#2e1065'
];

const AMBER_SHADES = [
    '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a',
    '#b45309', '#92400e', '#78350f', '#451a03', '#ea580c'
];

// ─── Drivers Donut Card Component ───────────────────────────────────────────
const DriversDonutCard = ({ title, drivers = [], totalAmount = 0, boardingCount = 0, loading, error, accentClass, chartId = 'drivers-donut-chart', colors, valueLabel = 'Amount', date, centerLabel = 'Total Transfer', height = '500px', searchTerm = '' }) => {

    const aggregatedDrivers = useMemo(() => {
        if (!Array.isArray(drivers)) return [];
        const map = new Map();
        drivers.forEach(d => {
            const rawPhone = (d?.phone_number || d?.driver_phone || '').replace(/\D/g, '').slice(-10);
            const rawName = (d?.name || d?.driver_name || 'Unknown').trim();
            const id = rawPhone ? `phone_${rawPhone}` : `name_${rawName.toLowerCase()}`;
            
            if (map.has(id)) {
                const existing = map.get(id);
                existing.temp_transfer_amount = (existing.temp_transfer_amount || 0) + Number(d?.transfer_amount ?? d?.total_amount ?? d?.transfer_hold_amount ?? 0);
                existing.temp_boarding_count = (existing.temp_boarding_count || 0) + Number(d?.boarding_count ?? d?.transfer_count ?? 0);
            } else {
                map.set(id, { 
                    ...d, 
                    name: rawName, // Normalize name field
                    temp_transfer_amount: Number(d?.transfer_amount ?? d?.total_amount ?? d?.transfer_hold_amount ?? 0),
                    temp_boarding_count: Number(d?.boarding_count ?? d?.transfer_count ?? 0)
                });
            }
        });

        return Array.from(map.values()).map(d => ({
            ...d,
            // Re-assign aggregated properties over original fields so standard accessors work
            transfer_amount: d.temp_transfer_amount,
            total_amount: d.temp_transfer_amount, // For fallback
            boarding_count: d.temp_boarding_count,
            transfer_count: d.temp_boarding_count
        }));
    }, [drivers]);

    const sortedDrivers = useMemo(() => {
        return [...aggregatedDrivers].sort((a, b) => (b?.transfer_amount ?? b?.total_amount ?? 0) - (a?.transfer_amount ?? a?.total_amount ?? 0));
    }, [aggregatedDrivers]);

    const seriesData = useMemo(() => {
        return sortedDrivers.map(d => {
            const val = d?.transfer_amount ?? d?.total_amount ?? d?.transfer_hold_amount ?? 0;
            return Number(Number(val).toFixed(2));
        });
    }, [sortedDrivers]);

    const labels = useMemo(() => {
        return sortedDrivers.map(d => d?.name || d?.driver_name || 'Unknown');
    }, [sortedDrivers]);

    const isNoData = seriesData.length === 0 || seriesData.every(v => v === 0);

    const echartsOption = useMemo(() => {
        const chartData = sortedDrivers.map(d => {
            const name = d?.name || d?.driver_name || 'Unknown';
            const value = Number(Number(d?.transfer_amount ?? d?.total_amount ?? d?.transfer_hold_amount ?? 0).toFixed(2));
            const phone = d?.phone_number || d?.driver_phone || '';
            const driver = d;

            let itemStyle = undefined;
            let label = undefined;
            let labelLine = undefined;

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const isMatch = name.toLowerCase().includes(searchLower) || phone.includes(searchTerm);
                if (!isMatch) {
                    itemStyle = { opacity: 0.15 };
                    label = { color: '#e2e8f0', fontWeight: 'normal' };
                    labelLine = { lineStyle: { opacity: 0.2 } };
                } else {
                    itemStyle = { opacity: 1, shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)', borderWidth: 3, borderColor: '#fff' };
                    label = { color: '#0f172a', fontWeight: 'bold', fontSize: 13 };
                    labelLine = { lineStyle: { opacity: 1, width: 2 } };
                }
            }

            return {
                name,
                value,
                driver,
                ...(itemStyle ? { itemStyle } : {}),
                ...(label ? { label } : {}),
                ...(labelLine ? { labelLine } : {})
            };
        });

        // Map to quickly find driver data for the legend
        const driverMap = new Map(sortedDrivers.map(d => [d?.name || d?.driver_name || 'Unknown', d]));

        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: 0,
                borderWidth: 0,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                formatter: (params) => {
                    const driver = params.data.driver;
                    const val = params.value;
                    const amountStr = val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const bCount = driver.boarding_count || driver.transfer_count || 0;
                    const phone = driver.phone_number || driver.driver_phone || 'N/A';

                    return `
                        <div style="padding: 10px; border-radius: 8px; font-family: inherit;">
                            <div style="font-weight: bold; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 4px; font-size: 13px;">
                                ${params.name}
                            </div>
                            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${phone}</div>
                            <div style="font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
                                <div style="display: flex; justify-content: space-between; gap: 20px;">
                                    <span style="color: #64748b;">${valueLabel}:</span>
                                    <span style="font-weight: 600; color: #334155;">$${amountStr}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; gap: 20px;">
                                    <span style="color: #64748b;">Boardings:</span>
                                    <span style="font-weight: 600; color: #334155;">${bCount}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: '2%',
                top: 45, // Moved down slightly for header
                bottom: 20,
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 14,
                textStyle: {
                    fontSize: 11,
                    color: '#64748b',
                    rich: {
                        name: { width: 120, fontSize: 11, fontWeight: 500 },
                        amount: { width: 70, align: 'right', fontSize: 11, fontWeight: 600, color: '#334155' },
                        count: { width: 40, align: 'right', fontSize: 11, fontWeight: 600, color: '#7c3aed' },
                        dimmedName: { width: 120, fontSize: 11, fontWeight: 500, color: '#cbd5e1' },
                        dimmedAmount: { width: 70, align: 'right', fontSize: 11, fontWeight: 600, color: '#cbd5e1' },
                        dimmedCount: { width: 40, align: 'right', fontSize: 11, fontWeight: 600, color: '#cbd5e1' }
                    }
                },
                formatter: (name) => {
                    const driver = driverMap.get(name);
                    const amount = (driver?.transfer_amount ?? driver?.total_amount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
                    const count = driver?.boarding_count || driver?.transfer_count || 0;
                    const dispName = name.length > 18 ? name.substring(0, 16) + '..' : name;

                    let isDimmed = false;
                    if (searchTerm) {
                        const searchLower = searchTerm.toLowerCase();
                        const phone = driver?.phone_number || driver?.driver_phone || '';
                        isDimmed = !(name.toLowerCase().includes(searchLower) || phone.includes(searchTerm));
                    }

                    if (isDimmed) {
                        return `{dimmedName|${dispName}}  {dimmedAmount|$${amount}}  {dimmedCount|${count}}`;
                    }
                    return `{name|${dispName}}  {amount|$${amount}}  {count|${count}}`;
                },
                pageIconColor: '#7c3aed',
                pageTextStyle: { color: '#64748b' }
            },
            colors: colors || ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16', '#1e293b'],
            series: [
                {
                    name: title,
                    type: 'pie',
                    radius: ['52%', '78%'],
                    center: ['35%', '50%'],
                    minAngle: 3,
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 6,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}',
                        fontSize: 10,
                        color: '#64748b',
                        minMargin: 5,
                        edgeDistance: '2%'
                    },
                    labelLine: {
                        show: true,
                        length: 15,
                        length2: 10,
                        smooth: true,
                        lineStyle: {
                            color: '#cbd5e1'
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 14,
                            fontWeight: 'bold',
                            formatter: '{d}%'
                        }
                    },
                    data: chartData
                }
            ],
            graphic: [
                // Center text group
                {
                    type: 'text',
                    left: '33%',
                    top: '46%',
                    style: {
                        text: centerLabel,
                        textAlign: 'center',
                        fill: '#64748b',
                        fontSize: 12,
                        fontWeight: 500
                    }
                },
                {
                    type: 'text',
                    left: '31%',
                    top: '51%',
                    style: {
                        text: `$${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                        textAlign: 'center',
                        fill: '#1e293b',
                        fontSize: 28,
                        fontWeight: 800
                    }
                },
                // Legend Headers
                {
                    type: 'text',
                    right: '2%', // Match legend right exactly
                    top: 15,
                    style: {
                        text: `{name|Driver Name} {amount|${centerLabel}} {count|Rides}`,
                        rich: {
                            // padding left 18 to account for legend icon (10) + textGap (8 approx)
                            name: { width: 120, fontSize: 10, fontWeight: 700, color: '#94a3b8', padding: [0, 0, 0, 18] },
                            amount: { width: 70, align: 'right', fontSize: 10, fontWeight: 700, color: '#94a3b8' },
                            count: { width: 40, align: 'right', fontSize: 10, fontWeight: 700, color: '#94a3b8' }
                        }
                    }
                }
            ]
        };
    }, [sortedDrivers, totalAmount, valueLabel, date, centerLabel, colors, title, searchTerm]);

    return (
        <div className="card h-full">
            <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-default-700">{title}</p>
                </div>

                {error ? (
                    <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-default-500 mb-4">
                            <span className="flex items-center gap-1.5 text-nowrap">
                                <LuUsers className="size-3.5 text-primary" />
                                <strong className="text-default-800">{drivers.length}</strong> Drivers
                            </span>
                            <span className="flex items-center gap-1.5 text-nowrap">
                                <span className={`inline-flex items-center justify-center size-5 rounded-full text-white text-[10px] font-bold ${accentClass}`}>
                                    {loading ? '...' : boardingCount}
                                </span>
                                Boardings
                            </span>
                        </div>

                        <div className="relative flex items-center justify-center" style={{ height: height }}>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-default-50/50 rounded-lg">
                                    <LuRefreshCw className="size-6 text-primary animate-spin" />
                                </div>
                            )}

                            {!loading && isNoData ? (
                                <div className="h-full w-full flex items-center justify-center text-default-400 text-sm italic border border-dashed border-default-200 rounded-xl">
                                    No results for this date
                                </div>
                            ) : !loading ? (
                                <EChartsClient
                                    option={echartsOption}
                                    style={{ height: height, width: '100%' }}
                                />
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


// ─── Drivers Bar Card Component ─────────────────────────────────────────────
const DriversBarCard = ({ title, drivers = [], totalAmount = 0, boardingCount = 0, loading, error, accentClass, chartId = 'drivers-to-be-paid-chart', colors = PURPLE_SHADES, valueLabel = 'Amount', date }) => {

    // 1. Sort drivers alphabetically by name
    const sortedDrivers = useMemo(() => {
        if (!Array.isArray(drivers)) return [];
        return [...drivers].sort((a, b) =>
            (a?.name || a?.driver_name || '').localeCompare(b?.name || b?.driver_name || '')
        );
    }, [drivers]);

    // 2. Data derivation with safety
    const seriesData = useMemo(() => {
        return sortedDrivers.map(d => {
            const val = d?.transfer_amount ?? d?.total_amount ?? d?.transfer_hold_amount ?? 0;
            return Number(Number(val).toFixed(2));
        });
    }, [sortedDrivers]);

    const labels = useMemo(() => {
        return sortedDrivers.map(d => {
            const name = d?.name || d?.driver_name || 'Unknown';
            const phone = d?.phone_number || d?.driver_phone || '';
            // Append last 4 digits of phone to ensure unique categories for ApexCharts
            const suffix = phone ? ` (${phone.replace(/\D/g, '').slice(-4)})` : '';
            return `${name}${suffix}`;
        });
    }, [sortedDrivers]);

    const isNoData = seriesData.length === 0 || seriesData.every(v => v === 0);

    // 2. Options derivation
    const options = useMemo(() => {
        return {
            chart: {
                type: 'bar',
                toolbar: { show: false },
                // Include a random suffix to ensure this instance is unique in the global registry
                id: `${chartId}-${date}-${Math.random().toString(36).substring(2, 7)}`,
                fontFamily: 'inherit',
                animations: { enabled: true }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '70%',
                    borderRadius: 4,
                    distributed: true,
                }
            },
            colors: colors,
            dataLabels: { enabled: false },
            xaxis: {
                categories: labels,
                labels: {
                    style: { fontSize: '10px' },
                    formatter: (val) => `$${val.toFixed(0)}`
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: {
                    style: { fontSize: '11px', fontWeight: 500 },
                    maxWidth: 140,
                }
            },
            grid: {
                strokeDashArray: 4,
                padding: { left: 0, right: 10 }
            },
            legend: { show: false },
            tooltip: {
                enabled: true,
                custom: ({ series, seriesIndex, dataPointIndex }) => {
                    const driver = sortedDrivers[dataPointIndex];
                    if (!driver) return '';
                    const val = series[seriesIndex][dataPointIndex] ?? 0;
                    const amountStr = val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const bCount = driver.boarding_count || driver.transfer_count || 0;
                    const phone = driver.phone_number || driver.driver_phone || 'N/A';

                    return `
                        <div class="bg-white dark:bg-default-50 p-2 shadow-lg border border-default-200 rounded-lg min-w-[150px]">
                            <div class="font-bold text-default-900 border-b border-default-100 pb-1 mb-1 text-xs">
                                ${driver.name || driver.driver_name || 'Unknown'}
                            </div>
                            <div class="text-[10px] text-default-400 mb-1">${phone}</div>
                            <div class="text-xs space-y-1">
                                <div class="flex items-center justify-between gap-4">
                                    <span class="text-default-500">${valueLabel}:</span>
                                    <span class="font-semibold text-default-800">$${amountStr}</span>
                                </div>
                                <div class="flex items-center justify-between gap-4">
                                    <span class="text-default-500">Boardings:</span>
                                    <span class="font-semibold text-default-800">${bCount}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
        };
    }, [sortedDrivers, labels, colors, chartId, valueLabel, date]);

    const series = useMemo(() => [{
        name: valueLabel,
        data: seriesData
    }], [seriesData, valueLabel]);

    return (
        <div className="card h-full">
            <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-default-700">{title}</p>
                    {!loading && !error && (
                        <span className="text-sm font-bold text-default-900">
                            Total: ${(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                <LuUsers className="size-3.5 text-primary" />
                                <strong className="text-default-800">{drivers.length}</strong> Drivers
                            </span>
                            <span className="flex items-center gap-1.5 text-nowrap">
                                <span className={`inline-flex items-center justify-center size-5 rounded-full text-white text-[10px] font-bold ${accentClass}`}>
                                    {loading ? '...' : boardingCount}
                                </span>
                                Boardings
                            </span>
                        </div>

                        {/* Fixed height scrollable container */}
                        <div className="relative h-[360px]">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-default-50/50 rounded-lg">
                                    <LuRefreshCw className="size-6 text-primary animate-spin" />
                                </div>
                            )}

                            {!loading && isNoData ? (
                                <div className="h-full w-full flex items-center justify-center text-default-400 text-sm italic border border-dashed border-default-200 rounded-xl">
                                    No results for this date
                                </div>
                            ) : !loading ? (
                                <div className="h-full overflow-y-auto">
                                    <ApexChartClient
                                        // Aggressive unique key: forced re-mount when ID, date, or data count changes.
                                        // Also includes data sum to ensure freshness if counts match but values differ.
                                        key={`${chartId}-${date}-${drivers.length}-${Math.round(totalAmount)}`}
                                        getOptions={() => options}
                                        series={series}
                                        type="bar"
                                        height={Math.max(360, drivers.length * 36)}
                                        width="100%"
                                    />
                                </div>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};



// ─── Standard PieCard ────────────────────────────────────────────────────────
const PieCard = ({ title, amount, boardings, series, primaryColor, remainderColor, labels, accentClass }) => (
    <div className="card h-full">
        <div className="card-body">
            <p className="text-sm font-semibold text-default-700 mb-3">{title}</p>
            <div className="flex items-center gap-5 text-xs text-default-500 mb-4">
                <span className="flex items-center gap-1.5 text-nowrap">
                    <span className="inline-block size-2.5 rounded-full" style={{ background: primaryColor }} />
                    Amount: <strong className="text-default-800">{amount}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-nowrap">
                    <span className={`inline-flex items-center justify-center size-5 rounded-full text-white text-[10px] font-bold ${accentClass}`}>
                        {boardings}
                    </span>
                    Boardings
                </span>
            </div>
            <div className="flex justify-center">
                <ApexChartClient
                    getOptions={getPieOptions(primaryColor, remainderColor, labels)}
                    series={series}
                    type="pie"
                    height={200}
                    width={220}
                />
            </div>
        </div>
    </div>
);

const GREEN_SHADES = [
    '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0',
    '#15803d', '#166534', '#14532d', '#052e16', '#022c22'
];

const DailyStats = ({ date, data, actualPaidData, loading, error }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Map Actual Paid drivers to the format expected by DriversPieCard
    const actualPaidDrivers = useMemo(() => {
        return actualPaidData?.driver_summaries?.map(d => ({
            name: d.driver_name,
            phone_number: d.driver_phone,
            driver_stripe_account_id: d.driver_stripe_account_id,
            transfer_amount: d.transfer_amount ?? d.total_amount ?? 0,
            boarding_count: d.transfer_count ?? 0
        })) || [];
    }, [actualPaidData]);

    // Calculate Mismatched Drivers (Expected vs Actual)
    const mismatchedResults = useMemo(() => {
        if (!data?.drivers && !actualPaidDrivers.length) return { drivers: [], totalAmount: 0, boardingCount: 0 };

        const expectedDrivers = data?.drivers || [];

        // Normalize phone number for robust matching (last 10 digits)
        const norm = (p) => (p || '').replace(/\D/g, '').slice(-10);

        // Get ID for matching: prefer phone number matching across different datasets
        const getId = (d) => {
            const p = norm(d?.phone_number || d?.driver_phone);
            if (p) return `phone_${p}`;
            // fallback to name
            const n = (d?.name || d?.driver_name || 'Unknown').trim().toLowerCase();
            return `name_${n}`;
        };

        const getAmt = (d) => Number(d?.transfer_amount ?? d?.total_amount ?? d?.transfer_hold_amount ?? 0);
        const getCount = (d) => Number(d?.boarding_count ?? d?.transfer_count ?? 0);

        // Aggregate actual drivers properly
        const actualDriversLookup = new Map();
        actualPaidDrivers.forEach(d => {
            const id = getId(d);
            if (actualDriversLookup.has(id)) {
                const existing = actualDriversLookup.get(id);
                existing.transfer_amount = (existing.transfer_amount || 0) + getAmt(d);
                existing.boarding_count = (existing.boarding_count || 0) + getCount(d);
            } else {
                actualDriversLookup.set(id, { ...d, transfer_amount: getAmt(d), boarding_count: getCount(d) });
            }
        });

        // Aggregate expected drivers properly
        const expectedDriversLookup = new Map();
        expectedDrivers.forEach(d => {
            const id = getId(d);
            if (expectedDriversLookup.has(id)) {
                const existing = expectedDriversLookup.get(id);
                existing.transfer_amount = (existing.transfer_amount || 0) + getAmt(d);
                existing.boarding_count = (existing.boarding_count || 0) + getCount(d);
            } else {
                expectedDriversLookup.set(id, { ...d, transfer_amount: getAmt(d), boarding_count: getCount(d) });
            }
        });

        const allIds = new Set([
            ...actualDriversLookup.keys(),
            ...expectedDriversLookup.keys()
        ]);

        const mismatchList = [];
        let totalMismatchAmount = 0;
        let totalMismatchBoardings = 0;

        allIds.forEach(id => {
            const exp = expectedDriversLookup.get(id);
            const act = actualDriversLookup.get(id);

            const expAmt = exp ? exp.transfer_amount : 0;
            const actAmt = act ? act.transfer_amount : 0;
            const diff = Math.abs(expAmt - actAmt);

            // If difference is more than 1 cent, it's a mismatch
            if (diff > 0.01) {
                const expCount = exp ? exp.boarding_count : 0;
                const actCount = act ? act.boarding_count : 0;
                const bDiff = Math.abs(expCount - actCount);
                mismatchList.push({
                    name: exp?.name || act?.name || act?.driver_name || 'Unknown',
                    phone_number: exp?.phone_number || act?.phone_number || act?.driver_phone || '',
                    driver_stripe_account_id: exp?.driver_stripe_account_id || act?.driver_stripe_account_id,
                    transfer_amount: diff, // The discrepancy amount
                    total_amount: diff,
                    boarding_count: bDiff
                });
                totalMismatchAmount += diff;
                totalMismatchBoardings += bDiff;
            }
        });

        return {
            drivers: mismatchList,
            totalAmount: totalMismatchAmount,
            boardingCount: totalMismatchBoardings
        };
    }, [data?.drivers, actualPaidDrivers]);

    return (
        <div className="mb-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                    {loading ? (
                        <h6 className="text-base font-semibold text-default-800 animate-pulse">
                            Loading stats for {date}...
                        </h6>
                    ) : (data?.date_range?.report_for_day && data?.date_range?.payout_target_date) ? (
                        <h6 className="text-base font-semibold text-default-800">
                            Ride from <strong className="text-default-700">{data.date_range.report_for_day}</strong> to <strong className="text-default-700">{data.date_range.payout_target_date}</strong>
                        </h6>
                    ) : (
                        <h6 className="text-base font-semibold text-default-800">
                            {date} Stats
                        </h6>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <LuSearch className="text-base text-default-400" />
                        </div>
                        <input
                            type="search"
                            className="form-input ps-10 pe-4 py-2 text-sm rounded-lg border-default-200 focus:border-primary focus:ring-primary w-full"
                            placeholder="Search driver by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {!loading && (
                        data?.date_range?.business_hours_note ? (
                            <span className="text-xs font-medium text-default-500 italic text-right max-w-xs sm:max-w-md">
                                {data.date_range.business_hours_note}
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-default-500 italic">
                                (Calculated based on business hours logic)
                            </span>
                        )
                    )}
                </div>
            </div>
            <div className="grid lg:grid-cols-3 grid-cols-1 gap-5">
                {/* Full Width Top Section: Drivers to be Paid - Donut Chart */}
                <div className="lg:col-span-3">
                    <DriversDonutCard
                        title="Drivers to be paid"
                        drivers={data?.drivers || []}
                        totalAmount={data?.hold_amount_summary?.total_amount || 0}
                        boardingCount={data?.hold_amount_summary?.boarding_count || 0}
                        loading={loading}
                        error={error}
                        accentClass="bg-violet-600"
                        chartId="drivers-to-be-paid-donut"
                        colors={PURPLE_SHADES}
                        date={date}
                        searchTerm={searchTerm}
                    />
                </div>

                {/* Bottom Section: Full Width Charts */}
                <div className="lg:col-span-3">
                    <DriversDonutCard
                        title="Actual drivers paid"
                        drivers={actualPaidDrivers}
                        totalAmount={actualPaidData?.total_commission_transferred || 0}
                        boardingCount={actualPaidData?.total_commission_count || 0}
                        loading={loading}
                        error={error}
                        accentClass="bg-green-600"
                        chartId="actual-drivers-paid-donut"
                        colors={GREEN_SHADES}
                        date={date}
                        height="400px"
                        searchTerm={searchTerm}
                    />
                </div>

                <div className="lg:col-span-3">
                    <DriversDonutCard
                        title="Mismatched"
                        drivers={mismatchedResults.drivers}
                        totalAmount={mismatchedResults.totalAmount}
                        boardingCount={mismatchedResults.boardingCount}
                        loading={loading}
                        error={error}
                        accentClass="bg-amber-500"
                        chartId="mismatched-drivers-donut"
                        colors={AMBER_SHADES}
                        valueLabel="Mismatch"
                        date={date}
                        centerLabel="Total Mismatched"
                        height="400px"
                        searchTerm={searchTerm}
                    />
                </div>
            </div>
        </div>
    );
};

export default DailyStats;
