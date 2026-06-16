"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuChevronLeft, LuChevronRight, LuCalendar, LuSearch, LuLoader, LuCircleX, LuEllipsis, LuEye, LuArrowDown, LuArrowUp } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import Flatpickr from 'react-flatpickr';
import { apiFetch } from '@/utils/api';

const RiderRidesTable = ({ riderId }) => {
  const { token } = useAuthContext();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [preorder, setPreorder] = useState('');
  const [hasCouponApplied, setHasCouponApplied] = useState('');
  const [rideType, setRideType] = useState('');
  
  // Date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateField, setDateField] = useState('requested_at');
  
  // Sorting
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState('desc');
  
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchRides = async () => {
      if (!token || !riderId) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('page_size', limit);
        
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        if (vehicleType) queryParams.append('vehicle_type', vehicleType);
        if (preorder !== '') queryParams.append('preorder', preorder);
        if (hasCouponApplied !== '') queryParams.append('has_coupon_applied', hasCouponApplied);
        if (rideType) queryParams.append('ride_type', rideType);
        
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (dateField) queryParams.append('date_field', dateField);

        const sortParam = order === 'desc' ? `-${sortBy}` : sortBy;
        queryParams.append('ordering', sortParam);
        // Fallback for generic builder
        queryParams.append('sortBy', sortBy);
        queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/riders/${riderId}/rides/?${queryParams}`, { token });

        setData(result.data || result.results || []);
        
        const count = result.total_count || result.count || 0;
        setTotalCount(count);
        setTotalPages(result.total_pages || Math.ceil(count / limit) || 1);
      } catch (error) {
        console.error("Error fetching rider's rides:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRides();
    }, 500);

    return () => clearTimeout(timer);
  }, [riderId, page, limit, search, status, vehicleType, preorder, hasCouponApplied, rideType, startDate, endDate, dateField, sortBy, order, token]);

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
        if (i > 0) pages.push(i);
    }
    return pages;
  };

  const currentSortIcon = (column) => {
    if (sortBy !== column) return null;
    return order === 'asc' ? <LuArrowUp className="size-3 inline ms-1" /> : <LuArrowDown className="size-3 inline ms-1" />;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setOrder('asc');
    }
  };

  const getStatusBadgeClass = (statusVal) => {
    switch (statusVal) {
      case 1: return 'bg-primary/10 text-primary';
      case 2: return 'bg-success/10 text-success';
      case 3: return 'bg-danger/10 text-danger';
      default: return 'bg-default-200 text-default-600';
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setVehicleType('');
    setPreorder('');
    setHasCouponApplied('');
    setRideType('');
    setStartDate('');
    setEndDate('');
    setDateField('requested_at');
    setPage(1);
  };

  const hasFilters = search || status || vehicleType || preorder !== '' || hasCouponApplied !== '' || rideType || startDate || endDate;

  return (
    <div className="card">
      <div className="p-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative w-48">
          <input
            type="text"
            className="form-input form-input-sm ps-9 w-full"
            placeholder="Search rides..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        {/* Status */}
        <div className="w-36">
          <select
            className="form-input form-input-sm w-full"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">Status</option>
            <option value="1">Requested</option>
            <option value="2">Completed</option>
            <option value="3">Cancelled</option>
          </select>
        </div>

        {/* Ride Type */}
        <div className="w-40">
          <select
            className="form-input form-input-sm w-full"
            value={rideType}
            onChange={(e) => { setRideType(e.target.value); setPage(1); }}
          >
            <option value="">Ride Type</option>
            <option value="Driver Booking">Driver Booking</option>
            <option value="Scheduled Ride">Scheduled Ride</option>
            <option value="Hourly Ride">Hourly Ride</option>
            <option value="Web Booking">Web Booking</option>
            <option value="Regular Ride">Regular Ride</option>
          </select>
        </div>

        {/* Vehicle Type */}
        <div className="w-36">
          <input
            type="number"
            className="form-input form-input-sm w-full"
            placeholder="Vehicle Type ID"
            value={vehicleType}
            onChange={(e) => { setVehicleType(e.target.value); setPage(1); }}
          />
        </div>

        {/* Preorder */}
        <div className="w-36">
          <select
            className="form-input form-input-sm w-full"
            value={preorder}
            onChange={(e) => { setPreorder(e.target.value); setPage(1); }}
          >
            <option value="">Preorder?</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Has Coupon */}
        <div className="w-36">
          <select
            className="form-input form-input-sm w-full"
            value={hasCouponApplied}
            onChange={(e) => { setHasCouponApplied(e.target.value); setPage(1); }}
          >
            <option value="">Has Coupon?</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Date Field */}
        <div className="w-40">
          <select
            className="form-input form-input-sm w-full"
            value={dateField}
            onChange={(e) => { setDateField(e.target.value); setPage(1); }}
          >
            <option value="requested_at">Requested At</option>
            <option value="created_at">Created At</option>
          </select>
        </div>

        {/* Date Range Picker */}
        <div className="w-56">
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

        {/* Clear Filters */}
        {hasFilters && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5"
            >
              <LuCircleX className="size-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="overflow-auto max-h-[60vh] scroll-smooth">
          <div className="min-w-full inline-block align-middle">
            <div className="relative">
              <table className="min-w-full divide-y divide-default-200">
                <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
                  <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                    <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('id')}>
                      Request ID {currentSortIcon('id')}
                    </th>
                    <th className="px-3.5 py-3 text-start">Driver Name</th>
                    <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('status')}>
                      Status {currentSortIcon('status')}
                    </th>
                    <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                      Created At {currentSortIcon('created_at')}
                    </th>
                    <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('requested_at')}>
                      Requested At {currentSortIcon('requested_at')}
                    </th>
                    <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('estimated_fare')}>
                      Estimated Fare {currentSortIcon('estimated_fare')}
                    </th>
                    <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('has_coupon_applied')}>
                      Coupon? {currentSortIcon('has_coupon_applied')}
                    </th>
                    <th className="px-3.5 py-3 text-start">Pickup Address</th>
                    <th className="px-3.5 py-3 text-start">Dropoff Address</th>
                    <th className="px-3.5 py-3 text-start">Vehicle Type</th>
                    <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('preorder')}>
                      Preorder {currentSortIcon('preorder')}
                    </th>
                    <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('ride_type')}>
                      Ride Type {currentSortIcon('ride_type')}
                    </th>
                    <th className="px-3.5 py-3 text-start">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-200">
                  {loading ? (
                    <tr>
                      <td colSpan="13" className="py-10 text-center">
                        <LuLoader className="animate-spin size-6 text-primary mx-auto" />
                        <p className="mt-2 text-default-500">Loading requests...</p>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="py-10 text-center text-default-500">
                        No rider requests found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    data.map((request) => (
                      <tr 
                        key={request.id} 
                        className="text-default-800 font-normal text-sm hover:bg-default-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/rider-requests/${request.id}`)}
                      >
                        <td className="ps-4 py-3 text-primary font-medium">#{request.id}</td>
                        <td className="px-3.5 py-3">
                          {request.driver_info ? (
                            <span className="font-semibold text-default-800">{request.driver_info.name || 'Unknown'}</span>
                          ) : (
                            <span className="text-default-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className={`py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium rounded-md ${getStatusBadgeClass(request.status)}`}>
                            {request.status_display || request.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap text-default-600">{formatDate(request.created_at)}</td>
                        <td className="px-3.5 py-3 whitespace-nowrap text-default-600">{formatDate(request.requested_at)}</td>
                        <td className="px-3.5 py-3 font-semibold text-default-700">${parseFloat(request.estimated_fare || 0).toFixed(2)}</td>
                        <td className="px-3.5 py-3 text-default-600">{request.has_coupon_applied ? 'Yes' : 'No'}</td>
                        <td className="px-3.5 py-3 min-w-[200px] truncate max-w-xs" title={request.pickup_address}>
                          {request.pickup_address}
                        </td>
                        <td className="px-3.5 py-3 min-w-[200px] truncate max-w-xs" title={request.dropoff_address}>
                          {request.dropoff_address}
                        </td>
                        <td className="px-3.5 py-3 text-default-600">{request.vehicle_type_name || request.vehicle_type || 'N/A'}</td>
                        <td className="px-3.5 py-3 text-default-600">{request.preorder ? 'Yes' : 'No'}</td>
                        <td className="px-3.5 py-3 text-default-600">{request.ride_type || 'N/A'}</td>
                        <td className="px-3.5 py-3">
                          <div className="hs-dropdown relative inline-flex" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="hs-dropdown-toggle btn size-7.5 bg-default-100 hover:bg-default-200 text-default-600 rounded">
                              <LuEllipsis className="size-4" />
                            </button>
                            <div className="hs-dropdown-menu hidden z-10 w-32 bg-white shadow-lg rounded-lg border border-default-200" role="menu">
                              <div className="p-1">
                                <Link href={`/rider-requests/${request.id}`} className="flex items-center gap-2 py-1.5 px-3 text-sm text-default-700 hover:bg-default-100 rounded">
                                  <LuEye className="size-3.5" /> View Details
                                </Link>
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
    </div>
  );
};

export default RiderRidesTable;
