"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuCheck, LuX, LuPlus, LuSquarePen, LuTrash2, LuEllipsis } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import AddCancelReasonModal from './AddCancelReasonModal';

const CancelReasonsTable = () => {
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
  const [refresh, setRefresh] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

        const result = await apiFetch(`/api/v1/admin/system/cancel-reasons/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Cancel Reasons:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, sortBy, order, token, refresh]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await apiFetch(`/api/v1/admin/system/cancel-reasons/${confirmDeleteId}/`, {
        method: 'DELETE',
        token,
      });
      setRefresh(r => r + 1);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

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
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-default-200">
        {/* Search */}
        <div className="relative w-72">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search reason or user type..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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

        {/* Add Action Button */}
        <div className="ms-auto flex items-center">
           <button onClick={() => { setSelectedItem(null); setIsAddModalOpen(true); }} className="btn bg-primary text-white flex items-center gap-2">
               <LuPlus className="size-4" /> Add Reason
           </button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="overflow-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-default-200">
            <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
              <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('id')}>ID {currentSortIcon('id')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none w-1/3" onClick={() => handleSort('reason')}>Reason {currentSortIcon('reason')}</th>
                <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('user_type')}>User Type {currentSortIcon('user_type')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('created_at')}>Created At {currentSortIcon('created_at')}</th>
                <th className="px-3.5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200">
              {loading ? (
                <tr><td colSpan="4" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading Cancel Reasons...</p></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="4" className="py-10 text-center text-default-500">No Cancel Reasons found.</td></tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors">
                    <td className="ps-4 py-3 font-semibold text-primary">#{row.id}</td>
                    <td className="px-3.5 py-3">
                      <span className="font-semibold text-default-800">{row.reason}</span>
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${row.user_type === 'Driver' ? 'bg-primary/10 text-primary' : 'bg-purple-500/10 text-purple-600'}`}>
                        {row.user_type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-default-700">{formatDate(row.created_at)}</td>
                    <td className="px-3.5 py-3 text-center">
                      <div className="hs-dropdown relative inline-flex">
                        <button type="button" className="hs-dropdown-toggle btn size-7.5 bg-default-100 hover:bg-default-200 text-default-600 rounded">
                          {deletingId === row.id ? <LuLoader className="size-4 animate-spin" /> : <LuEllipsis className="size-4" />}
                        </button>
                        <div className="hs-dropdown-menu hidden z-10 w-32 bg-white shadow-lg rounded-lg border border-default-200 p-1" role="menu">
                          <button onClick={() => handleEdit(row)} className="w-full flex items-center gap-1.5 py-1.5 px-3 text-default-600 hover:bg-default-100 hover:text-primary rounded transition-colors text-sm">
                            <LuSquarePen className="size-3.5" /> Edit
                          </button>
                          <button onClick={() => handleDelete(row.id)} disabled={deletingId === row.id} className="w-full flex items-center gap-1.5 py-1.5 px-3 text-danger hover:bg-danger/10 rounded transition-colors disabled:opacity-50 text-sm">
                            <LuTrash2 className="size-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
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

      <AddCancelReasonModal 
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setSelectedItem(null); }}
        onAdded={() => setRefresh(r => r + 1)}
        editData={selectedItem}
      />

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-[1rem] bg-white shadow-2xl dark:bg-default-50 text-center scale-100 transition-all">
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-2">
                <LuTrash2 className="size-8 text-danger" />
              </div>
              <h3 className="text-xl font-bold text-default-800">Confirm Deletion</h3>
              <p className="text-sm text-default-500 max-w-[16rem]">
                Are you sure you want to delete this Cancel Reason? This action cannot be reversed.
              </p>
              <div className="flex justify-center flex-row gap-3 w-full mt-4">
                <button
                  type="button"
                  className="w-1/2 rounded-lg border border-default-200 bg-white px-5 py-2.5 text-sm font-medium text-default-700 hover:bg-default-100 transition-colors"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={deletingId === confirmDeleteId}
                  className="w-1/2 flex items-center justify-center rounded-lg bg-danger px-5 py-2.5 text-sm font-medium text-white hover:bg-danger/90 disabled:opacity-50 transition-colors"
                >
                  {deletingId === confirmDeleteId ? <LuLoader className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CancelReasonsTable;
