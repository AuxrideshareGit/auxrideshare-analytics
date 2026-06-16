"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuCheck, LuFile, LuTerminal } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const ErrorLogsTable = () => {
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

        const result = await apiFetch(`/api/v1/admin/system/error-logs/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Error Logs:", error);
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-default-200">
        <div className="relative w-80">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search exceptions or messages..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
              <th className="ps-6 py-3 text-start cursor-pointer select-none w-20" onClick={() => handleSort('id')}>ID {currentSortIcon('id')}</th>
              <th className="px-3.5 py-3 text-start w-2/5">Error Context</th>
              <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('flow_type')}>Flow & Location {currentSortIcon('flow_type')}</th>
              <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('is_resolved')}>Resolution {currentSortIcon('is_resolved')}</th>
              <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('created_at')}>Created At {currentSortIcon('created_at')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {loading ? (
              <tr><td colSpan="5" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading error logs...</p></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="5" className="py-10 text-center text-default-500">No errors logged. Everything is stable!</td></tr>
            ) : (
              data.map((row) => (
                <React.Fragment key={row.id}>
                <tr onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)} className={`text-default-800 font-normal text-sm hover:bg-default-50 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-default-50' : ''}`}>
                  <td className="ps-6 py-3 font-semibold text-danger">#{row.id}</td>
                  <td className="px-3.5 py-3">
                     <div className="flex flex-col gap-1 max-w-lg">
                        <span className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-0.5">{row.error_type_display || row.error_type || 'System Error'}</span>
                        <span className="font-semibold text-default-800 break-words leading-tight" title={row.error_message}>
                          {row.error_message?.length > 100 ? `${row.error_message.substring(0, 100)}...` : row.error_message || 'No explicit exception message'}
                        </span>
                     </div>
                  </td>
                  <td className="px-3.5 py-3">
                     <div className="flex flex-col gap-1 max-w-[250px]">
                        <span className="font-semibold text-default-700">{row.flow_type_display || row.flow_type || 'Unspecified Flow'}</span>
                        <span className="text-xs text-default-500 truncate" title={`${row.file_name}:${row.line_number}`}>
                           {row.file_name ? `${row.file_name.split('/').pop()}:${row.line_number}` : 'Unknown origin'}
                        </span>
                     </div>
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    {row.is_resolved ? (
                       <span className="flex items-center justify-center gap-1.5 px-2 py-1 rounded bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest">
                         <LuCheck className="size-3.5" /> Resolved
                       </span>
                    ) : (
                       <span className="flex items-center justify-center gap-1.5 px-2 py-1 rounded bg-danger/10 text-danger text-[10px] font-bold uppercase tracking-widest">
                         <LuCircleX className="size-3.5" /> Pending
                       </span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap text-default-700 font-mono text-xs">
                    {formatDate(row.created_at)}
                  </td>
                </tr>
                {expandedRow === row.id && (
                  <tr className="bg-danger/5 border-b border-default-200">
                    <td colSpan="5" className="p-0">
                      <div className="p-6 flex flex-col xl:flex-row gap-6">
                        
                        {/* Summary & Connectivity Frame */}
                        <div className="flex-[1] flex flex-col gap-4">
                           <div className="bg-white border border-danger/20 shadow-sm rounded-lg overflow-hidden">
                              <div className="bg-danger/10 text-danger border-b border-danger/20 px-4 py-2 flex items-center gap-2 font-bold text-sm tracking-wide">
                                <LuFile className="size-4" /> System Environment
                              </div>
                              <div className="p-4 flex flex-col gap-3 text-sm">
                                 <div className="flex justify-between items-center bg-default-50 px-3 py-2 border border-default-100 rounded">
                                    <span className="text-xs uppercase tracking-widest font-bold text-default-500">Method</span>
                                    <span className="font-mono font-semibold text-default-800">{row.error_details?.extra_data?.method || row.request_method || '-'}</span>
                                 </div>
                                 <div className="flex justify-between items-center bg-default-50 px-3 py-2 border border-default-100 rounded">
                                    <span className="text-xs uppercase tracking-widest font-bold text-default-500">Origin IP</span>
                                    <span className="font-mono font-semibold text-default-800">{row.ip_address || '-'}</span>
                                 </div>
                                 <div className="flex flex-col gap-1 items-start bg-default-50 px-3 py-2 border border-default-100 rounded">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-default-500">API Endpoint Path</span>
                                    <span className="font-mono text-xs text-primary max-w-full break-all">{row.error_details?.extra_data?.path || row.request_path || '-'}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="bg-white border border-default-200 shadow-sm rounded-lg overflow-hidden">
                              <div className="bg-default-100 text-default-700 border-b border-default-200 px-4 py-2 font-semibold text-sm tracking-wide">
                                Related Users & IDs
                              </div>
                              <div className="p-3 flex flex-col gap-2">
                                 {row.rider_info && (
                                    <div className="text-xs bg-slate-50 border border-slate-100 p-2 rounded flex flex-col">
                                       <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Affected Rider</span>
                                       <span className="font-semibold text-slate-700">{row.rider_info.name || 'Unknown'} - {row.rider_info.phone_number}</span>
                                    </div>
                                 )}
                                 {row.driver_info && (
                                    <div className="text-xs bg-slate-50 border border-slate-100 p-2 rounded flex flex-col">
                                       <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Affected Driver</span>
                                       <span className="font-semibold text-slate-700">{row.driver_info.name || 'Unknown'} - {row.driver_info.phone_number}</span>
                                    </div>
                                 )}
                                 {!row.rider_info && !row.driver_info && <span className="text-default-400 italic text-xs py-2 px-1">Anonymous / System Event</span>}
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Exception Block Context */}
                        <div className="flex-[2] flex flex-col gap-4">
                            <div className="bg-[#1e1e1e] border border-black shadow-lg rounded-lg overflow-hidden flex flex-col max-h-[500px]">
                                <div className="bg-[#2d2d2d] flex items-center justify-between px-4 py-2 border-b border-[#111]">
                                   <div className="flex items-center gap-2 font-mono text-xs text-[#a5a5a5]">
                                       <LuTerminal className="size-4 text-warning" />
                                       <span>{row.file_name?.split('/').pop() || 'stacktrace.py'} <span className="text-default-500">at line</span> <span className="text-[#dcdcaa] font-bold">{row.line_number || '?'}</span></span>
                                   </div>
                                </div>
                                <div className="p-4 flex-grow overflow-auto">
                                   <pre className="font-mono text-xs text-[#d4d4d4] whitespace-pre-wrap leading-relaxed">
                                      {row.error_details?.traceback || 'No explicit Python stacktrace recorded.'}
                                   </pre>
                                </div>
                            </div>
                            
                            {/* Extra Payload attached to error */}
                            {row.error_details?.extra_data && row.error_details?.extra_data?.request_data && (
                                <div className="bg-white border border-warning/30 shadow-sm rounded-lg overflow-hidden flex flex-col">
                                   <div className="bg-warning/10 text-warning-700 flex items-center px-4 py-2 border-b border-warning/20 font-bold text-xs uppercase tracking-widest">
                                      Request Payload Trap
                                   </div>
                                   <div className="p-4 bg-orange-50/30">
                                      <pre className="font-mono text-xs text-default-800 whitespace-pre-wrap break-all">
                                         {String(row.error_details.extra_data.request_data)}
                                      </pre>
                                   </div>
                                </div>
                            )}

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
export default ErrorLogsTable;
