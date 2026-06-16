"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LuUser, LuMapPin, LuMail, LuPhone, LuLoader, LuMap, LuCreditCard, LuSquarePen } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';
import AddRiderModal from '../../components/AddRiderModal';

const RiderOverview = ({ riderId }) => {
  const { token } = useAuthContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      setGoogleMapsLoaded(true);
      return;
    }
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setGoogleMapsLoaded(true));
    }
  }, []);

  const fetchRiderData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await apiFetch(`/api/v1/admin/riders/${riderId}/`, { token });
      setData(result);
    } catch (err) {
      console.error("Failed to fetch rider details", err);
    } finally {
      setLoading(false);
    }
  }, [riderId, token]);

  useEffect(() => {
    fetchRiderData();
  }, [fetchRiderData]);

  useEffect(() => {
    if (data && mapRef.current && googleMapsLoaded && window.google?.maps) {
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      const hasLocation = !isNaN(lat) && !isNaN(lng);
      const centerCoord = hasLocation ? { lat, lng } : { lat: 30.2672, lng: -97.7431 };
      
      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: hasLocation ? 15 : 10,
          center: centerCoord,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] }
          ]
        });
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setCenter(centerCoord);
        if (hasLocation) mapInstanceRef.current.setZoom(15);
      }

      const map = mapInstanceRef.current;
      if (hasLocation) {
        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: "Rider Location",
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          });
        } else {
          markerRef.current.setPosition({ lat, lng });
        }
      }
    }
  }, [data, googleMapsLoaded]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <LuLoader className="animate-spin size-10 text-primary mb-4" />
        <p className="text-default-500 font-medium">Fetching Rider Profile...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="card p-8 text-center text-danger">Unable to locate rider information.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-1 space-y-6">
          <div className="card">
            <div className="p-5 border-b border-default-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuUser className="size-5 text-default-600" />
                <h4 className="text-base font-semibold text-default-800">Rider Account</h4>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-center size-7 bg-default-100 hover:bg-default-200 text-default-600 rounded">
                   <LuSquarePen className="size-3.5" />
                 </button>
                 <span className={`py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wider ${data.is_active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                   {data.is_active ? 'Active' : 'Inactive'}
                 </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-col items-center mb-6">
                 <div className="w-24 h-24 rounded-full bg-default-100 flex items-center justify-center text-default-400 mb-3 border border-default-200">
                    <LuUser className="size-10" />
                 </div>
                 <h3 className="text-lg font-bold text-default-800">{data.name || 'Unknown'}</h3>
                 <p className="text-sm text-default-500">ID: #{data.id}</p>
                 <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-semibold py-1 px-2.5 bg-warning/10 text-warning rounded-full">{data.rating || 'N/A'} ★</span>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-default-100 flex justify-center items-center shrink-0">
                    <LuPhone className="size-4 text-default-600" />
                  </div>
                  <div>
                    <p className="text-xs text-default-500 uppercase font-semibold">Phone Number</p>
                    <p className="font-medium text-default-800 text-sm mt-0.5">{data.phone_number || 'N/A'} {data.is_verified && <span className="text-[10px] ml-1 bg-success/10 text-success py-0.5 px-1.5 rounded uppercase">Verified</span>}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-default-100 flex justify-center items-center shrink-0">
                    <LuMail className="size-4 text-default-600" />
                  </div>
                  <div>
                    <p className="text-xs text-default-500 uppercase font-semibold">Email Address</p>
                    <p className="font-medium text-default-800 text-sm mt-0.5">{data.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-default-200">
                  <div>
                    <p className="text-[10px] text-default-500 uppercase tracking-wider font-semibold">Date Joined</p>
                    <p className="text-sm font-medium mt-1 text-default-700">{formatDate(data.date_joined)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-default-500 uppercase tracking-wider font-semibold">Last Login</p>
                    <p className="text-sm font-medium mt-1 text-default-700">{formatDate(data.last_login)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-default-50 p-5 border-t border-default-200 flex justify-between items-center rounded-b-lg">
              <span className="text-sm font-semibold text-default-600">Total Rides</span>
              <span className="text-xl font-bold text-primary">{data.computed_total_rides || 0}</span>
            </div>
          </div>

          <div className="card">
            <div className="p-5 border-b border-default-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuCreditCard className="size-5 text-default-600" />
                <h4 className="text-base font-semibold text-default-800">Financial Setup</h4>
              </div>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-default-100 flex flex-col">
                <li className="px-5 py-3 flex justify-between items-center hover:bg-default-50 transition-colors">
                  <span className="text-sm text-default-500">Stripe Customer Code</span>
                  <span className="font-mono text-xs text-default-700 bg-white border border-default-200 px-2 py-1 rounded">{data.stripe_customer_id || 'N/A'}</span>
                </li>
                <li className="px-5 py-3 flex justify-between items-center hover:bg-default-50 transition-colors">
                  <span className="text-sm text-default-500">System Negative Balance</span>
                  <span className="font-semibold text-danger">${parseFloat(data.negative_balance || 0).toFixed(2)}</span>
                </li>
              </ul>
            </div>
          </div>

          {data.ambassador_info && (
            <div className="card">
              <div className="p-5 border-b border-default-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-bold">★</span>
                  <h4 className="text-base font-semibold text-default-800">Ambassador Status</h4>
                </div>
                {data.ambassador_info.is_ambassador ? (
                  <span className="py-1 px-3 rounded-full text-xs font-semibold bg-success/10 text-success uppercase tracking-wider">Active</span>
                ) : (
                  <span className="py-1 px-3 rounded-full text-xs font-semibold bg-default-100 text-default-500 uppercase tracking-wider">Inactive</span>
                )}
              </div>
              <div className="p-0">
                <ul className="divide-y divide-default-100 flex flex-col">
                  <li className="px-5 py-3 flex justify-between items-center hover:bg-default-50 transition-colors">
                    <span className="text-sm text-default-500">Rides Allowed</span>
                    <span className="font-semibold text-default-800">{data.ambassador_info.rides_allowed || 0}</span>
                  </li>
                  <li className="px-5 py-3 flex justify-between items-center hover:bg-default-50 transition-colors">
                    <span className="text-sm text-default-500">Rides Used</span>
                    <span className="font-semibold text-primary">{data.ambassador_info.rides_used || 0}</span>
                  </li>
                  <li className="px-5 py-3 flex justify-between items-center hover:bg-default-50 transition-colors">
                    <span className="text-sm text-default-500">Rides Remaining</span>
                    <span className="font-semibold text-success">{data.ambassador_info.rides_remaining || 0}</span>
                  </li>
                  <li className="px-5 py-3 flex justify-between items-center hover:bg-default-50 transition-colors">
                    <span className="text-sm text-default-500">Min. Passengers Required</span>
                    <span className="font-semibold text-default-800">{data.ambassador_info.minimum_passengers_required || 0}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card">
            <div className="p-5 border-b border-default-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <LuMap className="size-5 text-default-600" />
                <h4 className="text-base font-semibold text-default-800">Live Rider Map</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex w-3 h-3 relative">
                  {(data.latitude && data.longitude) ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </>
                  ) : <span className="relative inline-flex rounded-full h-3 w-3 bg-default-300"></span>}
                </span>
                <span className="text-xs font-medium text-default-500 tracking-wide uppercase">
                  {(data.latitude && data.longitude) ? 'Tracking Available' : 'Offline / No Signal'}
                </span>
              </div>
            </div>
            <div className="bg-default-100 min-h-[450px] w-full relative" ref={mapRef}>
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center" style={{ zIndex: 0 }}>
                {!googleMapsLoaded && (
                  <div className="flex flex-col items-center">
                    <LuLoader className="animate-spin size-8 text-default-400 mb-3" />
                    <p className="text-sm font-medium text-default-500 tracking-wider">Loading Map Subsystem...</p>
                  </div>
                )}
                {googleMapsLoaded && (!data.latitude || !data.longitude) && (
                  <div className="bg-white/80 backdrop-blur top-10 flex flex-col items-center p-6 rounded-lg pointer-events-none">
                     <LuMapPin className="size-10 text-default-300 mb-2" />
                     <p className="text-default-500 font-medium">GPS Location currently unavailable for this rider.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-default-50 border-t border-default-200 rounded-b-lg flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <LuMapPin className="size-4 text-primary" />
                  <span className="text-sm font-mono text-default-600 bg-white px-2 py-1 rounded border border-default-200">
                    Lat: {data.latitude ? parseFloat(data.latitude).toFixed(6) : 'N/A'}
                  </span>
                  <span className="text-sm font-mono text-default-600 bg-white px-2 py-1 rounded border border-default-200">
                    Lng: {data.longitude ? parseFloat(data.longitude).toFixed(6) : 'N/A'}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {isEditModalOpen && (
        <AddRiderModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onAdded={fetchRiderData}
          riderData={data}
        />
      )}
    </div>
  );
};
export default RiderOverview;
