"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuMapPin, LuDollarSign, LuUsers, LuCheck, LuX, LuCalendar, LuDownload } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import Flatpickr from 'react-flatpickr';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const RideStatsTable = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // DataTables style pagination
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(10);
  const [draw, setDraw] = useState(1);
  const [search, setSearch] = useState('');
  
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [rideType, setRideType] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [city, setCity] = useState('');
  const [citiesList, setCitiesList] = useState([]);
  
  const [exporting, setExporting] = useState(false);
  
  const [sortBy, setSortBy] = useState('ride_id');
  const [order, setOrder] = useState('desc');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('draw', draw);
        queryParams.append('start', start);
        queryParams.append('length', length);
        if (search) queryParams.append('search[value]', search);
        
        if (dateStart) queryParams.append('date_start', dateStart);
        if (dateEnd) queryParams.append('date_end', dateEnd);
        if (rideType) queryParams.append('ride_type_filter', rideType);
        if (paymentMode) queryParams.append('payment_mode_filter', paymentMode);
        if (paymentStatus) queryParams.append('payment_filter', paymentStatus);
        if (city) queryParams.append('city_filter', city);
        
        // Map sort columns to indexes if backend strictly requires DataTables ordering
        const valColIdxMap = {
           'ride_id': 0, 'driver_name': 6, 'rider_name': 7, 
           'driver_completed': 4, 'ride_status': 15, 'ride_value': 17
        };
        const colIdx = valColIdxMap[sortBy] !== undefined ? valColIdxMap[sortBy] : 0;
        queryParams.append('order[0][column]', colIdx);
        queryParams.append('order[0][dir]', order);

        // Fallback generic sorting just in case
        queryParams.append('sortBy', sortBy);
        queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/ride-stats/?${queryParams}`, { token });
        
        setData(result.data || []);
        setTotalCount(result.recordsFiltered || result.recordsTotal || 0);
      } catch (error) {
        console.error("Error fetching Ride Stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [draw, start, length, search, dateStart, dateEnd, rideType, paymentMode, paymentStatus, city, sortBy, order, token]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!token) return;
      try {
        const result = await apiFetch('/api/v1/admin/system/cities/?limit=200', { token });
        setCitiesList(result.data || result.results || []);
      } catch (err) {
        console.error("Error fetching system cities:", err);
      }
    };
    fetchCities();
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString.replace(' ', 'T')); // Handle SQL standard dates
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const currentSortIcon = (column) => {
    if (sortBy !== column) return null;
    return order === 'asc' ? <LuArrowUp className="size-3 inline ms-1" /> : <LuArrowDown className="size-3 inline ms-1" />;
  };

  const handleSort = (column) => {
    if (sortBy === column) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setOrder('desc'); }
  };

  const currentPage = Math.floor(start / length) + 1;
  const totalPages = Math.ceil(totalCount / length) || 1;

  const getPageNumbers = () => {
    let pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (newPage) => {
    setStart((newPage - 1) * length);
    setDraw(d => d + 1);
  };

  const handleExport = async () => {
    if (!token) return;
    setExporting(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search[value]', search);
      if (dateStart) queryParams.append('date_start', dateStart);
      if (dateEnd) queryParams.append('date_end', dateEnd);
      if (rideType) queryParams.append('ride_type_filter', rideType);
      if (paymentMode) queryParams.append('payment_mode_filter', paymentMode);
      if (paymentStatus) queryParams.append('payment_filter', paymentStatus);
      if (city) queryParams.append('city_filter', city);

      // Using raw fetch to handle Blob downloads seamlessly
      const response = await fetch(`http://localhost:8000/api/v1/admin/ride-stats/export/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      let filename = 'ride_stats_export.xlsx';
      const map = response.headers.get('content-disposition');
      if (map && map.indexOf('filename=') !== -1) {
        filename = map.split('filename=')[1].replace(/["']/g, '');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export ride stats data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="card">
      <div className="p-3 lg:p-4 flex flex-wrap items-center gap-3 border-b border-default-200">
        <div className="relative w-48 xl:w-64">
          <input 
            type="text" 
            className="form-input form-input-sm ps-9 w-full" 
            placeholder="Search Driver or Rider..." 
            value={search} 
            onChange={(e) => { 
               setSearch(e.target.value); 
               setStart(0);
               setDraw(d => d + 1);
            }} 
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="w-44 xl:w-56">
          <div className="relative">
            <Flatpickr
              key={`flatpickr-${dateStart}-${dateEnd}`}
              options={{ mode: 'range', dateFormat: 'Y-m-d' }}
              className="form-input form-input-sm w-full ps-9 text-default-500"
              placeholder="Select Date Range..."
              value={dateStart && dateEnd ? [dateStart, dateEnd] : null}
              onChange={(dates) => {
                if (dates.length === 2) {
                  const s = new Date(dates[0].getTime() - dates[0].getTimezoneOffset() * 60000).toISOString().split('T')[0];
                  const e = new Date(dates[1].getTime() - dates[1].getTimezoneOffset() * 60000).toISOString().split('T')[0];
                  setDateStart(s);
                  setDateEnd(e);
                  setStart(0);
                  setDraw(d => d + 1);
                } else if (dates.length === 0) {
                  setDateStart('');
                  setDateEnd('');
                  setStart(0);
                  setDraw(d => d + 1);
                }
              }}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <LuCalendar className="size-4 text-default-500" />
            </div>
          </div>
        </div>

        {/* Ride Type */}
        <div className="w-32 xl:w-40">
          <select className="form-input form-input-sm w-full" value={rideType} onChange={(e) => { setRideType(e.target.value); setStart(0); setDraw(d => d + 1); }}>
            <option value="">All Ride Types</option>
            <option value="regular_ride">Regular Ride</option>
            <option value="driver_booking">Driver Booking</option>
            <option value="scheduled_ride">Scheduled Ride</option>
            <option value="hourly_ride">Hourly Ride</option>
            <option value="web_booking">Web Booking</option>
          </select>
        </div>

        {/* Payment Mode */}
        <div className="w-32 xl:w-40">
          <select className="form-input form-input-sm w-full" value={paymentMode} onChange={(e) => { setPaymentMode(e.target.value); setStart(0); setDraw(d => d + 1); }}>
            <option value="">All Payments</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal or Venmo</option>
          </select>
        </div>

        {/* Payment Status */}
        <div className="w-32 xl:w-36">
          <select className="form-input form-input-sm w-full" value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setStart(0); setDraw(d => d + 1); }}>
            <option value="">Payment Status</option>
            <option value="Captured">Captured</option>
            <option value="Authorised">Authorised</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* City Filter */}
        <div className="w-32 xl:w-36">
          <select className="form-input form-input-sm w-full" value={city} onChange={(e) => { setCity(e.target.value); setStart(0); setDraw(d => d + 1); }}>
            <option value="">All Cities</option>
            {citiesList.map(c => (
              <option key={c.id} value={c.id}>{c.city_name}</option>
            ))}
          </select>
        </div>

        {(search || dateStart || dateEnd || rideType || paymentMode || paymentStatus || city) && (
          <button 
            onClick={() => { 
               setSearch(''); 
               setDateStart(''); 
               setDateEnd('');
               setRideType('');
               setPaymentMode('');
               setPaymentStatus('');
               setCity('');
               setStart(0); 
               setDraw(d => d + 1); 
            }} 
            className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5"
          >
            <LuCircleX className="size-4" /> Clear
          </button>
        )}

        {/* Export Action */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn btn-sm bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 ms-auto"
        >
          {exporting ? <LuLoader className="size-4 animate-spin" /> : <LuDownload className="size-4" />}
          Export XLS
        </button>
      </div>

      <div className="flex flex-col">
        <div className="overflow-auto max-h-[65vh] scroll-smooth">
          <div className="min-w-full inline-block align-middle">
            <div className="relative">
              <table className="min-w-full divide-y divide-default-200">
                <thead className="bg-[#f8f9fa] sticky top-0 z-20 shadow-sm backdrop-blur-md">
              <tr className="text-xs font-semibold text-default-600 uppercase tracking-widest whitespace-nowrap bg-default-100">
                <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('ride_id')}>Ride ID {currentSortIcon('ride_id')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('rider_request_id')}>Ride Request ID {currentSortIcon('rider_request_id')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('driver_requested')}>Requested At {currentSortIcon('driver_requested')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('driver_start')}>Driver Start {currentSortIcon('driver_start')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('driver_completed')}>Driver Completed {currentSortIcon('driver_completed')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('requested_by')}>Requested By {currentSortIcon('requested_by')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('driver_name')}>Driver Name {currentSortIcon('driver_name')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('rider_name')}>Rider Name {currentSortIcon('rider_name')}</th>
                <th className="px-3.5 py-3 text-start">From</th>
                <th className="px-3.5 py-3 text-start">To</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('total_miles')}>Total Miles {currentSortIcon('total_miles')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('actual_distance_travelled')}>Actual Distance... {currentSortIcon('actual_distance_travelled')}</th>
                <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('passengers_paid')}>Passengers Paid {currentSortIcon('passengers_paid')}</th>
                <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('actual_passengers')}>Actual Passengers {currentSortIcon('actual_passengers')}</th>
                <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('total_ambassador_passengers')}>Ambassador Passengers {currentSortIcon('total_ambassador_passengers')}</th>
                <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('ride_status')}>Ride Status {currentSortIcon('ride_status')}</th>
                <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('payment_status')}>Payment Status {currentSortIcon('payment_status')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('extra_total_payable')}>Total Payable {currentSortIcon('extra_total_payable')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('ride_value')}>Ride Value {currentSortIcon('ride_value')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('net_payable_amount')}>Net Payable Amount {currentSortIcon('net_payable_amount')}</th>
                <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('has_coupon')}>Coupon Applied {currentSortIcon('has_coupon')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('original_fare')}>Original Fare {currentSortIcon('original_fare')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('discount_amount')}>Discount {currentSortIcon('discount_amount')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('commission_amount')}>Commission {currentSortIcon('commission_amount')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('driver_tip')}>Driver Tip {currentSortIcon('driver_tip')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('driver_payable_amount')}>Driver Payable Amount {currentSortIcon('driver_payable_amount')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('driver_share')}>Driver Share {currentSortIcon('driver_share')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('admin_share')}>Admin Share {currentSortIcon('admin_share')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('stripe_fee')}>Stripe Fee {currentSortIcon('stripe_fee')}</th>
                <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('paypal_fee')}>PayPal Fee {currentSortIcon('paypal_fee')}</th>
                <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('payment_mode')}>Payment Mode {currentSortIcon('payment_mode')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200">
              {loading ? (
                <tr>
                  <td colSpan="31" className="py-10">
                    <div className="sticky left-1/2 -translate-x-1/2 inline-block text-center whitespace-nowrap">
                       <LuLoader className="animate-spin size-6 text-primary mx-auto" />
                       <p className="mt-2 text-default-500">Loading Ride Stats...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="31" className="py-10">
                    <div className="sticky left-1/2 -translate-x-1/2 inline-block text-center whitespace-nowrap text-default-500">
                       No Ride Stats found.
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.ride_id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors whitespace-nowrap">
                    <td className="ps-4 py-3 font-semibold text-primary">#{row.ride_id}</td>
                    <td className="px-3.5 py-3">#{row.rider_request_id}</td>
                    <td className="px-3.5 py-3 text-default-500">{formatDate(row.driver_requested)}</td>
                    <td className="px-3.5 py-3 text-default-500">{formatDate(row.driver_start)}</td>
                    <td className="px-3.5 py-3 text-default-500">{formatDate(row.driver_completed)}</td>
                    <td className="px-3.5 py-3 capitalize">{row.requested_by}</td>
                    <td className="px-3.5 py-3"><span className="font-semibold text-default-800">{row.driver_name?.split('(')[0]?.trim()}</span>{row.driver_name?.includes('(+') && <span className="text-xs text-default-500 ms-1">+{row.driver_name.split('+')[1].replace(')', '')}</span>}</td>
                    <td className="px-3.5 py-3"><span className="font-semibold text-default-800 capitalize">{row.rider_name?.split('(')[0]?.trim()}</span>{row.rider_name?.includes('(+') && <span className="text-xs text-default-500 ms-1">+{row.rider_name.split('+')[1].replace(')', '')}</span>}</td>
                    <td className="px-3.5 py-3 max-w-[200px] truncate" title={row.pickup_location}>{row.pickup_location}</td>
                    <td className="px-3.5 py-3 max-w-[200px] truncate" title={row.dropoff_location}>{row.dropoff_location}</td>
                    <td className="px-3.5 py-3">{row.total_miles}</td>
                    <td className="px-3.5 py-3">{row.actual_distance_travelled}</td>
                    <td className="px-3.5 py-3 text-center font-bold text-primary">{row.passengers_paid}</td>
                    <td className="px-3.5 py-3 text-center font-bold text-emerald-600">{row.actual_passengers}</td>
                    <td className="px-3.5 py-3 text-center">{row.total_ambassador_passengers}</td>
                    <td className="px-3.5 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${row.ride_status === 'Completed' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{row.ride_status}</span></td>
                    <td className="px-3.5 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${row.payment_status === 'Captured' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-warning/10 text-warning'}`}>{row.payment_status}</span></td>
                    <td className="px-3.5 py-3 font-semibold">{formatCurrency(row.extra_total_payable)}</td>
                    <td className="px-3.5 py-3 font-semibold text-primary">{formatCurrency(row.ride_value)}</td>
                    <td className="px-3.5 py-3">{formatCurrency(row.net_payable_amount)}</td>
                    <td className="px-3.5 py-3 text-center">{row.has_coupon ? <span className="text-success inline-block"><LuCheck className="size-4" /></span> : <span className="text-danger inline-block"><LuX className="size-4" /></span>}</td>
                    <td className="px-3.5 py-3">{formatCurrency(row.original_fare)}</td>
                    <td className="px-3.5 py-3 text-danger">{formatCurrency(row.discount_amount)}</td>
                    <td className="px-3.5 py-3">{formatCurrency(row.commission_amount)}</td>
                    <td className="px-3.5 py-3 text-success font-semibold">{formatCurrency(row.driver_tip)}</td>
                    <td className="px-3.5 py-3 font-semibold text-[#175ea1]">{formatCurrency(row.driver_payable_amount)}</td>
                    <td className="px-3.5 py-3 text-[#175ea1]">{formatCurrency(row.driver_share)}</td>
                    <td className="px-3.5 py-3 text-amber-600">{formatCurrency(row.admin_share)}</td>
                    <td className="px-3.5 py-3 text-default-400">{formatCurrency(row.stripe_fee)}</td>
                    <td className="px-3.5 py-3 text-default-400">{formatCurrency(row.paypal_fee)}</td>
                    <td className="px-3.5 py-3 text-center"><span className="text-xs font-bold uppercase tracking-widest text-default-500 bg-default-100 px-2 py-1 rounded">{row.payment_mode || '—'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          </div>
        </div>
        {!loading && totalCount > 0 && (
           <div className="card-footer p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#fafafa]">
            <p className="text-default-500 text-sm">Showing <b>{start + 1}</b> to <b>{Math.min(start + length, totalCount)}</b> of <b>{totalCount}</b></p>
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
              <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-sm border bg-white border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <LuChevronLeft className="size-4 me-1" /> Prev
              </button>
              {getPageNumbers().map(p => (
                <button key={p} type="button" onClick={() => handlePageChange(p)} className={`btn size-7.5 ${currentPage === p ? 'bg-primary text-white border-primary' : 'bg-white border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary'}`}>
                  {p}
                </button>
              ))}
              <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="btn btn-sm border bg-white border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed">
                Next <LuChevronRight className="size-4 ms-1" />
              </button>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">Per Page:</span>
              <select className="form-input form-input-sm w-16 px-2 py-1" value={length} onChange={(e) => { setLength(Number(e.target.value)); setStart(0); setDraw(d => d + 1); }}>
                <option value="10">10</option><option value="20">20</option><option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideStatsTable;
