"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuCheck, LuX, LuMonitorSmartphone, LuCar, LuUser } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const CouponCodesTable = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/system/coupon-codes/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Coupon Codes:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, sortBy, order, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const currentSortIcon = (column) => {
    if (sortBy !== column) return null;
    return order === 'asc' ? <LuArrowUp className="size-3 inline ms-1" /> : <LuArrowDown className="size-3 inline ms-1" />;
  };

  const handleSort = (column) => {
    if (sortBy === column) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setOrder('asc'); }
  };

  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const formatValue = (type, value) => {
    if (type === 'percentage') return `${parseFloat(value || 0).toFixed(2)}%`;
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  return (
    <div className="card">
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-default-200">
        {/* Search */}
        <div className="relative w-72">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search code or assigned user..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        {/* Clear */}
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }} className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5">
            <LuCircleX className="size-4" /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-col">
        <div className="overflow-auto max-h-[60vh] min-h-[400px]">
          <table className="min-w-full divide-y divide-default-200">
            <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
              <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('id')}>ID {currentSortIcon('id')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('code')}>Code {currentSortIcon('code')}</th>
                <th className="px-3.5 py-3 text-start">Assigned To</th>
                <th className="px-3.5 py-3 text-start">Discount</th>
                <th className="px-3.5 py-3 text-start">Discount Type</th>
                <th className="px-3.5 py-3 text-start">Commission</th>
                <th className="px-3.5 py-3 text-center">Status</th>
                <th className="px-3.5 py-3 text-center">Allowed Booking</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('expires_at')}>Expires {currentSortIcon('expires_at')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('created_at')}>Created At {currentSortIcon('created_at')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200">
              {loading ? (
                <tr><td colSpan="10" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading Coupon Codes...</p></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="10" className="py-10 text-center text-default-500">No Coupon Codes found.</td></tr>
              ) : (
                data.map((row) => (
                  <React.Fragment key={row.id}>
                  <tr onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)} className={`text-default-800 font-normal text-sm hover:bg-default-50 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-default-50' : ''}`}>
                    <td className="ps-4 py-3 font-semibold text-primary">#{row.id}</td>
                    <td className="px-3.5 py-3">
                      <span className="bg-primary/10 text-primary border border-primary/20 rounded px-2 py-1 font-mono font-bold tracking-widest">{row.code}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      {row.assigned_to ? (
                        <span className="font-semibold text-default-700">{row.assigned_to}</span>
                      ) : (
                        <span className="italic text-default-400">Everyone</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-success">
                      {row.discount_value > 0 ? formatValue(row.discount_type, row.discount_value) : '0'}
                    </td>
                    <td className="px-3.5 py-3 text-default-600 capitalize">
                      {row.discount_type || 'N/A'}
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-warning">
                      {row.commission_value > 0 ? formatValue(row.commission_type, row.commission_value) : '0'}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${row.status === 'active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-3">
                       <div className="flex flex-col items-center justify-center gap-1.5 text-default-400">
                          <div className={`flex items-center w-20 justify-center gap-1.5 px-2 py-0.5 rounded font-semibold text-xs ${row.valid_for_rider_booking ? 'bg-success/10 text-success' : 'bg-default-100 text-default-400'}`}>
                            <LuUser className="size-3.5" /> Rider
                          </div>
                          <div className={`flex items-center w-20 justify-center gap-1.5 px-2 py-0.5 rounded font-semibold text-xs ${row.valid_for_driver_booking ? 'bg-primary/10 text-primary' : 'bg-default-100 text-default-400'}`}>
                            <LuCar className="size-3.5" /> Driver
                          </div>
                          <div className={`flex items-center w-20 justify-center gap-1.5 px-2 py-0.5 rounded font-semibold text-xs ${row.valid_for_web_booking ? 'bg-purple-500/10 text-purple-500' : 'bg-default-100 text-default-400'}`}>
                            <LuMonitorSmartphone className="size-3.5" /> Web
                          </div>
                       </div>
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-default-700">
                      {row.expires_at ? formatDate(row.expires_at) : <span className="italic text-default-400">Never Expires</span>}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-default-700">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr className="bg-primary/5">
                      <td colSpan="10" className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="flex flex-col gap-1 shadow-sm bg-white p-3 rounded border border-default-200">
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Min Passengers</span>
                            <span className="text-sm font-semibold text-default-800">{row.min_passengers !== null ? row.min_passengers : <span className="text-default-400 italic font-mono">Any</span>}</span>
                          </div>
                          <div className="flex flex-col gap-1 shadow-sm bg-white p-3 rounded border border-default-200">
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Max Passengers</span>
                            <span className="text-sm font-semibold text-default-800">{row.max_passengers !== null ? row.max_passengers : <span className="text-default-400 italic font-mono">Any</span>}</span>
                          </div>
                          <div className="flex flex-col gap-1 shadow-sm bg-white p-3 rounded border border-default-200">
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Min Distance</span>
                            <span className="text-sm font-semibold text-default-800">{row.min_distance !== null ? `${row.min_distance} miles` : <span className="text-default-400 italic font-mono">Any</span>}</span>
                          </div>
                          <div className="flex flex-col gap-1 shadow-sm bg-white p-3 rounded border border-default-200">
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Max Distance</span>
                            <span className="text-sm font-semibold text-default-800">{row.max_distance !== null ? `${row.max_distance} miles` : <span className="text-default-400 italic font-mono">Any</span>}</span>
                          </div>
                          <div className="flex flex-col gap-1 shadow-sm bg-white p-3 rounded border border-default-200">
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Per User Limit</span>
                            <span className="text-sm font-semibold text-default-800">{row.per_user_limit !== null ? row.per_user_limit : <span className="text-default-400 italic font-mono">No Limit</span>}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalCount > 0 && (
           <div className="card-footer p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-default-50">
            <p className="text-default-500 text-sm">Showing <b>{data.length}</b> of <b>{totalCount}</b></p>
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-sm border bg-white border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"><LuChevronLeft className="size-4 me-1" /> Prev</button>
              {getPageNumbers().map(p => (
                <button key={p} type="button" onClick={() => setPage(p)} className={`btn size-7.5 ${page === p ? 'bg-primary text-white border-primary' : 'bg-white border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10'}`}>{p}</button>
              ))}
              <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn btn-sm border bg-white border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed">Next <LuChevronRight className="size-4 ms-1" /></button>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">Per Page:</span>
              <select className="form-input form-input-sm w-16 px-2 py-1" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CouponCodesTable;
