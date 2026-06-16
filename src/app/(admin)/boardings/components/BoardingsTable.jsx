"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LuChevronLeft, LuChevronRight, LuCalendar, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuDownload } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import Flatpickr from 'react-flatpickr';
import { apiFetch } from '@/utils/api';

const BoardingsTable = () => {
  const { token } = useAuthContext();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rideId, setRideId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchBoardings = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        if (rideId) queryParams.append('rider_request_ids', rideId);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/boardings/?${queryParams}`, { token });
        setData(result.data || []);
        setTotalPages(result.total_pages || 1);
        setTotalCount(result.total_count || 0);
      } catch (error) {
        console.error("Error fetching boardings:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchBoardings, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, status, rideId, startDate, endDate, sortBy, order, token]);

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

  const handleExport = async () => {
    if (!token) return;
    setExporting(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('driver_name', search);
      if (rideId) queryParams.append('rider_request_ids', rideId);
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/boardings/export/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const contentDisposition = response.headers.get('content-disposition');
        let filename = `preauthorized_boardings_export_${new Date().getTime()}.xlsx`;
        if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) filename = match[1];
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Export failed with status", response.status);
      }
    } catch (error) {
      console.error("Error exporting boardings:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="card">
      <div className="p-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative w-48">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search rider/driver..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        {/* Ride ID Filter */}
        <div className="w-32">
          <input type="text" className="form-input form-input-sm w-full" placeholder="Ride Request ID..." value={rideId} onChange={(e) => { setRideId(e.target.value); setPage(1); }} />
        </div>

        {/* Status */}
        <div className="w-64">
          <select
            className="form-input form-input-sm w-full text-default-700"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">Status...</option>
            <option value="1">Pre-authorized / Not Captured</option>
            <option value="2">Pre-authorized / Captured</option>
            <option value="3">Not Pre-authorized / Not Captured</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="w-64">
          <div className="relative">
            <Flatpickr
              options={{ mode: 'range', dateFormat: 'Y-m-d' }}
              className="form-input form-input-sm w-full ps-9 text-default-500"
              placeholder="Select timestamp range"
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
        {(search || status || rideId || startDate || endDate) && (
          <button onClick={() => { setSearch(''); setStatus(''); setRideId(''); setStartDate(''); setEndDate(''); setPage(1); }} className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5">
            <LuCircleX className="size-4" /> Clear
          </button>
        )}

        <div className="ms-auto flex items-center">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-sm bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? <LuLoader className="size-4 animate-spin" /> : <LuDownload className="size-4" />}
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="overflow-auto max-h-[60vh] scroll-smooth">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-default-200">
              <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
                <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                  <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('id')}>Boarding ID {currentSortIcon('id')}</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('ride_id')}>Ride ID {currentSortIcon('ride_id')}</th>
                  <th className="px-3.5 py-3 text-start">Rider</th>
                  <th className="px-3.5 py-3 text-start">Driver</th>
                  <th className="px-3.5 py-3 text-center">Passengers</th>
                  <th className="px-3.5 py-3 text-start">Preauth Amt</th>
                  <th className="px-3.5 py-3 text-start">Payable Amt</th>
                  <th className="px-3.5 py-3 text-start">Is Preauth</th>
                  <th className="px-3.5 py-3 text-start">Is Captured</th>
                  <th className="px-3.5 py-3 text-start">Pay Source</th>
                  <th className="px-3.5 py-3 text-start">Driver Hold</th>
                  <th className="px-3.5 py-3 text-start">Transferred</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('boarded_at')}>Boarded At {currentSortIcon('boarded_at')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200">
                {loading ? (
                  <tr><td colSpan="13" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading boardings...</p></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="13" className="py-10 text-center text-default-500">No boardings found.</td></tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors cursor-pointer" onClick={() => router.push(`/rider-requests/${row.ride_id}`)}>
                      <td className="ps-4 py-3 font-semibold text-primary">#{row.id}</td>
                      <td className="px-3.5 py-3 font-semibold text-primary">#{row.ride_id}</td>
                      <td className="px-3.5 py-3"><div className="flex flex-col"><span className="font-semibold">{row.rider_info?.name || 'Unknown'}</span><span className="text-xs text-default-500">{row.rider_info?.phone_number || 'N/A'}</span></div></td>
                      <td className="px-3.5 py-3"><div className="flex flex-col"><span className="font-semibold">{row.driver_info?.name || 'Unknown'}</span><span className="text-xs text-default-500">{row.driver_info?.phone_number || 'N/A'}</span></div></td>
                      <td className="px-3.5 py-3 text-center">{row.passenger_count || 1}</td>
                      <td className="px-3.5 py-3 text-default-600">${parseFloat(row.preauthorized_amount || 0).toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-default-600 text-success font-medium">${parseFloat(row.payable_amount || 0).toFixed(2)}</td>
                      <td className="px-3.5 py-3">{row.is_preauthorized ? <span className="text-success font-semibold px-2 py-0.5 bg-success/10 border border-success/20 rounded-full text-xs">Yes</span> : <span className="text-default-400">No</span>}</td>
                      <td className="px-3.5 py-3">{row.is_payment_captured ? <span className="text-success font-semibold px-2 py-0.5 bg-success/10 border border-success/20 rounded-full text-xs">Yes</span> : <span className="text-default-400">No</span>}</td>
                      <td className="px-3.5 py-3 uppercase text-xs font-semibold tracking-wide text-default-600">{row.payment_source || '-'}</td>
                      <td className="px-3.5 py-3 text-warning font-medium">${parseFloat(row.driver_transfer_hold_amount || 0).toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-success font-medium">${parseFloat(row.transferred_driver_amount || 0).toFixed(2)}</td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-default-600 text-xs">{formatDate(row.boarded_at)}</td>
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
export default BoardingsTable;
