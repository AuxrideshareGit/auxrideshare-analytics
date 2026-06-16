"use client";
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import { LuChevronDown, LuChevronUp, LuLoader, LuChevronLeft, LuChevronRight, LuMapPin, LuCheck, LuX, LuRefreshCw, LuUsers, LuSearch } from 'react-icons/lu';

const EChartsClient = dynamic(() => import('@/components/client-wrapper/EChartsClient'), { ssr: false });

// ─── City Donut Chart Options ──────────────────────────────────────────────────
const CITY_COLORS = [
  '#175ea1', '#2563eb', '#0ea5e9', '#06b6d4', '#0891b2',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
];

const DriverCard = ({ driver }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="card bg-white shadow-sm border border-default-200 mb-4 overflow-hidden rounded-lg">
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(driver.driver_name)}&background=random&color=fff&format=svg`} alt={driver.driver_name} className="size-12 rounded-full object-cover shadow-sm bg-default-100" />
            <div>
              <h4 className="text-lg font-bold text-default-900">{driver.driver_name}</h4>
              <p className="text-sm text-default-500">Driver ID: {driver.driver_id}</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#175ea1] hover:bg-[#124b82] text-white rounded-md transition-colors font-medium text-sm"
          >
            View Cities {expanded ? <LuChevronUp className="size-4" /> : <LuChevronDown className="size-4" />}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-default-200 flex flex-wrap justify-between items-center gap-4 text-sm divide-x divide-default-200">
          <div className="flex-1 flex justify-center items-center gap-3 pl-0">
            <span className="font-medium text-default-500">Total Rides:</span>
            <span className="font-bold text-default-900 text-base">{driver.total_rides}</span>
          </div>
          <div className="flex-1 flex justify-center items-center gap-3 pl-4">
            <span className="font-medium text-default-500">Completed:</span>
            <span className="font-bold text-default-900 text-base">{driver.completed_rides}</span>
          </div>
          <div className="flex-1 flex justify-center items-center gap-3 pl-4">
            <span className="font-medium text-default-500">Cancelled:</span>
            <span className={`font-bold text-base ${driver.cancelled_rides > 0 ? 'text-danger' : 'text-success'}`}>{driver.cancelled_rides}</span>
          </div>
          <div className="flex-1 flex justify-center items-center gap-3 pl-4">
            <span className="font-medium text-default-500">Last Ride:</span>
            <span className="font-bold text-default-900">{formatDate(driver.last_ride_date)}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="bg-default-50 p-5 border-t border-default-200 transition-all duration-300">
          <h5 className="font-semibold text-default-800 mb-3 text-sm">Ride Summary by City</h5>
          <div className="overflow-hidden border border-default-200 rounded-lg bg-white">
            <table className="min-w-full divide-y divide-default-200">
              <thead className="bg-[#f8f9fa]">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-default-600">City</th>
                  <th scope="col" className="px-5 py-3 text-center text-xs font-semibold text-default-600">Completed</th>
                  <th scope="col" className="px-5 py-3 text-center text-xs font-semibold text-default-600">Cancelled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200">
                {driver.cities && driver.cities.length > 0 ? (
                  driver.cities.map((city, idx) => (
                    <tr key={idx} className="hover:bg-default-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-default-800 font-medium">{city.city_name}</td>
                      <td className="px-5 py-3 text-sm text-center text-default-800 font-medium">{city.completed_rides}</td>
                      <td className={`px-5 py-3 text-sm text-center font-bold ${city.cancelled_rides > 0 ? 'text-danger text-opacity-80' : 'text-default-800'}`}>{city.cancelled_rides}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-5 py-5 text-center text-sm text-default-500">No city data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── City Stats Donut Chart ─────────────────────────────────────────────────────
const CityDonutChart = ({ chartData, totalRides, loading, searchTerm = '' }) => {

  const echartsOption = useMemo(() => {
    // Build a lookup map for all cities
    const cityMap = new Map(chartData.map(c => [c.city, c]));

    const data = chartData.map((c, i) => {
      const isMatch = !searchTerm || c.city.toLowerCase().includes(searchTerm.toLowerCase());
      return {
        name: c.city,
        value: c.total,
        itemStyle: {
          color: CITY_COLORS[i % CITY_COLORS.length],
          opacity: searchTerm ? (isMatch ? 1 : 0.12) : 1,
          ...(searchTerm && isMatch ? { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)', borderWidth: 3, borderColor: '#fff' } : {}),
        },
        label: searchTerm
          ? (isMatch
            ? { color: '#0f172a', fontWeight: 'bold', fontSize: 11 }
            : { color: '#e2e8f0', fontWeight: 'normal' })
          : {},
        labelLine: searchTerm
          ? { lineStyle: { opacity: isMatch ? 1 : 0.08 } }
          : {},
      };
    });

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255,255,255,0.97)',
        padding: 0,
        borderWidth: 0,
        shadowBlur: 12,
        shadowColor: 'rgba(0,0,0,0.12)',
        formatter: (params) => {
          const city = cityMap.get(params.name);
          return `
            <div style="padding:10px 14px;border-radius:8px;font-family:inherit;min-width:150px;">
              <div style="font-weight:700;color:#1e293b;border-bottom:1px solid #f1f5f9;padding-bottom:4px;margin-bottom:6px;font-size:13px;">${params.name}</div>
              <div style="font-size:12px;display:flex;flex-direction:column;gap:5px;">
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="color:#64748b;">Total:</span>
                  <span style="font-weight:600;color:#334155;">${params.value}</span>
                </div>
                ${city ? `
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="color:#64748b;">Completed:</span>
                  <span style="font-weight:600;color:#16a34a;">${city.completed}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="color:#64748b;">Cancelled:</span>
                  <span style="font-weight:600;color:#dc2626;">${city.cancelled}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:20px;">
                  <span style="color:#64748b;">Share:</span>
                  <span style="font-weight:600;color:#334155;">${params.percent}%</span>
                </div>
                ` : ''}
              </div>
            </div>
          `;
        }
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: '2%',
        top: 30,
        bottom: 20,
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 8,
        textStyle: {
          fontSize: 11,
          color: '#64748b',
          rich: {
            name:       { width: 130, fontSize: 11, fontWeight: 500 },
            count:      { width: 40, align: 'right', fontSize: 11, fontWeight: 600, color: '#334155' },
            dimName:    { width: 130, fontSize: 11, fontWeight: 500, color: '#cbd5e1' },
            dimCount:   { width: 40, align: 'right', fontSize: 11, fontWeight: 600, color: '#cbd5e1' },
          }
        },
        formatter: (name) => {
          const city = cityMap.get(name);
          const total = city ? city.total : 0;
          const dispName = name.length > 18 ? name.substring(0, 16) + '..' : name;
          const isDimmed = searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase());
          if (isDimmed) return `{dimName|${dispName}}  {dimCount|${total}}`;
          return `{name|${dispName}}  {count|${total}}`;
        },
        pageIconColor: '#175ea1',
        pageTextStyle: { color: '#64748b' },
      },
      series: [
        {
          name: 'City Rides',
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['35%', '52%'],
          minAngle: 1,
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}',
            fontSize: 10,
            color: '#64748b',
            minMargin: 4,
            edgeDistance: '2%',
          },
          labelLine: {
            show: true,
            length: 12,
            length2: 8,
            smooth: true,
            lineStyle: { color: '#cbd5e1' },
          },
          emphasis: {
            label: { show: true, fontSize: 13, fontWeight: 'bold', formatter: '{d}%' },
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
          },
          data,
        }
      ],
      graphic: [
        {
          type: 'text',
          left: '33%',
          top: '46%',
          style: { text: 'Total Rides', textAlign: 'center', fill: '#64748b', fontSize: 12, fontWeight: 500 },
        },
        {
          type: 'text',
          left: '32%',
          top: '52%',
          style: {
            text: totalRides.toLocaleString(),
            textAlign: 'center',
            fill: '#1e293b',
            fontSize: 26,
            fontWeight: 800,
          },
        },
      ],
    };
  }, [chartData, totalRides, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '380px' }}>
        <LuRefreshCw className="size-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center border border-dashed border-default-200 rounded-xl" style={{ height: '380px' }}>
        <p className="text-default-400 text-sm italic">No city data available</p>
      </div>
    );
  }

  return (
    <EChartsClient option={echartsOption} style={{ height: '380px', width: '100%' }} />
  );
};

// ─── City Stats Panel (right side) ─────────────────────────────────────────────
const CityStatsPanel = ({ cityStats, cityLoading }) => {
  const [cityPage, setCityPage] = useState(1);
  const [citySearch, setCitySearch] = useState('');   // table search
  const [chartSearch, setChartSearch] = useState(''); // chart highlight search
  const cityLimit = 10;

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cityStats.table || [];
    const q = citySearch.toLowerCase();
    return (cityStats.table || []).filter(c => c.city.toLowerCase().includes(q));
  }, [cityStats.table, citySearch]);

  const totalCityPages = Math.ceil(filteredCities.length / cityLimit);
  const paginatedCities = filteredCities.slice((cityPage - 1) * cityLimit, cityPage * cityLimit);

  const handleCitySearch = (e) => {
    setCitySearch(e.target.value);
    setCityPage(1);
  };

  const summary = cityStats.summary || {};

  return (
    <div className="flex flex-col gap-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#175ea1] text-white p-4 rounded-lg shadow-md flex flex-col gap-1">
          <span className="text-blue-200 text-xs font-medium">Total Cities</span>
          <span className="text-2xl font-bold">{cityLoading ? '...' : (summary.total_cities || 0).toLocaleString()}</span>
        </div>
        <div className="bg-[#1e293b] text-white p-4 rounded-lg shadow-md flex flex-col gap-1">
          <span className="text-slate-400 text-xs font-medium">Total Rides</span>
          <span className="text-2xl font-bold">{cityLoading ? '...' : (summary.total_rides || 0).toLocaleString()}</span>
        </div>
        <div className="bg-[#15803d] text-white p-4 rounded-lg shadow-md flex flex-col gap-1">
          <LuCheck className="size-4 text-green-300 mb-0.5" />
          <span className="text-green-200 text-xs font-medium">Completed</span>
          <span className="text-2xl font-bold">{cityLoading ? '...' : (summary.total_completed || 0).toLocaleString()}</span>
        </div>
        <div className="bg-[#dc2626] text-white p-4 rounded-lg shadow-md flex flex-col gap-1">
          <LuX className="size-4 text-red-300 mb-0.5" />
          <span className="text-red-200 text-xs font-medium">Cancelled</span>
          <span className="text-2xl font-bold">{cityLoading ? '...' : (summary.total_cancelled || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white border border-default-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3 gap-3">
          <p className="text-sm font-semibold text-default-700 flex items-center gap-2 shrink-0">
            <LuMapPin className="size-4 text-[#175ea1]" />
            Rides by City
            {!cityLoading && cityStats.table?.length > 0 && (
              <span className="text-xs text-default-500 bg-default-100 px-2 py-0.5 rounded-full font-normal">
                {cityStats.table.length} cities
              </span>
            )}
          </p>
          {/* Chart search — highlights slices */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">
              <svg className="size-3.5 text-default-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input
              type="search"
              className="form-input ps-8 pe-3 py-1.5 text-xs rounded-lg border-default-200 focus:border-primary focus:ring-primary w-40"
              placeholder="Highlight city..."
              value={chartSearch}
              onChange={(e) => setChartSearch(e.target.value)}
            />
          </div>
        </div>
        <CityDonutChart
          chartData={cityStats.table || []}
          totalRides={summary.total_rides || 0}
          loading={cityLoading}
          searchTerm={chartSearch}
        />
      </div>

      {/* City Table */}
      <div className="bg-white border border-default-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-default-200 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-default-700">City Breakdown</p>
          <input
            type="search"
            className="form-input form-input-sm text-xs rounded-md border-default-200 w-40 px-3 py-1.5"
            placeholder="Search city..."
            value={citySearch}
            onChange={handleCitySearch}
          />
        </div>

        <div className="overflow-auto max-h-[420px]">
          <table className="min-w-full divide-y divide-default-200">
            <thead className="bg-[#f8f9fa] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600">City</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-default-600">Total</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-green-700">✓</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-red-600">✗</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200">
              {cityLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <LuLoader className="animate-spin size-5 text-primary mx-auto" />
                  </td>
                </tr>
              ) : paginatedCities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-default-500">
                    {citySearch ? 'No cities match your search' : 'No city data available'}
                  </td>
                </tr>
              ) : (
                paginatedCities.map((city, idx) => {
                  const globalIdx = (cityPage - 1) * cityLimit + idx + 1;
                  const completedPct = city.total > 0 ? Math.round((city.completed / city.total) * 100) : 0;
                  return (
                    <tr key={city.city + idx} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-default-400 font-medium">{globalIdx}</td>
                      <td className="px-4 py-2.5 text-sm text-default-800 font-medium max-w-[130px] truncate" title={city.city}>{city.city}</td>
                      <td className="px-4 py-2.5 text-sm text-center font-bold text-default-900">{city.total}</td>
                      <td className="px-4 py-2.5 text-sm text-center font-semibold text-green-700">{city.completed}</td>
                      <td className="px-4 py-2.5 text-sm text-center font-semibold">
                        {city.cancelled > 0 ? (
                          <span className="text-red-600 font-bold">{city.cancelled}</span>
                        ) : (
                          <span className="text-default-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* City Table Pagination */}
        {!cityLoading && totalCityPages > 1 && (
          <div className="px-4 py-3 border-t border-default-200 flex items-center justify-between bg-[#fafafa]">
            <span className="text-xs text-default-500">
              Showing {(cityPage - 1) * cityLimit + 1}–{Math.min(cityPage * cityLimit, filteredCities.length)} of {filteredCities.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCityPage(p => Math.max(1, p - 1))}
                disabled={cityPage === 1}
                className="btn btn-sm size-7 border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-40 disabled:cursor-not-allowed p-0 flex items-center justify-center"
              >
                <LuChevronLeft className="size-3.5" />
              </button>
              <span className="text-xs font-medium text-default-700 px-2">{cityPage} / {totalCityPages}</span>
              <button
                onClick={() => setCityPage(p => Math.min(totalCityPages, p + 1))}
                disabled={cityPage === totalCityPages}
                className="btn btn-sm size-7 border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-40 disabled:cursor-not-allowed p-0 flex items-center justify-center"
              >
                <LuChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const Page = () => {
  const { token } = useAuthContext();

  // Driver stats state
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total_records: 0, total_pages: 1 });
  const [stats, setStats] = useState({ totalDrivers: 0, totalRides: 0, completed: 0, cancelled: 0 });

  // City stats state
  const [cityStats, setCityStats] = useState({ summary: {}, table: [], chart: { labels: [], datasets: {} } });
  const [cityLoading, setCityLoading] = useState(true);

  // Fetch driver ride-analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);

        const response = await apiFetch(`/api/v1/admin/driver-ride-stats/?${queryParams.toString()}`, { token });
        setData(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
        
        // Use backend stats, falling back to 0
        setStats({
          totalDrivers: response.total_drivers || 0,
          totalRides: response.total_rides || 0,
          completed: response.completed || 0,
          cancelled: response.cancelled || 0
        });
      } catch (error) {
        console.error("Failed to fetch ride analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [token, page, limit, search]);

  // Fetch city ride stats
  useEffect(() => {
    const fetchCityStats = async () => {
      if (!token) return;
      setCityLoading(true);
      try {
        const response = await apiFetch('/api/v1/admin/city-ride-stats/', { token });
        setCityStats({
          summary: response.summary || {},
          table: response.table || [],
          chart: response.chart || { labels: [], datasets: {} },
        });
      } catch (error) {
        console.error("Failed to fetch city ride stats:", error);
      } finally {
        setCityLoading(false);
      }
    };
    fetchCityStats();
  }, [token]);

  const handlePrev = () => { if (page > 1) setPage(page - 1); };
  const handleNext = () => { if (page < pagination.total_pages) setPage(page + 1); };
  const handleLimitChange = (e) => { setLimit(Number(e.target.value)); setPage(1); };

  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.total_pages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) { pages.push(i); }
    return pages;
  };

  return (
    <main>
      <div className="mb-6 w-full">
        <PageBreadcrumb title="Ride Analytics" subtitle="Analytics" />
      </div>

      {/* Driver summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#313a4f] text-white p-5 flex items-center justify-between shadow-md rounded-lg">
          <span className="text-slate-300 font-medium text-[15px]">Total Drivers:</span>
          <span className="text-xl font-bold">{stats.totalDrivers}</span>
        </div>
        <div className="bg-[#313a4f] text-white p-5 flex items-center justify-between shadow-md rounded-lg">
          <span className="text-slate-300 font-medium text-[15px]">Total Rides:</span>
          <span className="text-xl font-bold">{stats.totalRides.toLocaleString()}</span>
        </div>
        <div className="bg-[#313a4f] text-white p-5 flex items-center justify-between shadow-md rounded-lg">
          <span className="text-slate-300 font-medium text-[15px]">Completed:</span>
          <span className="text-xl font-bold">{stats.completed.toLocaleString()}</span>
        </div>
        <div className="bg-[#313a4f] text-white p-5 flex items-center justify-between shadow-md rounded-lg">
          <span className="text-slate-300 font-medium text-[15px]">Cancelled:</span>
          <span className="text-xl font-bold">{stats.cancelled.toLocaleString()}</span>
        </div>
      </div>

      {/* Two-column layout: Driver list (left) + City stats (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_680px] gap-6 items-start">

        {/* ── Left: Driver Analytics ── */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <LuUsers className="size-5 text-[#175ea1]" />
              <h2 className="text-base font-bold text-default-800">Driver Wise Stats</h2>
            </div>
            
            <div className="relative w-48 md:w-64">
              <input
                type="text"
                className="form-input form-input-sm ps-9 w-full rounded-md shadow-sm border-default-200"
                placeholder="Search driver by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <div className="absolute inset-y-0 start-0 flex items-center ps-3">
                <LuSearch className="size-3.5 text-default-400" />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm border border-default-200">
              <LuLoader className="animate-spin size-8 text-primary mb-4" />
              <p className="text-default-500">Loading ride analytics...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="card text-center py-20 px-6 shadow-sm border border-default-200 bg-white">
              <h3 className="text-xl font-semibold text-default-800">{search ? 'No Match Found' : 'No Data Found'}</h3>
              <p className="text-default-500 mt-2">
                {search ? `No driver analytics matching "${search}"` : 'There are no ride analytics records to display.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data.map(driver => (
                  <DriverCard key={driver.driver_id} driver={driver} />
                ))}
              </div>

              {pagination.total_records > 0 && (
                <div className="card mt-6 rounded-lg border border-default-200 shadow-sm bg-white">
                  <div className="card-footer p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-default-500 text-sm">
                      Showing <b>{data.length}</b> of <b>{pagination.total_records}</b> Results
                    </p>
                    <nav className="flex items-center gap-1.5" aria-label="Pagination">
                      <button
                        type="button"
                        onClick={handlePrev}
                        disabled={page === 1}
                        className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LuChevronLeft className="size-4 me-1" /> Prev
                      </button>

                      {getPageNumbers().map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`btn size-7.5 ${page === p ? 'bg-primary text-white border-primary' : 'bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10'}`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={page >= pagination.total_pages}
                        className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next <LuChevronRight className="size-4 ms-1" />
                      </button>
                    </nav>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-default-500">Per Page:</span>
                      <select
                        className="form-input form-input-sm w-16 px-2 py-1"
                        value={limit}
                        onChange={handleLimitChange}
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right: City Wise Stats ── */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <LuMapPin className="size-5 text-[#175ea1]" />
            <h2 className="text-base font-bold text-default-800">City Wise Stats</h2>
          </div>
          <CityStatsPanel cityStats={cityStats} cityLoading={cityLoading} />
        </div>

      </div>
    </main>
  );
};

export default Page;
