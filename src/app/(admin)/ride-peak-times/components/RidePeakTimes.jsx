"use client";
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import { LuLoader, LuClock, LuMapPin, LuTrendingUp, LuSearch, LuCircleX } from 'react-icons/lu';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import dynamic from 'next/dynamic';

import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const RidePeakTimes = () => {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchPeakTimes = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (location) queryParams.append('location', location);
        
        if (dateRange && dateRange.length > 0) {
          const startDate = dateRange[0];
          const endDate = dateRange[1] || dateRange[0];
          queryParams.append('start_date', startDate.toLocaleDateString('en-CA')); // output YYYY-MM-DD
          queryParams.append('end_date', endDate.toLocaleDateString('en-CA'));
        }

        const result = await apiFetch(`/api/v1/admin/ride-stats/location-peak-hours/?${queryParams}`, { token });
        const locations = result.locations_data || result.data || [];
        setData(locations);

        const calculatedTotalCount = result.total_count || result.count || locations.length || 0;
        setTotalCount(calculatedTotalCount);
        
        if (locations.length > limit) {
          setTotalPages(Math.ceil(locations.length / limit));
        } else {
          setTotalPages(result.total_pages || result.num_pages || Math.ceil(calculatedTotalCount / limit));
        }
      } catch (error) {
        console.error("Error fetching locations peak times:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the fetch request by 300ms
    const timer = setTimeout(() => {
      fetchPeakTimes();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [token, location, page, limit, dateRange]);

  const handleLocationChange = (val) => {
    setLocation(val);
    setPage(1);
  };
  
  const handleDateChange = (dates) => {
    setDateRange(dates);
    setPage(1);
  };

  const clearFilters = () => {
    setLocation('');
    setDateRange([]);
    setPage(1);
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

  const isClientSidePagination = data.length > limit;
  const displayData = isClientSidePagination 
    ? data.slice((page - 1) * limit, page * limit) 
    : data;

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="card">
        <div className="p-4 flex flex-wrap items-center justify-start gap-4">
          <div className="relative w-64">
            <input
              type="text"
              className="form-input form-input-sm ps-9 w-full"
              placeholder="Search Location/City..."
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-3">
              <LuSearch className="size-3.5 text-default-500 fill-default-100" />
            </div>
          </div>
          
          <div className="w-64">
            <Flatpickr
              className="form-input form-input-sm w-full"
              value={dateRange}
              onChange={handleDateChange}
              options={{ mode: "range", dateFormat: "Y-m-d" }}
              placeholder="Select Date Range..."
            />
          </div>

          {(location || (dateRange && dateRange.length > 0)) && (
            <div className="flex items-center">
              <button
                onClick={clearFilters}
                className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5 border-none"
              >
                <LuCircleX className="size-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LuLoader className="animate-spin size-8 text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="card p-10 text-center flex flex-col items-center justify-center text-default-500">
          <LuMapPin className="size-10 mb-4 text-default-300" />
          <h3 className="text-lg font-medium text-default-700">No Location Data Available</h3>
          <p>There are no recorded rides forming peak hour metrics yet.</p>
        </div>
      ) : (
        <div className="space-y-6 space-x-0">
          {displayData.map((locationStats, index) => {
            const { city, total_rides, peak_hour_format, peak_ride_count, hourly_data } = locationStats;
            
            const categories = hourly_data.map(h => h.hour_format);
            const seriesData = hourly_data.map(h => h.count);
            
            // Find the index of the peak to highlight it specifically in the visualization
            const maxIndex = hourly_data.findIndex(h => h.count === peak_ride_count);
            const dynamicColors = hourly_data.map((h, i) => i === maxIndex && peak_ride_count > 0 ? '#f59e0b' : '#3b82f6');

            const chartOptions = {
              chart: {
                type: 'bar',
                height: 350,
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif'
              },
              plotOptions: {
                bar: {
                  borderRadius: 4,
                  columnWidth: '70%',
                  distributed: true // allows the dynamic color array per column
                }
              },
              colors: dynamicColors,
              legend: {
                show: false // hide the legends generated by distributed bars
              },
              dataLabels: {
                enabled: false
              },
              xaxis: {
                categories: categories,
                labels: {
                  style: { colors: '#9ca3af', fontSize: '11px' },
                  rotate: -45,
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
              },
              yaxis: {
                title: {
                  text: 'Number of Rides',
                  style: { color: '#6b7280', fontWeight: 600, fontSize: '13px' }
                },
                labels: { style: { colors: '#9ca3af' } }
              },
              grid: {
                borderColor: '#f3f4f6',
                strokeDashArray: 4,
                yaxis: { lines: { show: true } }
              },
              tooltip: {
                theme: 'light',
                y: { formatter: function (val) { return val + " rides" } }
              }
            };

            return (
              <div key={index} className="card overflow-hidden">
                <div className="bg-default-50 border-b border-default-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="min-w-10 min-h-10 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary">
                      <LuMapPin className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-default-900 leading-tight">{city}</h3>
                      <p className="text-sm text-default-500">Ride Density Over 24 Hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-default-500 uppercase tracking-wider font-semibold">Total Rides</p>
                      <p className="text-lg font-bold text-default-800 flex items-center justify-end gap-1">
                        <LuTrendingUp className="size-4 text-success" /> {total_rides}
                      </p>
                    </div>
                    <div className="h-10 w-px bg-default-300"></div>
                    <div className="text-right">
                      <p className="text-xs text-default-500 uppercase tracking-wider font-semibold flex items-center justify-end gap-1">
                        <LuClock className="size-3" /> Peak Hour
                      </p>
                      <p className="text-lg font-bold text-warning-600">
                        {peak_hour_format || 'N/A'} <span className="text-sm text-default-500 font-medium">({peak_ride_count} rides)</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <ReactApexChart options={chartOptions} series={[{ name: 'Rides', data: seriesData }]} type="bar" height={350} />
                </div>
              </div>
            );
          })}

          {!loading && data.length > 0 && (
            <div className="card p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-default-500 text-sm">
                Showing <b>{displayData.length}</b> of <b>{totalCount}</b> Results
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
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RidePeakTimes;
