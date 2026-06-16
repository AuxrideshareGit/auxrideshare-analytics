"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LuChevronLeft, LuChevronRight, LuCircleCheck, LuCircleX, LuDownload, LuEllipsis, LuEye, LuLoader, LuPlus, LuSearch, LuSlidersHorizontal, LuSquarePen, LuTrash2, LuCalendar, LuStar, LuUser, LuCar } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import Flatpickr from 'react-flatpickr';
import { apiFetch } from '@/utils/api';
import AddRiderModal from './AddRiderModal';

const UserListTabel = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [fetchingEditId, setFetchingEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await apiFetch(`/api/v1/admin/riders/${confirmDeleteId}/`, {
        method: 'DELETE',
        token,
      });
      fetchRiders();
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = async (id) => {
    setFetchingEditId(id);
    try {
      const result = await apiFetch(`/api/v1/admin/riders/${id}/`, { token });
      setSelectedRider(result);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch detailed rider info for editing", err);
    } finally {
      setFetchingEditId(null);
    }
  };

  const fetchRiders = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        if (source) queryParams.append('source', source);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/riders/?${queryParams}`, { token });

        setData(result.data || []);
        setTotalPages(result.total_pages || 1);
        setTotalCount(result.total_count || 0);
      } catch (error) {
        console.error("Error fetching riders:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRiders();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, limit, search, status, source, startDate, endDate, sortBy, order, token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
        <div className="relative w-48">
          <input
            type="text"
            className="form-input form-input-sm ps-9 w-full"
            placeholder="Search for"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        <div className="w-48">
          <select
            className="form-input form-input-sm w-full"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="w-48">
          <select
            className="form-input form-input-sm w-full"
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
          >
            <option value="">Filter by Source</option>
            <option value="app">App</option>
            <option value="web">Web</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="w-64">
          <div className="relative">
            <Flatpickr
              key={`flatpickr-${startDate}-${endDate}`}
              options={{ mode: 'range', dateFormat: 'Y-m-d' }}
              className="form-input form-input-sm w-full ps-9 text-default-500"
              placeholder="Select date range"
              value={startDate && endDate ? [startDate, endDate] : null}
              onChange={(dates) => {
                if (dates.length === 2) {
                  const start = new Date(dates[0].getTime() - dates[0].getTimezoneOffset() * 60000).toISOString().split('T')[0];
                  const end = new Date(dates[1].getTime() - dates[1].getTimezoneOffset() * 60000).toISOString().split('T')[0];
                  setStartDate(start);
                  setEndDate(end);
                  setPage(1);
                } else if (dates.length === 0) {
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }
              }}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <LuCalendar className="size-4 text-default-500" />
            </div>
          </div>
        </div>

        {(search || status || source || startDate || endDate) && (
          <div className="flex items-center">
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
                setSource('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5"
            >
              <LuCircleX className="size-4" />
              Clear Filters
            </button>
          </div>
        )}
        
        <div className="flex ms-auto">
          <button 
             onClick={() => setIsAddModalOpen(true)}
             className="btn bg-primary text-white flex items-center gap-2"
          >
             <LuPlus className="size-4" /> Add Rider
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-default-200">
                <thead className="bg-default-150">
                  <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                    <th className="px-3.5 py-3 text-start">Rider ID</th>
                    <th className="px-3.5 py-3 text-start">Name</th>
                    <th className="px-3.5 py-3 text-start">Phone Number</th>
                    <th className="px-3.5 py-3 text-start">Stripe Customer ID</th>
                    <th className="px-3.5 py-3 text-start">Ratings</th>
                    <th className="px-3.5 py-3 text-start">Source</th>
                    <th className="px-3.5 py-3 text-start">Joining Date</th>
                    <th className="px-3.5 py-3 text-start">Status</th>
                    <th className="px-3.5 py-3 text-start text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-3.5 py-8 text-center text-default-500">
                        <LuLoader className="size-6 animate-spin mx-auto text-primary" />
                        <span className="mt-2 block">Loading riders...</span>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-3.5 py-8 text-center text-default-500">
                        No riders found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    data.map((rider) => (
                      <tr key={rider.id} className="text-default-800 font-normal text-sm whitespace-nowrap hover:bg-default-50 transition-colors">
                        <td className="px-3.5 py-3 text-primary">#{rider.id}</td>
                        <td className="flex py-3 px-3.5 items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg uppercase">
                            {rider.name ? rider.name.charAt(0) : 'R'}
                          </div>
                          <div>
                            <h6 className="mb-0 font-semibold text-default-800">
                              {rider.name || 'Unknown Rider'}
                            </h6>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">{rider.phone_number || 'N/A'}</td>
                        <td className="py-3 px-3.5">{rider.stripe_customer_id || 'N/A'}</td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1">
                            {rider.rating ? (
                              <>
                                <LuStar className="size-4 text-warning fill-warning" />
                                <span className="font-medium text-default-700">{rider.rating}</span>
                              </>
                            ) : (
                              <span className="text-default-500">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="capitalize text-default-600">{rider.source || 'N/A'}</span>
                        </td>
                        <td className="py-3 px-3.5">{formatDate(rider.date_joined)}</td>
                        <td className="px-3.5 py-3">
                          {rider.is_active ? (
                            <span className="py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium bg-success/10 text-success rounded">
                              <LuCircleCheck className="size-3" />
                              Active
                            </span>
                          ) : (
                            <span className="py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium bg-danger/10 text-danger rounded">
                              <LuCircleX className="size-3" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <div className="hs-dropdown relative inline-flex">
                            <button type="button" className="hs-dropdown-toggle btn size-7.5 bg-default-100 hover:bg-default-200 text-default-600 rounded">
                              <LuEllipsis className="size-4" />
                            </button>
                            <div className="hs-dropdown-menu" role="menu">
                              <Link href={`/riders-list/${rider.id}`} className="flex items-center gap-1.5 py-1.5 px-3 text-default-500 hover:bg-default-150 rounded">
                                <LuUser className="size-3" /> Overview
                              </Link>
                              <Link href={`/riders-list/${rider.id}/rides`} className="flex items-center gap-1.5 py-1.5 px-3 text-default-500 hover:bg-default-150 rounded">
                                <LuCar className="size-3" /> Ride Details
                              </Link>
                              <button onClick={() => handleEditClick(rider.id)} disabled={fetchingEditId === rider.id} className="w-full flex items-center gap-1.5 py-1.5 px-3 text-default-500 hover:bg-default-150 rounded disabled:opacity-50">
                                {fetchingEditId === rider.id ? <LuLoader className="size-3 animate-spin" /> : <LuSquarePen className="size-3" />} Edit
                              </button>
                              <button onClick={() => setConfirmDeleteId(rider.id)} className="w-full flex items-center gap-1.5 py-1.5 px-3 text-danger hover:bg-danger/10 rounded">
                                <LuTrash2 className="size-3" /> Delete
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
          </div>
        </div>
        
        {!loading && totalCount > 0 && (
          <div className="card-footer p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-default-500 text-sm">
              Showing <b>{data.length}</b> of <b>{totalCount}</b> Results
            </p>
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LuChevronLeft className="size-4 me-1" /> Prev
              </button>

              {getPageNumbers().map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`btn size-7.5 ${page === p ? 'bg-primary text-white border-primary' : 'bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10'}`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <LuChevronRight className="size-4 ms-1" />
              </button>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">Per Page:</span>
              <select
                className="form-input form-input-sm w-16 px-2 py-1"
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <AddRiderModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdded={() => {
           setPage(1);
           fetchRiders();
        }}
      />
      {isEditModalOpen && selectedRider && (
        <AddRiderModal 
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedRider(null); }}
          onAdded={fetchRiders}
          riderData={selectedRider}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
          <div className="relative w-full max-w-sm rounded-[1rem] bg-white shadow-2xl dark:bg-default-50 text-center scale-100 transition-all">
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-2">
                <LuTrash2 className="size-8 text-danger" />
              </div>
              <h3 className="text-xl font-bold text-default-800">Confirm Deletion</h3>
              <p className="text-sm text-default-500 max-w-[16rem]">
                Are you sure you want to permanently delete this Rider? This action cannot be reversed.
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

export default UserListTabel;