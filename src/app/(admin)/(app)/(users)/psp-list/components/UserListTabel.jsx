"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LuChevronLeft, LuChevronRight, LuCircleCheck, LuCircleX, LuEllipsis, LuEye, LuLoader, LuSearch, LuSquarePen, LuCalendar, LuUser, LuCar } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import Flatpickr from 'react-flatpickr';
import { apiFetch } from '@/utils/api';
import AddDriverModal from '../../drivers-list/components/AddDriverModal';
import AddRiderModal from '../../riders-list/components/AddRiderModal';

const UserListTabel = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditDriverModalOpen, setIsEditDriverModalOpen] = useState(false);
  const [isEditRiderModalOpen, setIsEditRiderModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [fetchingEditId, setFetchingEditId] = useState(null);

  const handleEditClick = async (userObj) => {
    setFetchingEditId(userObj.id);
    const isDriver = userObj.role === 'Driver';
    try {
      const endpoint = isDriver ? `/api/v1/admin/drivers/${userObj.id}/` : `/api/v1/admin/riders/${userObj.id}/`;
      const result = await apiFetch(endpoint, { token });
      setSelectedUserToEdit(result);
      if (isDriver) {
        setIsEditDriverModalOpen(true);
      } else {
        setIsEditRiderModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch detailed info for editing", err);
    } finally {
      setFetchingEditId(null);
    }
  };

  useEffect(() => {
    const fetchPspUsers = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/psp-users/?${queryParams}`, { token });

        setData(result.data || []);
        setTotalPages(result.total_pages || 1);
        setTotalCount(result.total_count || 0);
      } catch (error) {
        console.error("Error fetching PSP users:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPspUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, limit, search, status, startDate, endDate, sortBy, order, token]);

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

        {(search || status || startDate || endDate) && (
          <div className="flex items-center">
            <button
              onClick={() => {
                setSearch('');
                setStatus('');
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
      </div>

      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-default-200">
                <thead className="bg-default-150">
                  <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                    <th className="px-3.5 py-3 text-start">PSP User ID</th>
                    <th className="px-3.5 py-3 text-start">Name</th>
                    <th className="px-3.5 py-3 text-start">Phone Number</th>
                    <th className="px-3.5 py-3 text-start">Stripe Account ID</th>
                    <th className="px-3.5 py-3 text-start">Pending Commission</th>
                    <th className="px-3.5 py-3 text-start">Total Earned</th>
                    <th className="px-3.5 py-3 text-start">Joining Date</th>
                    <th className="px-3.5 py-3 text-start">Status</th>
                    <th className="px-3.5 py-3 text-start text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-200">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-3.5 py-8 text-center text-default-500">
                        <LuLoader className="size-6 animate-spin mx-auto text-primary" />
                        <span className="mt-2 block">Loading PSP users...</span>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-3.5 py-8 text-center text-default-500">
                        No PSP users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    data.map((user) => (
                      <tr key={user.id} className="text-default-800 font-normal text-sm whitespace-nowrap hover:bg-default-50 transition-colors">
                        <td className="px-3.5 py-3 text-primary">#{user.id}</td>
                        <td className="flex py-3 px-3.5 items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg uppercase">
                            {user.name ? user.name.charAt(0) : 'P'}
                          </div>
                          <div>
                            <h6 className="mb-0 font-semibold text-default-800">
                              {user.name || 'Unknown User'}
                            </h6>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">{user.phone_number || 'N/A'}</td>
                        <td className="py-3 px-3.5">{user.stripe_account_id || 'N/A'}</td>
                        <td className="py-3 px-3.5 font-medium text-warning">
                          ${typeof user.pending_commission === 'number' ? user.pending_commission.toFixed(2) : '0.00'}
                        </td>
                        <td className="py-3 px-3.5 font-medium text-success">
                          ${typeof user.total_earned === 'number' ? user.total_earned.toFixed(2) : '0.00'}
                        </td>
                        <td className="py-3 px-3.5">{formatDate(user.date_joined)}</td>
                        <td className="px-3.5 py-3">
                          {user.is_active ? (
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
                              <Link href={`/${user.role === 'Driver' ? 'drivers-list' : 'riders-list'}/${user.id}`} className="flex items-center gap-1.5 py-1.5 px-3 text-default-500 hover:bg-default-150 rounded">
                                <LuUser className="size-3" /> Overview
                              </Link>
                              <Link href={`/psp-list/${user.id}`} className="flex items-center gap-1.5 py-1.5 px-3 text-default-500 hover:bg-default-150 rounded">
                                <LuCar className="size-3" /> History
                              </Link>
                              <button onClick={() => handleEditClick(user)} disabled={fetchingEditId === user.id} className="w-full flex items-center gap-1.5 py-1.5 px-3 text-default-500 hover:bg-default-150 rounded disabled:opacity-50">
                                {fetchingEditId === user.id ? <LuLoader className="size-3 animate-spin" /> : <LuSquarePen className="size-3" />} Edit
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

      {/* <AddPspModal isOpen={isAddModalOpen} ... /> */}
      {isEditDriverModalOpen && selectedUserToEdit && (
        <AddDriverModal 
          isOpen={isEditDriverModalOpen}
          onClose={() => { setIsEditDriverModalOpen(false); setSelectedUserToEdit(null); }}
          onAdded={() => {}}
          driverData={selectedUserToEdit}
        />
      )}
      {isEditRiderModalOpen && selectedUserToEdit && (
        <AddRiderModal 
          isOpen={isEditRiderModalOpen}
          onClose={() => { setIsEditRiderModalOpen(false); setSelectedUserToEdit(null); }}
          onAdded={() => {}}
          riderData={selectedUserToEdit}
        />
      )}
    </div>
  );
};

export default UserListTabel;