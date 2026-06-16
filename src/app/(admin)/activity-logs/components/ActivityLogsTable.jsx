"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuFileText } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const ActivityLogsTable = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
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

        const result = await apiFetch(`/api/v1/admin/system/activity-logs/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Activity Logs:", error);
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
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

  const renderLogTypeBadge = (logType) => {
    if (!logType) return null;
    const type = String(logType).toLowerCase();
    switch(type) {
       case 'info': return <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Info</span>;
       case 'error': return <span className="bg-danger/10 text-danger text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Error</span>;
       case 'warning': return <span className="bg-warning/10 text-warning text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Warn</span>;
       case 'success': return <span className="bg-success/10 text-success text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Success</span>;
       default: return <span className="bg-default-100 text-default-600 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">{type}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-default-200">
        <div className="relative w-80">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search activity contexts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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

      <div className="overflow-auto max-h-[70vh] min-h-[500px]">
        <table className="min-w-full divide-y divide-default-200">
          <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
            <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
              <th className="ps-6 py-3 text-start cursor-pointer select-none w-24" onClick={() => handleSort('id')}>ID {currentSortIcon('id')}</th>
              <th className="px-3.5 py-3 text-start w-2/5">Activity Description</th>
              <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('log_type')}>Log Type {currentSortIcon('log_type')}</th>
              <th className="px-3.5 py-3 text-start">Linked Users </th>
              <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('timestamp')}>Timestamp {currentSortIcon('timestamp')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {loading ? (
              <tr><td colSpan="5" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading activity logs...</p></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="5" className="py-10 text-center text-default-500">No activity logs found.</td></tr>
            ) : (
              data.map((row) => (
                <React.Fragment key={row.id}>
                <tr onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)} className={`text-default-800 font-normal text-sm hover:bg-default-50 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-default-50' : ''}`}>
                  <td className="ps-6 py-3 font-semibold text-primary">#{row.id}</td>
                  <td className="px-3.5 py-3">
                    <span className="font-semibold text-default-700 block max-w-xl break-words" title={row.description || '-'}>
                      {row.description || '-'}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    {renderLogTypeBadge(row.log_type)}
                  </td>
                  <td className="px-3.5 py-3">
                     <div className="flex flex-col gap-1 w-56">
                        {row.rider_info ? (
                           <div className="flex items-center gap-1.5 bg-slate-100 rounded px-2 py-1 text-xs">
                             <span className="font-bold text-slate-400 text-[10px] tracking-wider uppercase">Rider</span>
                             <span className="font-semibold text-slate-700 truncate">{row.rider_info.name || row.rider_info.phone_number}</span>
                           </div>
                        ) : <span className="text-default-400 text-xs italic disabled">No Rider</span>}
                        {row.driver_info ? (
                           <div className="flex items-center gap-1.5 bg-slate-100 rounded px-2 py-1 text-xs">
                             <span className="font-bold text-slate-400 text-[10px] tracking-wider uppercase">Driver</span>
                             <span className="font-semibold text-slate-700 truncate">{row.driver_info.name || row.driver_info.phone_number}</span>
                           </div>
                        ) : <span className="text-default-400 text-xs italic disabled">No Driver</span>}
                     </div>
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap text-default-700 font-mono text-xs">
                    {formatDate(row.timestamp)}
                  </td>
                </tr>
                {expandedRow === row.id && (
                  <tr className="bg-primary/5 border-b border-default-200">
                    <td colSpan="5" className="p-0">
                      <div className="bg-default-50 p-4 w-full flex flex-col xl:flex-row gap-4">
                        
                        {/* Summary & Identifiers */}
                        <div className="flex-1 max-w-sm flex flex-col gap-4">
                           <div className="bg-white border border-default-200 shadow-sm rounded-lg overflow-hidden">
                              <div className="bg-default-100 border-b border-default-200 px-4 py-2 flex items-center gap-2 text-default-700 font-semibold text-sm">
                                <LuFileText className="size-4" /> Relational Links
                              </div>
                              <div className="p-4 flex flex-col gap-3 text-sm">
                                 <div className="flex justify-between items-center bg-default-50 px-3 py-2 border border-default-100 rounded">
                                    <span className="text-xs uppercase tracking-widest font-bold text-default-500">Ride Request ID</span>
                                    <span className="font-semibold text-default-800">{row.ride_request || '-'}</span>
                                 </div>
                                 <div className="flex justify-between items-center bg-default-50 px-3 py-2 border border-default-100 rounded">
                                    <span className="text-xs uppercase tracking-widest font-bold text-default-500">Rider Profile ID</span>
                                    <span className="font-semibold text-default-800">{row.rider || '-'}</span>
                                 </div>
                                 <div className="flex justify-between items-center bg-default-50 px-3 py-2 border border-default-100 rounded">
                                    <span className="text-xs uppercase tracking-widest font-bold text-default-500">Driver Profile ID</span>
                                    <span className="font-semibold text-default-800">{row.driver || '-'}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Raw Data Append */}
                        <div className="flex-[2] bg-white border border-default-200 shadow-sm rounded-lg overflow-hidden flex flex-col">
                            <div className="bg-default-100 text-default-700 font-semibold text-sm px-4 py-2 border-b border-default-200">
                               Attached Data Context (JSON)
                            </div>
                            <div className="p-4 bg-default-50 flex-grow">
                               {row.data ? (
                                  <pre className="text-xs text-default-700 bg-white border border-default-200 p-4 rounded font-mono overflow-auto max-h-60 break-all whitespace-pre-wrap">
                                    {typeof row.data === 'object' ? JSON.stringify(row.data, null, 2) : String(row.data)}
                                  </pre>
                               ) : (
                                  <div className="text-default-400 italic text-sm text-center py-6">No data payload attached to this log.</div>
                               )}
                            </div>
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
export default ActivityLogsTable;
