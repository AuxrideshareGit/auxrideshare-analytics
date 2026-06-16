"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LuChevronLeft, LuChevronRight, LuCircleCheck, LuCircleX, LuDownload, LuEllipsis, LuEye, LuLoader, LuPlus, LuSearch, LuSlidersHorizontal, LuSquarePen, LuTrash2, LuCalendar, LuUser, LuCar } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import Flatpickr from 'react-flatpickr';
import { apiFetch } from '@/utils/api';
import AddDriverModal from './AddDriverModal';

const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <div className="flex items-center gap-2">
    <span className={`text-xs ${!checked ? 'font-medium text-default-800' : 'text-default-400'}`}>No</span>
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} disabled={disabled} />
      <div className="w-8 h-4 bg-default-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-success"></div>
    </label>
    <span className={`text-xs ${checked ? 'font-medium text-success' : 'text-default-400'}`}>Yes</span>
  </div>
);

const UserListTabel = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('available');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLocked, setIsLocked] = useState('');
  const [isLocationShared, setIsLocationShared] = useState('');
  const [isApproved, setIsApproved] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [fetchingEditId, setFetchingEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await apiFetch(`/api/v1/admin/drivers/${confirmDeleteId}/`, {
        method: 'DELETE',
        token,
      });
      fetchDrivers();
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
      const result = await apiFetch(`/api/v1/admin/drivers/${id}/`, { token });
      setSelectedDriver(result);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch detailed driver info for editing", err);
    } finally {
      setFetchingEditId(null);
    }
  };

  const handleQuickUpdate = async (id, paramKey, paramValue) => {
    setFetchingEditId(id);
    try {
      const fullDriver = await apiFetch(`/api/v1/admin/drivers/${id}/`, { token });
      const submitData = new FormData();
      Object.keys(fullDriver).forEach(key => {
        if (fullDriver[key] !== null && typeof fullDriver[key] !== 'object') {
          submitData.append(key, fullDriver[key]);
        }
      });
      if (fullDriver.driver_info) {
         Object.keys(fullDriver.driver_info).forEach(key => {
            if (fullDriver.driver_info[key] !== null && typeof fullDriver.driver_info[key] !== 'object') {
               submitData.append(key, fullDriver.driver_info[key]);
            }
         });
      }
      
      // Override
      submitData.set(paramKey, paramValue);

      await apiFetch(`/api/v1/admin/drivers/${id}/`, {
        method: 'PUT',
        token,
        body: submitData
      });
      fetchDrivers();
    } catch (err) {
      console.error("Quick update failed", err);
    } finally {
      setFetchingEditId(null);
    }
  };

  const fetchDrivers = async () => {
    if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('driver_status', status);
        if (city) queryParams.append('city', city);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);
        if (isLocked) queryParams.append('is_locked', isLocked);
        if (isLocationShared) queryParams.append('is_location_shared', isLocationShared);
        if (isApproved) queryParams.append('is_approved', isApproved);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);

        const result = await apiFetch(`/api/v1/admin/drivers/?${queryParams}`, { token });

        setData(result.data || []);
        setTotalPages(result.total_pages || 1);
        setTotalCount(result.total_count || 0);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrivers();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, limit, search, status, city, sortBy, order, token, isLocked, isLocationShared, isApproved, startDate, endDate]);

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Generate pagination pages to display
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
            placeholder="Search fo"
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
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="w-48">
          <select
            className="form-input form-input-sm w-full"
            value={isLocked}
            onChange={(e) => { setIsLocked(e.target.value); setPage(1); }}
          >
            <option value="">Is locked</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="w-48">
          <select
            className="form-input form-input-sm w-full"
            value={isLocationShared}
            onChange={(e) => { setIsLocationShared(e.target.value); setPage(1); }}
          >
            <option value="">Location shared</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="w-48">
          <select
            className="form-input form-input-sm w-full"
            value={isApproved}
            onChange={(e) => { setIsApproved(e.target.value); setPage(1); }}
          >
            <option value="">Is approved</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
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

        {(search || status !== 'available' || isLocked || isLocationShared || isApproved || startDate || endDate) && (
          <div className="flex items-center">
            <button
              onClick={() => {
                setSearch('');
                setStatus('available');
                setIsLocked('');
                setIsLocationShared('');
                setIsApproved('');
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
             <LuPlus className="size-4" /> Add Driver
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
                    <th className="ps-4 text-start">
                      <input id="checkbox-all" type="checkbox" className="form-checkbox" />
                    </th>
                    <th className="px-3.5 py-3 text-start">Driver ID</th>
                    <th className="px-3.5 py-3 text-start">Name</th>
                    <th className="px-3.5 py-3 text-start">Phone Number</th>
                    <th className="px-3.5 py-3 text-start">Joining Date</th>
                    <th className="px-3.5 py-3 text-start">Status</th>
                    <th className="px-3.5 py-3 text-start">Is Approved</th>
                    <th className="px-3.5 py-3 text-start">Is Locked</th>
                    <th className="px-3.5 py-3 text-start">Location Shared</th>
                    <th className="px-3.5 py-3 text-start">Stripe Account ID</th>
                    <th className="px-3.5 py-3 text-start">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-200">
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="py-10 text-center">
                        <LuLoader className="animate-spin size-6 text-primary mx-auto" />
                        <p className="mt-2 text-default-500">Loading drivers...</p>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="py-10 text-center text-default-500">
                        No drivers found.
                      </td>
                    </tr>
                  ) : (
                    data.map((driver) => (
                      <tr key={driver.id} className="text-default-800 font-normal text-sm whitespace-nowrap hover:bg-default-50">
                        <td className="py-3 ps-4">
                          <input type="checkbox" className="form-checkbox" />
                        </td>
                        <td className="px-3.5 py-3 text-primary">#{driver.id}</td>
                        <td className="flex py-3 px-3.5 items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-base">
                            {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
                          </div>
                          <div>
                            <h6 className="mb-0.5 font-semibold">
                              <Link href="#" className="text-default-800">
                                {driver.name || 'Unknown'}
                              </Link>
                            </h6>
                            <p className="text-default-500 text-xs">{driver.role_name || 'Driver'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-default-600">{driver.phone_number || 'N/A'}</td>
                        <td className="py-3 px-3.5 text-default-600">{formatDate(driver.date_joined)}</td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {driver.driver_status === 1 ? (
                              <span className="py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium bg-success/10 text-success rounded-md">
                                <LuCircleCheck className="size-3" /> {driver.driver_status_display || 'Available'}
                              </span>
                            ) : driver.driver_status === 2 ? (
                              <span className="py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium bg-warning/10 text-warning rounded-md">
                                {driver.driver_status_display || 'Busy'}
                              </span>
                            ) : (
                              <span className="py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium bg-default-200 text-default-600 rounded-md">
                                <LuCircleX className="size-3" /> {driver.driver_status_display || 'Offline'}
                              </span>
                            )}
                            
                            <div className="hs-dropdown relative inline-flex">
                              <button type="button" className="hs-dropdown-toggle text-default-400 hover:text-primary transition-colors disabled:opacity-50" disabled={fetchingEditId === driver.id}>
                                {fetchingEditId === driver.id ? <LuLoader className="size-3.5 animate-spin" /> : <LuSquarePen className="size-3.5" />}
                              </button>
                              <div className="hs-dropdown-menu hidden z-10 w-28 bg-white shadow-lg rounded-lg border border-default-200 p-1 whitespace-normal" role="menu">
                                <div className="flex flex-col">
                                  <button onClick={() => handleQuickUpdate(driver.id, 'status', '1')} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-default-100 rounded text-success">Available</button>
                                  <button onClick={() => handleQuickUpdate(driver.id, 'status', '2')} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-default-100 rounded text-warning">Busy</button>
                                  <button onClick={() => handleQuickUpdate(driver.id, 'status', '3')} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-default-100 rounded text-default-500">Offline</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3">
                          <ToggleSwitch 
                             checked={driver.is_approved} 
                             disabled={fetchingEditId === driver.id}
                             onChange={(e) => handleQuickUpdate(driver.id, 'is_approved', e.target.checked ? 'true' : 'false')} 
                          />
                        </td>
                        <td className="px-3.5 py-3">
                          <ToggleSwitch 
                             checked={driver.is_locked} 
                             disabled={fetchingEditId === driver.id}
                             onChange={(e) => handleQuickUpdate(driver.id, 'is_locked', e.target.checked ? 'true' : 'false')} 
                          />
                        </td>
                        <td className="px-3.5 py-3">
                          <ToggleSwitch 
                             checked={driver.is_location_shared} 
                             disabled={fetchingEditId === driver.id}
                             onChange={(e) => handleQuickUpdate(driver.id, 'is_location_shared', e.target.checked ? 'true' : 'false')} 
                          />
                        </td>
                        <td className="py-3 px-3.5 text-default-600">{driver.stripe_account_id || 'N/A'}</td>
                        <td className="px-3.5 py-3">
                          <div className="hs-dropdown relative inline-flex">
                            <button type="button" className="hs-dropdown-toggle btn size-7.5 bg-default-100 hover:bg-default-200 text-default-600 rounded">
                              <LuEllipsis className="size-4" />
                            </button>
                            <div className="hs-dropdown-menu hidden z-10 w-32 bg-white shadow-lg rounded-lg border border-default-200" role="menu">
                              <div className="p-1">
                                <Link href={`/drivers-list/${driver.id}`} className="flex items-center gap-2 py-1.5 px-3 text-sm text-default-700 hover:bg-default-100 rounded">
                                  <LuUser className="size-3.5" /> Overview
                                </Link>
                                <Link href={`/drivers-list/${driver.id}/rides`} className="flex items-center gap-2 py-1.5 px-3 text-sm text-default-700 hover:bg-default-100 rounded">
                                  <LuCar className="size-3.5" /> Ride Details
                                </Link>
                                <Link href={`/drivers-list/transfers?user_id=${driver.id}&name=${encodeURIComponent(driver.name || '')}`} className="flex items-center gap-2 py-1.5 px-3 text-sm text-default-700 hover:bg-default-100 rounded">
                                  <LuSlidersHorizontal className="size-3.5" /> View Transfers
                                </Link>
                                <button onClick={() => handleEditClick(driver.id)} disabled={fetchingEditId === driver.id} className="w-full flex items-center gap-2 py-1.5 px-3 text-sm text-default-700 hover:bg-default-100 rounded disabled:opacity-50">
                                  {fetchingEditId === driver.id ? <LuLoader className="size-3.5 animate-spin" /> : <LuSquarePen className="size-3.5" />} Edit
                                </button>
                                <button onClick={() => setConfirmDeleteId(driver.id)} className="w-full flex items-center gap-2 py-1.5 px-3 text-sm text-danger hover:bg-danger/10 rounded">
                                  <LuTrash2 className="size-3.5" /> Delete
                                </button>
                              </div>
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

      <AddDriverModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdded={() => {
           setPage(1);
           fetchDrivers();
        }}
      />
      {isEditModalOpen && selectedDriver && (
        <AddDriverModal 
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedDriver(null); }}
          onAdded={fetchDrivers}
          driverData={selectedDriver}
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
                Are you sure you want to permanently delete this Driver? This action cannot be reversed.
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