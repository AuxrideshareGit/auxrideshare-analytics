"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LuChevronLeft, LuChevronRight, LuCalendar, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import Flatpickr from 'react-flatpickr';
import { apiFetch } from '@/utils/api';

const TransferDelaysTable = () => {
  const { token } = useAuthContext();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rideId, setRideId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateField, setDateField] = useState('created_at');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchDelays = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        if (rideId) queryParams.append('ride_id', rideId);
        if (driverId) queryParams.append('driver_id', driverId);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (dateField) queryParams.append('date_field', dateField);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/transfer-delays/?${queryParams}`, { token });
        setData(result.data || []);
        setTotalPages(result.total_pages || 1);
        setTotalCount(result.total_count || 0);
      } catch (error) {
        console.error("Error fetching transfer delays:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchDelays, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, status, rideId, driverId, startDate, endDate, dateField, sortBy, order, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const getStatusBadge = (statusObj, displayStr) => {
     const s = String(statusObj || '').toLowerCase();
     if (s.includes('fail') || s.includes('cancel')) return <span className="py-1 px-2.5 bg-danger/10 text-danger border border-danger/30 rounded-full text-xs font-bold uppercase">{displayStr || s}</span>;
     if (s.includes('not')) return <span className="py-1 px-2.5 bg-warning/10 text-warning border border-warning/30 rounded-full text-xs font-bold uppercase">{displayStr || s}</span>;
     if (s.includes('transferred') || s.includes('success')) return <span className="py-1 px-2.5 bg-success/10 text-success border border-success/30 rounded-full text-xs font-bold uppercase">{displayStr || s}</span>;
     return <span className="py-1 px-2.5 bg-default-100 text-default-700 border border-default-200 rounded-full text-xs font-bold uppercase">{displayStr || s}</span>;
  }

  return (
    <div className="card">
      <div className="p-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative w-48">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search driver..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        {/* Filters */}
        <div className="w-32">
          <input type="text" className="form-input form-input-sm w-full" placeholder="Ride ID..." value={rideId} onChange={(e) => { setRideId(e.target.value); setPage(1); }} />
        </div>
        <div className="w-32">
          <input type="text" className="form-input form-input-sm w-full" placeholder="Driver ID..." value={driverId} onChange={(e) => { setDriverId(e.target.value); setPage(1); }} />
        </div>
        <div className="w-32">
           <input type="text" className="form-input form-input-sm w-full" placeholder="Status..." value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} />
        </div>
        
        {/* Date Field Select */}
        <div className="w-40">
           <select className="form-input form-input-sm w-full" value={dateField} onChange={(e) => { setDateField(e.target.value); setPage(1); }}>
              <option value="created_at">Created At</option>
              <option value="transfer_at">Transfer At</option>
              <option value="actual_transfer_time">Actual Transfer</option>
           </select>
        </div>

        {/* Date Range */}
        <div className="w-64">
          <div className="relative">
            <Flatpickr
              options={{ mode: 'range', dateFormat: 'Y-m-d' }}
              className="form-input form-input-sm w-full ps-9 text-default-500"
              placeholder={`Range for ${dateField}`}
              value={startDate && endDate ? [startDate, endDate] : null}
              onChange={(dates) => {
                if (dates.length === 2) {
                  setStartDate(new Date(dates[0].getTime() - dates[0].getTimezoneOffset() * 60000).toISOString().split('T')[0]);
                  setEndDate(new Date(dates[1].getTime() - dates[1].getTimezoneOffset() * 60000).toISOString().split('T')[0]);
                  setPage(1);
                } else if (dates.length === 0) {
                  setStartDate(''); setEndDate(''); setPage(1);
                }
              }}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <LuCalendar className="size-4 text-default-500" />
            </div>
          </div>
        </div>

        {/* Clear */}
        {(search || status || rideId || driverId || startDate || endDate || dateField !== 'created_at') && (
          <button onClick={() => { setSearch(''); setStatus(''); setRideId(''); setDriverId(''); setStartDate(''); setEndDate(''); setDateField('created_at'); setPage(1); }} className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5">
            <LuCircleX className="size-4" /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-col">
        <div className="overflow-auto max-h-[60vh] scroll-smooth">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-default-200">
              <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
                <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                  <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('id')}>Delay ID {currentSortIcon('id')}</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('ride_id')}>Ride ID {currentSortIcon('ride_id')}</th>
                  <th className="px-3.5 py-3 text-start">Driver</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('status')}>Status {currentSortIcon('status')}</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('commission_amount')}>Amount {currentSortIcon('commission_amount')}</th>
                  <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('transfer_minutes_delay')}>Delay (Mins) {currentSortIcon('transfer_minutes_delay')}</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('transfer_at')}>Transfer At {currentSortIcon('transfer_at')}</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('actual_transfer_time')}>Actual Transfer {currentSortIcon('actual_transfer_time')}</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('created_at')}>Created At {currentSortIcon('created_at')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200">
                {loading ? (
                  <tr><td colSpan="9" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading delays...</p></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="9" className="py-10 text-center text-default-500">No transfer delays found.</td></tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors cursor-pointer" onClick={() => router.push(`/rider-requests/${row.ride_id || row.rider_request_id || row.rider_request}`)}>
                      <td className="ps-4 py-3 font-semibold text-primary">#{row.id}</td>
                      <td className="px-3.5 py-3 font-semibold text-primary">#{row.ride_id || row.rider_request_id || row.rider_request}</td>
                      <td className="px-3.5 py-3"><div className="flex flex-col"><span className="font-semibold">{row.driver_info?.name || 'Unknown'}</span><span className="text-xs text-default-500">{row.driver_info?.phone_number || 'N/A'}</span></div></td>
                      <td className="px-3.5 py-3">{getStatusBadge(row.status, row.status_display)}</td>
                      <td className="px-3.5 py-3 text-default-600 font-semibold">${parseFloat(row.commission_amount || 0).toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-default-600 text-center font-bold text-danger">{row.transfer_minutes_delay || 0}m</td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-default-500 text-xs">{formatDate(row.transfer_at)}</td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-default-500 text-xs">{formatDate(row.actual_transfer_time)}</td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-default-500 text-xs">{formatDate(row.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {!loading && totalCount > 0 && (
          <div className="card-footer p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-default-500 text-sm">Showing <b>{data.length}</b> of <b>{totalCount}</b></p>
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"><LuChevronLeft className="size-4 me-1" /> Prev</button>
              {getPageNumbers().map(p => (
                <button key={p} type="button" onClick={() => setPage(p)} className={`btn size-7.5 ${page === p ? 'bg-primary text-white border-primary' : 'bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10'}`}>{p}</button>
              ))}
              <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed">Next <LuChevronRight className="size-4 ms-1" /></button>
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
export default TransferDelaysTable;
