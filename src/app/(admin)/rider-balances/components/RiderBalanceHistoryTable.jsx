"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuFileText } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const RiderBalanceHistoryTable = () => {
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

        const result = await apiFetch(`/api/v1/admin/rider-negative-balance-history/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Rider Balance History:", error);
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
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search logs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
              <th className="ps-6 py-3 text-start">Rider Name</th>
              <th className="px-3.5 py-3 text-end cursor-pointer select-none" onClick={() => handleSort('amount')}>Amount Added {currentSortIcon('amount')}</th>
              <th className="px-3.5 py-3 text-end cursor-pointer select-none" onClick={() => handleSort('previous_balance')}>Previous Balance {currentSortIcon('previous_balance')}</th>
              <th className="px-3.5 py-3 text-end cursor-pointer select-none" onClick={() => handleSort('new_balance')}>New Balance {currentSortIcon('new_balance')}</th>
              <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('action_type')}>Action Type {currentSortIcon('action_type')}</th>
              <th className="px-3.5 py-3 text-start text-default-600">Added By</th>
              <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('created_at')}>Date Added {currentSortIcon('created_at')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {loading ? (
              <tr><td colSpan="7" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading history logs...</p></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="7" className="py-10 text-center text-default-500">No logs found.</td></tr>
            ) : (
              data.map((row) => (
                <React.Fragment key={row.id}>
                <tr onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)} className={`text-default-800 font-normal text-sm hover:bg-default-50 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-default-50' : ''}`}>
                  <td className="ps-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-default-800">{row.rider_info?.name || 'Unknown'}</span>
                      <span className="text-xs text-default-500">{row.rider_info?.phone_number || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-end font-bold text-default-700">
                    ${parseFloat(row.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-3.5 py-3 text-end text-default-600 font-medium">
                    ${parseFloat(row.previous_balance || 0).toFixed(2)}
                  </td>
                  <td className="px-3.5 py-3 text-end font-bold text-danger">
                    ${parseFloat(row.new_balance || 0).toFixed(2)}
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    <span className={`uppercase text-[10px] tracking-wider font-bold px-2 py-1 rounded ${row.action_type === 'edited' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                      {row.action_display || row.action_type}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-xs text-default-600 whitespace-nowrap">
                    {row.added_by_username || '-'}
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap text-default-700">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
                {expandedRow === row.id && (
                  <tr className="bg-primary/5 border-b border-default-200">
                    <td colSpan="7" className="p-0">
                      <div className="bg-default-50 p-4 w-full">
                        <table className="w-full max-w-2xl text-sm text-left border border-default-200 bg-white shadow-sm rounded-lg overflow-hidden">
                          <tbody>
                            <tr className="border-b border-default-200">
                              <th className="px-4 py-3 bg-default-100 text-default-600 font-semibold border-r border-default-200 w-1/4 align-top">Reason Title</th>
                              <td className="px-4 py-3 text-default-800 font-medium whitespace-pre-wrap">{row.title || <span className="text-default-400 italic">None</span>}</td>
                            </tr>
                            <tr className="border-b border-default-200">
                              <th className="px-4 py-3 bg-default-100 text-default-600 font-semibold border-r border-default-200 w-1/4 align-top">Detailed Reason</th>
                              <td className="px-4 py-3 text-default-700 whitespace-pre-wrap">{row.reason || <span className="text-default-400 italic">No detailed reason provided.</span>}</td>
                            </tr>
                            <tr>
                              <th className="px-4 py-3 bg-default-100 text-default-600 font-semibold border-r border-default-200 w-1/4 align-top">Associated Tags</th>
                              <td className="px-4 py-3 text-default-600 font-medium whitespace-pre-wrap">
                                 {row.action_type === 'edited' ? 'Admin Override' : 'System Auto-Charge'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
export default RiderBalanceHistoryTable;
