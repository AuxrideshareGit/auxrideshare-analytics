"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuCalendar, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuImage } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import Flatpickr from 'react-flatpickr';
import { apiFetch } from '@/utils/api';

const VehiclesTable = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
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
        if (search) queryParams.append('search', search);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);

        const result = await apiFetch(`/api/v1/admin/system/vehicles/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, startDate, endDate, sortBy, order, token]);

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
      <div className="p-4 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative w-72">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search vehicle name, city..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        {/* Date Range */}
        <div className="w-64">
          <div className="relative">
            <Flatpickr
              options={{ mode: 'range', dateFormat: 'Y-m-d' }}
              className="form-input form-input-sm w-full ps-9 text-default-500"
              placeholder="Select created range"
              value={startDate && endDate ? [startDate, endDate] : null}
              onChange={(dates) => {
                if (dates.length === 2) {
                  setStartDate(new Date(dates[0].getTime() - dates[0].getTimezoneOffset() * 60000).toISOString().split('T')[0]);
                  setEndDate(new Date(dates[1].getTime() - dates[1].getTimezoneOffset() * 60000).toISOString().split('T')[0]);
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

        {/* Clear */}
        {(search || startDate || endDate) && (
          <button onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setPage(1); }} className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5">
            <LuCircleX className="size-4" /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-col">
        <div className="overflow-auto max-h-[60vh] scroll-smooth">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-default-200">
              <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
                <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                  <th className="ps-4 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('id')}>ID {currentSortIcon('id')}</th>
                  <th className="px-3.5 py-3 text-start">Vehicle</th>
                  <th className="px-3.5 py-3 text-start">Capacity</th>
                  <th className="px-3.5 py-3 text-start">Cities</th>
                  <th className="px-3.5 py-3 text-start">Fares</th>
                  <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('created_at')}>Created At {currentSortIcon('created_at')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200">
                {loading ? (
                  <tr><td colSpan="6" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading Vehicles...</p></td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="6" className="py-10 text-center text-default-500">No Vehicles found.</td></tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="text-default-800 font-normal text-sm hover:bg-default-50 transition-colors">
                      <td className="ps-4 py-3 font-semibold text-primary">#{row.id}</td>
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-3">
                          {row.image ? (
                            <img src={row.image} alt={row.name} className="h-10 w-16 object-contain rounded bg-default-100" />
                          ) : (
                            <div className="h-10 w-16 flex items-center justify-center rounded bg-default-100 text-default-400">
                              <LuImage className="size-5" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-default-700">{row.name}</span>
                            <span className="text-xs text-default-500 mt-0.5"><span className="uppercase tracking-wide font-medium">{row.ride_type || 'Unknown'}</span> (Type {row.type})</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-default-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-xs">Min: {row.minimum_passengers || 1}</span>
                          <span className="font-medium text-xs">Max: {row.capacity || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-default-600 max-w-xs">
                        {row.cities?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.cities.map((city, idx) => (
                              <span key={idx} className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">{city}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-default-400 italic text-xs">No cities assigned</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-default-600 text-xs w-48">
                        {row.fare_config ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-default-700">Base: <span className="font-normal text-default-600">${parseFloat(row.fare_config.base_fare || 0).toFixed(2)}</span></span>
                            {row.fare_config.per_hour_charge > 0 && <span>Hourly: <span className="text-success font-medium">${parseFloat(row.fare_config.per_hour_charge).toFixed(2)}</span></span>}
                            <span>Additional: <span className="text-default-500">${parseFloat(row.fare_config.additional_fare || 0).toFixed(2)}/mi</span></span>
                            <span>Distance threshold: <span className="text-default-500">{parseFloat(row.fare_config.distance_threshold || 0).toFixed(1)} mi</span></span>
                          </div>
                        ) : (
                          <span className="text-default-400">N/A</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-default-600 text-xs">{formatDate(row.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {!loading && totalCount > 0 && (
          <div className="card-footer p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-default-500 text-sm">Showing <b>{data.length}</b> of <b>{totalCount}</b></p>
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"><LuChevronLeft className="size-4 me-1" /> Prev</button>
              {getPageNumbers().map(p => (
                <button key={p} type="button" onClick={() => setPage(p)} className={`btn size-7.5 ${page === p ? 'bg-primary text-white border-primary' : 'bg-transparent border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10'}`}>{p}</button>
              ))}
              <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed">Next <LuChevronRight className="size-4 ms-1" /></button>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">Per Page:</span>
              <select className="form-input form-input-sm w-16 px-2 py-1" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default VehiclesTable;
