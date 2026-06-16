"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuLoader, LuSearch, LuCircleX, LuCalendar } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import Flatpickr from 'react-flatpickr';
import TopPerformers from './TopPerformers';

const DriverReportTable = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search[value]', search);
        if (startDate) queryParams.append('date_start', startDate);
        if (endDate) queryParams.append('date_end', endDate);

        const result = await apiFetch(`/api/v1/admin/drivers/leaderboard/?${queryParams}`, { token });
        setData(result.data || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || 0) / limit) || 1);
        setTotalCount(result.total_count || 0);
      } catch (error) {
        console.error("Error fetching Drivers Leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [page, limit, search, startDate, endDate, token]);

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
    <div className="flex flex-col gap-6">
      <TopPerformers search={search} startDate={startDate} endDate={endDate} />
      
      <div className="card">
        <div className="p-4 flex flex-wrap items-center gap-4 border-b border-default-200">
          {/* Search */}
        <div className="relative w-64 md:w-80">
          <input 
            type="text" 
            className="form-input form-input-sm ps-9 w-full" 
            placeholder="Search Driver Name or Phone..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
          />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="w-56">
          <div className="relative">
            <Flatpickr
              options={{ mode: 'range', dateFormat: 'Y-m-d' }}
              className="form-input form-input-sm w-full ps-9 text-default-500"
              placeholder="Select Date Range..."
              value={startDate && endDate ? [startDate, endDate] : null}
              onChange={(dates) => {
                if (dates.length === 2) {
                  const s = new Date(dates[0].getTime() - dates[0].getTimezoneOffset() * 60000).toISOString().split('T')[0];
                  const e = new Date(dates[1].getTime() - dates[1].getTimezoneOffset() * 60000).toISOString().split('T')[0];
                  setStartDate(s);
                  setEndDate(e);
                  setPage(1);
                } else if (dates.length === 0) {
                  setStartDate(''); setEndDate(''); setPage(1);
                }
              }}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <LuCalendar className="size-4 text-default-500" />
            </div>
          </div>
        </div>

        {(search || startDate || endDate) && (
          <button 
            onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setPage(1); }} 
            className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5"
          >
            <LuCircleX className="size-4" /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-col">
          <div className="overflow-auto max-h-[65vh] scroll-smooth">
            <div className="min-w-full inline-block align-middle">
              <table className="min-w-full divide-y divide-default-200">
                <thead className="bg-[#f8f9fa] sticky top-0 z-20 shadow-sm backdrop-blur-md">
                  <tr>
                    <th rowSpan="2" className="px-4 py-3 text-start border-b border-r border-default-200 text-sm font-semibold text-default-800 bg-default-100">Driver</th>
                    <th colSpan="6" className="py-2 text-center border-b border-r border-default-300 bg-emerald-50 text-emerald-700 text-sm font-semibold tracking-wide">Ride Completed</th>
                    <th colSpan="6" className="py-2 text-center border-b border-r border-default-300 bg-rose-50 text-rose-700 text-sm font-semibold tracking-wide">Ride Cancelled</th>
                    <th rowSpan="2" className="px-4 py-3 text-center border-b border-default-200 text-sm font-semibold text-amber-700 bg-amber-50 tracking-wide">Ride<br/>Rejected</th>
                  </tr>
                  <tr className="bg-default-50/80">
                    {/* completed subheadings */}
                    <th className="p-2 border-b border-r border-emerald-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-bold text-emerald-800 tracking-wider">Total Rides</div></th>
                    <th className="p-2 border-b border-r border-emerald-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-emerald-600 tracking-wider">Schedule Rides</div></th>
                    <th className="p-2 border-b border-r border-emerald-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-emerald-600 tracking-wider">Regular Rides</div></th>
                    <th className="p-2 border-b border-r border-emerald-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-emerald-600 tracking-wider">Driver Booking</div></th>
                    <th className="p-2 border-b border-r border-emerald-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-emerald-600 tracking-wider">Web Rides</div></th>
                    <th className="p-2 border-b border-r border-default-300"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-emerald-600 tracking-wider">Hourly Rides</div></th>
                    {/* cancelled subheadings */}
                    <th className="p-2 border-b border-r border-rose-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-bold text-rose-800 tracking-wider">Total Rides</div></th>
                    <th className="p-2 border-b border-r border-rose-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-rose-600 tracking-wider">Schedule Rides</div></th>
                    <th className="p-2 border-b border-r border-rose-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-rose-600 tracking-wider">Regular Rides</div></th>
                    <th className="p-2 border-b border-r border-rose-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-rose-600 tracking-wider">Driver Booking</div></th>
                    <th className="p-2 border-b border-r border-rose-100"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-rose-600 tracking-wider">Web Rides</div></th>
                    <th className="p-2 border-b border-r border-default-200"><div className="w-6 mx-auto [writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-rose-600 tracking-wider">Hourly Rides</div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="14" className="py-10">
                        <div className="sticky left-1/2 -translate-x-1/2 inline-block text-center whitespace-nowrap">
                          <LuLoader className="animate-spin size-6 text-primary mx-auto" />
                          <p className="mt-2 text-default-500">Loading Leaderboard...</p>
                        </div>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="py-10">
                        <div className="sticky left-1/2 -translate-x-1/2 inline-block text-center whitespace-nowrap text-default-500">
                          No Driver records found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((row) => (
                      <tr key={row.driver_id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors whitespace-nowrap">
                        <td className="px-4 py-3 border-r border-default-200">
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary">{row.driver_name || 'N/A'}</span>
                            {row.phone_number && <span className="text-xs text-default-500">{row.phone_number}</span>}
                          </div>
                        </td>
                        {/* Completed Rides */}
                        <td className="p-3 text-center border-r border-emerald-100 font-bold text-emerald-700 bg-emerald-50/50">{row.completed_rides?.total_rides || 0}</td>
                        <td className="p-3 text-center border-r border-emerald-100 text-default-600 hover:bg-emerald-50/30">{row.completed_rides?.schedule_rides || 0}</td>
                        <td className="p-3 text-center border-r border-emerald-100 text-default-600 hover:bg-emerald-50/30">{row.completed_rides?.regular_rides || 0}</td>
                        <td className="p-3 text-center border-r border-emerald-100 text-default-600 hover:bg-emerald-50/30">{row.completed_rides?.driver_booking_rides || 0}</td>
                        <td className="p-3 text-center border-r border-emerald-100 text-default-600 hover:bg-emerald-50/30">{row.completed_rides?.web_rides || 0}</td>
                        <td className="p-3 text-center border-r border-default-200 text-default-600 hover:bg-emerald-50/30">{row.completed_rides?.hourly_rides || 0}</td>
                        
                        {/* Cancelled Rides */}
                        <td className="p-3 text-center border-r border-rose-100 font-bold text-rose-700 bg-rose-50/50">{row.cancelled_rides?.total_rides || 0}</td>
                        <td className="p-3 text-center border-r border-rose-100 text-default-600 hover:bg-rose-50/30">{row.cancelled_rides?.schedule_rides || 0}</td>
                        <td className="p-3 text-center border-r border-rose-100 text-default-600 hover:bg-rose-50/30">{row.cancelled_rides?.regular_rides || 0}</td>
                        <td className="p-3 text-center border-r border-rose-100 text-default-600 hover:bg-rose-50/30">{row.cancelled_rides?.driver_booking_rides || 0}</td>
                        <td className="p-3 text-center border-r border-rose-100 text-default-600 hover:bg-rose-50/30">{row.cancelled_rides?.web_rides || 0}</td>
                        <td className="p-3 text-center border-r border-default-200 text-default-600 hover:bg-rose-50/30">{row.cancelled_rides?.hourly_rides || 0}</td>
                        
                        {/* Rejected Rides */}
                        <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/30">{row.rejected_rides || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        {!loading && totalCount > 0 && (
          <div className="card-footer p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#fafafa]">
            <p className="text-default-500 text-sm">Showing <b>{((page - 1) * limit) + 1}</b> to <b>{Math.min(page * limit, totalCount)}</b> of <b>{totalCount}</b></p>
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-sm border bg-white border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary disabled:opacity-50">
                <LuChevronLeft className="size-4 me-1" /> Prev
              </button>
              {getPageNumbers().map(p => (
                <button key={p} onClick={() => setPage(p)} className={`btn size-7.5 ${page === p ? 'bg-primary text-white border-primary' : 'bg-white border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary'}`}>
                  {p}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-sm border bg-white border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary disabled:opacity-50">
                Next <LuChevronRight className="size-4 ms-1" />
              </button>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">Per Page:</span>
              <select className="form-input form-input-sm w-16 px-2 py-1" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};
export default DriverReportTable;
