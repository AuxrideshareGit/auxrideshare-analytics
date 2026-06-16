"use client";
import React, { useState, useEffect } from 'react';
import { LuUser, LuTrophy, LuMedal, LuLoader } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const PodiumItem = ({ rank, driver, heightClass, bgClass, rankColor, icon }) => {
  if (!driver) return <div className={`w-24 md:w-40 flex flex-col items-center justify-end h-full`} />;

  return (
    <div className="flex flex-col items-center justify-end h-full group">
      {/* Driver Info Element */}
      <div className="flex flex-col items-center mb-4 transition-transform duration-300 group-hover:-translate-y-2">
        {icon && (
          <div className="mb-2 animate-bounce">
            {icon}
          </div>
        )}
        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 ${bgClass} bg-white shadow-xl z-10 overflow-hidden`}>
          <div className="w-full h-full bg-default-100 flex items-center justify-center text-default-400">
            <LuUser className="size-6 md:size-10" />
          </div>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-default-100 mt-[-10px] z-20 flex flex-col items-center min-w-[100px] text-center">
          <span className="font-bold text-default-800 text-xs md:text-sm line-clamp-1 truncate w-full" title={driver.driver_name}>
            {driver.driver_name?.split(' ')[0]}
          </span>
          <span className="text-[10px] text-default-500 font-medium">
            {driver.completed_total} Rides
          </span>
        </div>
      </div>

      {/* Podium Block */}
      <div 
        className={`w-24 md:w-40 ${heightClass} ${bgClass} rounded-t-xl flex items-start justify-center pt-4 md:pt-6 shadow-lg border-b-8 border-black/10 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        <span className={`text-4xl md:text-6xl font-black ${rankColor} drop-shadow-md z-10`}>
          {rank}
        </span>
      </div>
    </div>
  );
};

const TopPerformers = ({ search, startDate, endDate }) => {
  const { token } = useAuthContext();
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('top', 3);
        if (search) queryParams.append('search[value]', search);
        if (startDate) queryParams.append('date_start', startDate);
        if (endDate) queryParams.append('date_end', endDate);

        const result = await apiFetch(`/api/v1/admin/drivers/top-performers/?${queryParams}`, { token });
        const list = result?.data || result?.results || (Array.isArray(result) ? result : []);
        setPerformers(list);
      } catch (err) {
        console.error("Failed to load top performers:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchTopPerformers, 400);
    return () => clearTimeout(timer);
  }, [token, search, startDate, endDate]);

  if (loading) {
    return (
      <div className="card mb-6 p-10 flex items-center justify-center">
        <LuLoader className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  // Fallback missing states instead of rendering a blank string
  const firstPlace = performers.length > 0 ? performers[0] : null;
  const secondPlace = performers.length > 1 ? performers[1] : null;
  const thirdPlace = performers.length > 2 ? performers[2] : null;

  const handleMissing = () => {
    return (
       <div className="w-full h-48 flex items-center justify-center text-default-500 bg-default-50/50 rounded-xl my-4 border border-dashed border-default-200">
         No top performers generated for this specific date range / search query yet. (Debug Array Size: {performers?.length})
       </div>
    );
  };

  return (
    <div className="card mb-6 overflow-hidden relative">
      <div className="p-6 border-b border-default-200 bg-gradient-to-r from-primary/5 via-white to-primary/5">
        <h2 className="text-xl font-bold flex items-center gap-2 text-default-800 tracking-tight">
          <LuTrophy className="text-yellow-500 size-6" /> 
          Top 3 Performing Drivers
        </h2>
        <p className="text-default-500 text-sm mt-1">
          Based on all-time highest completed ride counts
        </p>
      </div>
      
      {performers?.length === 0 ? handleMissing() : (
      <div className="w-full min-h-[300px] pt-10 pb-0 flex items-end justify-center gap-1 md:gap-4 lg:gap-8 bg-[url('/images/pattern.png')] bg-repeat bg-center">
        {/* 2nd Place */}
        <PodiumItem 
          rank={2} 
          driver={secondPlace} 
          heightClass="h-40 md:h-52" 
          bgClass="bg-[#E47B5A]" 
          rankColor="text-white"
        />

        {/* 1st Place */}
        <PodiumItem 
          rank={1} 
          driver={firstPlace} 
          heightClass="h-56 md:h-72" 
          bgClass="bg-[#F8D053]" 
          rankColor="text-white"
          icon={<LuTrophy className="text-yellow-500 size-10 md:size-14 drop-shadow-xl" />}
        />

        {/* 3rd Place */}
        <PodiumItem 
          rank={3} 
          driver={thirdPlace} 
          heightClass="h-32 md:h-40" 
          bgClass="bg-[#CE5744]" 
          rankColor="text-white"
        />
      </div>
      )}
    </div>
  );
};

export default TopPerformers;
