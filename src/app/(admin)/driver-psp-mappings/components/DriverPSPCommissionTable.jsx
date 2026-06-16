"use client";
import React, { useState, useEffect, useRef } from 'react';
import { LuChevronLeft, LuChevronRight, LuCalendar, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuChevronDown } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const PSPSearchDropdown = ({ value, defaultName, onChange, token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [displayName, setDisplayName] = useState(defaultName || 'Select PSP User...');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async (pageNum, append = false, currentSearch = '') => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNum);
      queryParams.append('limit', 20);
      if (currentSearch) queryParams.append('search', currentSearch);

      const res = await apiFetch(`/api/v1/admin/psp-users/?${queryParams}`, { token });
      const newData = res.data || [];
      if (append) {
        setOptions(prev => [...prev, ...newData]);
      } else {
        setOptions(newData);
      }
      setHasMore((res.total_pages || 1) > pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      const timer = setTimeout(() => {
        fetchUsers(1, false, search);
      }, 400); 
      return () => clearTimeout(timer);
    }
  }, [search, isOpen, token]);

  const loadMore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, true, search);
  };

  const handleSelect = (user) => {
    onChange(user.id);
    setDisplayName(user.name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 min-h-[38px] border border-default-200 rounded text-sm flex items-center justify-between text-default-700 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
      >
        <span className="truncate flex-1 text-left select-none">{value === '' ? '---------' : displayName}</span>
        <LuChevronDown className="size-4 text-default-400 shrink-0 ms-2" />
      </button>

      {isOpen && (
        <div className="absolute z-[70] w-full mt-1 bg-white border border-default-200 rounded shadow-xl left-0 origin-top">
          <div className="p-2 border-b border-default-100 sticky top-0 bg-white z-10 rounded-t">
            <div className="relative flex items-center">
              <LuSearch className="size-3.5 absolute left-3 text-default-400" />
              <input 
                type="text" 
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-default-200 rounded bg-default-50 focus:outline-none focus:border-primary transition-colors" 
                placeholder="Search PSP Users..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto outline-none py-1">
            <li 
              className="px-3 py-2 text-sm hover:bg-default-100 cursor-pointer text-default-500 font-medium transition-colors"
              onClick={() => { onChange(''); setDisplayName('---------'); setIsOpen(false); }}
            >
              ---------
            </li>
            {options.map((psp) => (
              <li 
                key={psp.id}
                className={`px-3 py-2 text-sm hover:bg-default-100 cursor-pointer border-b border-default-50 last:border-0 transition-colors ${value === psp.id ? 'bg-primary/5 text-primary font-medium' : 'text-default-700'}`}
                onClick={() => handleSelect(psp)}
              >
                {psp.name} <span className="text-xs text-default-400 block mt-0.5">{psp.phone_number || psp.email || ''}</span>
              </li>
            ))}
            {loading && (
              <li className="px-3 py-4 text-center">
                <LuLoader className="animate-spin size-4 text-primary mx-auto" />
              </li>
            )}
            {!loading && options.length === 0 && search && (
              <li className="px-3 py-4 text-center text-sm text-default-500">No PSPs found.</li>
            )}
            {!loading && hasMore && (
              <li 
                className="px-3 py-2.5 text-center text-sm text-primary font-medium hover:bg-primary/10 cursor-pointer transition-colors"
                onClick={loadMore}
              >
                Load More...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const DriverPSPCommissionTable = () => {
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

  // Editing logic states
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [savingId, setSavingId] = useState(null);

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditData({
      psp_user_id: row.psp_user_info?.id || '',
      psp_user_name: row.psp_user_info?.name || '',
      with_psp_percentage: parseFloat(row.with_psp_percentage || 0).toFixed(2),
      without_psp_percentage: parseFloat(row.without_psp_percentage || 0).toFixed(2),
      platform_fee_percentage: parseFloat(row.platform_fee_percentage || 0).toFixed(2)
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      await apiFetch(`/api/v1/admin/system/driver-psp-mappings/${id}/`, {
        method: 'PUT',
        token,
        body: JSON.stringify({
          psp_user_id: editData.psp_user_id === '' ? null : Number(editData.psp_user_id),
          with_psp_percentage: String(editData.with_psp_percentage),
          without_psp_percentage: String(editData.without_psp_percentage),
          platform_fee_percentage: String(editData.platform_fee_percentage)
        })
      });
      setEditingId(null);
      // Trigger a raw re-fetch locally natively by toggling the timestamp trick or modifying search invisibly. For now, since page is a dependency, just fetching the current page again directly via logic.
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      if (search) queryParams.append('search', search);
      if (sortBy) queryParams.append('sortBy', sortBy);
      if (order) queryParams.append('order', order);
      const result = await apiFetch(`/api/v1/admin/system/driver-psp-mappings/?${queryParams}`, { token });
      setData(result.data || result.results || []);
    } catch (err) {
      console.error("Failed to save mapping", err);
    } finally {
      setSavingId(null);
    }
  };


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

        const result = await apiFetch(`/api/v1/admin/system/driver-psp-mappings/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Mappings:", error);
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
    <div className="flex flex-col">
      <div className="p-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative w-72">
          <input type="text" className="form-input form-input-sm ps-9 w-full rounded" placeholder="Search driver or psp name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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

      <div className="overflow-auto max-h-[60vh] scroll-smooth border-t border-default-200">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-default-200">
            <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
              <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                <th className="px-3.5 py-3 text-start">Driver</th>
                <th className="px-3.5 py-3 text-start">VIN</th>
                <th className="px-3.5 py-3 text-start">Status</th>
                <th className="px-3.5 py-3 text-start">PSP (Dropdown)</th>
                <th className="px-3.5 py-3 text-start">Driver Commission</th>
                <th className="px-3.5 py-3 text-start">PSP Commission</th>
                <th className="px-3.5 py-3 text-start whitespace-nowrap">Platform Fee</th>
                <th className="ps-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200">
              {loading ? (
                <tr><td colSpan="8" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading mappings...</p></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="8" className="py-10 text-center text-default-500">No mappings found.</td></tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors">
                    <td className="px-3.5 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-default-800">{row.driver_info?.name || 'Unknown'}</span>
                        <span className="text-xs text-default-500">{row.driver_info?.phone_number || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="text-default-700">{row.vin || row.driver_info?.vin || 'N/A'}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                        row.driver_status?.toLowerCase() === 'available' ? 'bg-success/10 text-success' :
                        row.driver_status?.toLowerCase() === 'offline' ? 'bg-danger/10 text-danger' :
                        row.driver_status?.toLowerCase() === 'busy' ? 'bg-warning/10 text-warning' :
                        'bg-default-100 text-default-600'
                      }`}>
                        {row.driver_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 min-w-[20rem]">
                      {editingId === row.id ? (
                        <PSPSearchDropdown 
                          value={editData.psp_user_id} 
                          defaultName={editData.psp_user_name}
                          onChange={(val) => setEditData({...editData, psp_user_id: val})} 
                          token={token} 
                        />
                      ) : (
                        row.psp_user_info ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-default-700">{row.psp_user_info.name}</span>
                          </div>
                        ) : (
                          <span className="text-default-400 text-sm">---------</span>
                        )
                      )}
                    </td>
                    <td className="px-3.5 py-3 min-w-[7rem]">
                      {editingId === row.id ? (
                         <div className="flex items-center gap-1">
                           <input type="number" step="0.01" className="form-input form-input-sm w-16 text-end rounded border-default-200 p-1" value={editData.with_psp_percentage} onChange={(e) => setEditData({...editData, with_psp_percentage: e.target.value})} />
                           <span className="text-xs text-default-500">%</span>
                         </div>
                      ) : (
                         <span className="text-default-700">{parseFloat(row.with_psp_percentage || 0).toFixed(2)} %</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 min-w-[7rem]">
                      {editingId === row.id ? (
                         <div className="flex items-center gap-1">
                           <input type="number" step="0.01" className="form-input form-input-sm w-16 text-end rounded border-default-200 p-1" value={editData.without_psp_percentage} onChange={(e) => setEditData({...editData, without_psp_percentage: e.target.value})} />
                           <span className="text-xs text-default-500">%</span>
                         </div>
                      ) : (
                         <span className="text-default-700">{parseFloat(row.without_psp_percentage || 0).toFixed(2)} %</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 min-w-[7rem]">
                      {editingId === row.id ? (
                         <div className="flex items-center gap-1">
                           <input type="number" step="0.01" className="form-input form-input-sm w-16 text-end rounded border-default-200 p-1" value={editData.platform_fee_percentage} onChange={(e) => setEditData({...editData, platform_fee_percentage: e.target.value})} />
                           <span className="text-xs text-default-500">%</span>
                         </div>
                      ) : (
                         <span className="text-default-700">{parseFloat(row.platform_fee_percentage || 0).toFixed(2)} %</span>
                      )}
                    </td>
                    <td className="ps-4 py-3 text-center">
                      {editingId === row.id ? (
                         <div className="flex items-center justify-center gap-2">
                           <button onClick={() => handleSave(row.id)} disabled={savingId === row.id} className="btn bg-success text-white py-1 px-3 rounded text-xs font-semibold hover:bg-success/90 disabled:opacity-50">
                             {savingId === row.id ? <LuLoader className="animate-spin size-3" /> : 'Save'}
                           </button>
                           <button onClick={cancelEdit} disabled={savingId === row.id} className="btn bg-default-200 text-default-700 py-1 px-2 rounded text-xs font-semibold hover:bg-default-300 disabled:opacity-50">
                             Cancel
                           </button>
                         </div>
                      ) : (
                         <button onClick={() => startEdit(row)} className="text-primary hover:underline text-sm font-medium">
                           Edit
                         </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && totalCount > 0 && (
        <div className="p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-default-50 rounded-b">
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

export default DriverPSPCommissionTable;
