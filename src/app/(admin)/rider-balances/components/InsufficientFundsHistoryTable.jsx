"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const InsufficientFundsHistoryTable = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('boarded_at');
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
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/insufficient-funds-history/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Insufficient Funds History:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, sortBy, order, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  const currentSortIcon = (column) => {
    if (sortBy !== column) return null;
    return order === 'asc' ? <LuArrowUp className="size-3 inline ms-1" /> : <LuArrowDown className="size-3 inline ms-1" />;
  };

  const handleSort = (column) => {
    if (sortBy === column) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setOrder('asc'); }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-default-200">
        <div className="relative w-72">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search records..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }} className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5">
            <LuCircleX className="size-4" /> Clear
          </button>
        )}
      </div>

      <div className="overflow-auto max-h-[60vh] min-h-[400px]">
        <table className="min-w-full divide-y divide-default-200">
          <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
            <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
              <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('id')}>ID {currentSortIcon('id')}</th>
              <th className="px-3.5 py-3 text-start">Rider Info</th>
              <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('ride_id')}>Ride ID {currentSortIcon('ride_id')}</th>
              <th className="px-3.5 py-3 text-end cursor-pointer select-none" onClick={() => handleSort('pending_payment_amount')}>Pending Amount {currentSortIcon('pending_payment_amount')}</th>
              <th className="px-3.5 py-3 text-center">Status</th>
              <th className="px-3.5 py-3 text-start">Payment Intent ID</th>
              <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('boarded_at')}>Boarded At {currentSortIcon('boarded_at')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {loading ? (
              <tr><td colSpan="7" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading insufficient funds history...</p></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="7" className="py-10 text-center text-default-500">No records found.</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors">
                  <td className="ps-4 py-3 font-semibold text-primary">#{row.id}</td>
                  <td className="px-3.5 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-default-800">{row.rider_info?.name || 'Unknown'}</span>
                      <span className="text-xs text-default-500">{row.rider_info?.phone_number || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 font-medium text-default-600">
                    {row.ride_id ? `#${row.ride_id}` : '-'}
                  </td>
                  <td className="px-3.5 py-3 text-end font-bold text-danger">
                    ${parseFloat(row.pending_payment_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    <div className="flex justify-center">
                       {row.has_insufficient_funds ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-danger/10 text-danger text-[10px] font-bold uppercase tracking-widest">
                            <LuCircleX className="size-3.5" /> Insufficient
                          </div>
                       ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest">
                            Resolved
                          </div>
                       )}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-xs font-mono text-default-600">
                    {row.payment_intent_id || '-'}
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap text-default-700">
                    {formatDate(row.boarded_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && totalCount > 0 && (
          <div className="p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-default-50 mt-auto">
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
  );
};
export default InsufficientFundsHistoryTable;
