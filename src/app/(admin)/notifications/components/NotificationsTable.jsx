"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuCalendar, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import Flatpickr from 'react-flatpickr';
import { apiFetch } from '@/utils/api';

const NotificationsTable = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/system/notifications/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, startDate, endDate, sortBy, order, token]);

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

  return (
    <div className="card">
      <div className="p-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative w-72">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search user, title, msg..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
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
        {(search || startDate || endDate) && (
          <button onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setPage(1); }} className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5">
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
                   <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('id')}>ID {currentSortIcon('id')}</th>
                  <th className="px-3.5 py-3 text-start">From</th>
                  <th className="px-3.5 py-3 text-start">To</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('title')}>Title {currentSortIcon('title')}</th>
                  <th className="px-3.5 py-3 text-start">Message</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('timestamp')}>Timestamp {currentSortIcon('timestamp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200">
                {loading ? (
                  <tr><td colSpan="6" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading Notifications...</p></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="6" className="py-10 text-center text-default-500">No Notifications found.</td></tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors">
                      <td className="ps-4 py-3 font-semibold text-primary">#{row.id}</td>
                      <td className="px-3.5 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">{(row.from_user_info || row.from_user)?.name || 'System'}</span>
                          <span className="text-xs text-default-500">{(row.from_user_info || row.from_user)?.phone_number || (row.from_user_info || row.from_user)?.email || ''}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">{(row.to_user_info || row.to_user)?.name || 'Unknown'}</span>
                          <span className="text-xs text-default-500">{(row.to_user_info || row.to_user)?.phone_number || (row.to_user_info || row.to_user)?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-default-700 font-medium max-w-[200px] truncate">{row.title}</td>
                      <td className="px-3.5 py-3 text-default-600 max-w-xs truncate" title={row.message}>{row.message}</td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-default-600 text-xs">{formatDate(row.timestamp || row.created_at)}</td>
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
export default NotificationsTable;
