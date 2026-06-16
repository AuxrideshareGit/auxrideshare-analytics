"use client";
import React, { useState, useEffect, useRef } from 'react';
import { LuMapPin, LuNavigation, LuUser, LuCar, LuClock, LuCreditCard, LuMap, LuLoader, LuPhone, LuMail, LuChevronDown, LuChevronUp, LuInfo, LuDollarSign } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const RideDetailsView = ({ rideId }) => {
  const { token } = useAuthContext();
  const [data, setData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [trackingData, setTrackingData] = useState(null);
  const [tipsData, setTipsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [expandedBoardings, setExpandedBoardings] = useState(new Set());
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const toggleLog = (logId) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const toggleBoarding = (boardingId) => {
    setExpandedBoardings((prev) => {
      const next = new Set(prev);
      if (next.has(boardingId)) {
        next.delete(boardingId);
      } else {
        next.add(boardingId);
      }
      return next;
    });
  };

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

  useEffect(() => {
    const fetchRideData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [rideResult, timelineResult, trackingResult, tipsResult] = await Promise.all([
          apiFetch(`/api/v1/admin/rides/${rideId}/`, { token }),
          apiFetch(`/api/v1/admin/rides/${rideId}/timeline/`, { token }).catch(() => []),
          apiFetch(`/api/v1/admin/rides/${rideId}/location-tracking/`, { token }).catch(() => null),
          apiFetch(`/api/v1/admin/rides/${rideId}/tips/`, { token }).catch(() => [])
        ]);
        setData(rideResult);
        setTimelineData(timelineResult || []);
        setTrackingData(trackingResult);
        setTipsData(tipsResult || []);
      } catch (err) {
        console.error("Failed to fetch ride details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRideData();
  }, [rideId, token]);

  useEffect(() => {
    // Attempt drawing Google Maps if API translates into map space & script is loaded
    if (data && mapRef.current && googleMapsLoaded && window.google?.maps) {
      if (mapInstanceRef.current) return; // Prevent multiple maps from rendering

      const pickupLat = trackingData?.pickup_latitude || data.pickup_coordinates?.lat;
      const pickupLng = trackingData?.pickup_longitude || data.pickup_coordinates?.lng;
      const dropoffLat = trackingData?.dropoff_latitude || data.dropoff_coordinates?.lat;
      const dropoffLng = trackingData?.dropoff_longitude || data.dropoff_coordinates?.lng;

      const centerCoord = (pickupLat && pickupLng) ? { lat: parseFloat(pickupLat), lng: parseFloat(pickupLng) } : { lat: 30.2672, lng: -97.7431 };
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: centerCoord,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] }
        ]
      });
      mapInstanceRef.current = map;

      const bounds = new window.google.maps.LatLngBounds();

      // Plot Pickup
      if (pickupLat && pickupLng) {
        const pos = { lat: parseFloat(pickupLat), lng: parseFloat(pickupLng) };
        new window.google.maps.Marker({
          position: pos,
          map,
          title: "Pickup Location",
          icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });
        bounds.extend(pos);
      }

      // Plot Dropoff
      if (dropoffLat && dropoffLng) {
        const pos = { lat: parseFloat(dropoffLat), lng: parseFloat(dropoffLng) };
        new window.google.maps.Marker({
          position: pos,
          map,
          title: "Dropoff Location",
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        bounds.extend(pos);
      }

      // Determine path points
      const pathCoords = [];
      let isSparseTracking = false;

      if (trackingData?.driver_locations?.length > 0) {
        trackingData.driver_locations.forEach(loc => {
          pathCoords.push({ lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) });
        });
        isSparseTracking = true;
      } else if (data.tracking?.route_coordinates?.length > 0) {
        data.tracking.route_coordinates.forEach(coord => {
          pathCoords.push({ lat: parseFloat(coord[0]), lng: parseFloat(coord[1]) });
        });
      }

      // Plot path and current driver position
      if (pathCoords.length > 0) {
        // If we have sparse points (like pinged GPS driver locations), snap them to Real Roads using Directions Service
        if (isSparseTracking && pathCoords.length <= 25) {
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true, // We plot our own green/red/blue dot markers
            preserveViewport: true, // We calculate and fit bounds ourselves
            polylineOptions: {
              strokeColor: "#3b82f6", // tailwind blue-500
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }
          });

          const waypoints = pathCoords.length > 2
            ? pathCoords.slice(1, -1).map(p => ({ location: p, stopover: false }))
            : [];

          directionsService.route({
            origin: pathCoords[0],
            destination: pathCoords[pathCoords.length - 1],
            waypoints: waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING
          }, (response, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(response);
            } else {
              // Fallback to raw straight lines if directions failed
              const polyline = new window.google.maps.Polyline({
                path: pathCoords,
                geodesic: true,
                strokeColor: "#3b82f6",
                strokeOpacity: 0.8,
                strokeWeight: 4,
              });
              polyline.setMap(map);
            }
          });
        } else {
          // If we have massive dense coordinates from API, just draw the polyline natively to avoid Limits
          const polyline = new window.google.maps.Polyline({
            path: pathCoords,
            geodesic: true,
            strokeColor: "#3b82f6", // tailwind blue-500
            strokeOpacity: 0.8,
            strokeWeight: 4,
          });
          polyline.setMap(map);
        }

        new window.google.maps.Marker({
          position: pathCoords[pathCoords.length - 1],
          map,
          title: "Driver Current/Last Location",
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

        pathCoords.forEach(p => bounds.extend(p));
      }

      // Adjust viewport to fit all map markers
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    }
  }, [data, trackingData, googleMapsLoaded]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatTimelineDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 1: return 'bg-primary/10 text-primary';
      case 2: return 'bg-success/10 text-success';
      case 3: return 'bg-danger/10 text-danger';
      default: return 'bg-default-200 text-default-600';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <LuLoader className="animate-spin size-10 text-primary mb-4" />
        <p className="text-default-500 font-medium">Fetching Ride Details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-8 text-center text-danger">
        Unable to locate ride information for ID {rideId}
      </div>
    );
  }

  const renderAdditionalDetails = () => {
    const details = [
      { label: "Vehicle type", value: data.vehicle_type?.name || data.vehicle_info?.type || data.vehicle_type_id || data.vehicle_type },
      { label: "Estimated fare", value: data.estimated_fare ? `$${parseFloat(data.estimated_fare).toFixed(2)}` : null },
      { label: "Per passenger fare", value: data.per_passenger_fare ? `$${parseFloat(data.per_passenger_fare).toFixed(2)}` : null },
      { label: "Original fare", value: data.original_fare_before_coupon ? `$${parseFloat(data.original_fare_before_coupon).toFixed(2)}` : null },
      { label: "Has coupon", value: typeof data.has_coupon_applied === 'boolean' ? (data.has_coupon_applied ? 'Yes' : 'No') : data.has_coupon_applied },
      { label: "Original passenger count", value: data.original_passenger_count },
      { label: "Est. duration", value: data.estimated_duration_mins ? `${data.estimated_duration_mins} mins` : null },
      { label: "Est. distance", value: data.estimated_distance_miles ? `${parseFloat(data.estimated_distance_miles).toFixed(2)} mi` : null },
      { label: "Passengers", value: data.number_of_passengers },
      { label: "Stop address", value: data.stop_address },
      { label: "Status", value: data.status_display || data.status },
      { label: "Preorder", value: typeof data.preorder === 'boolean' ? (data.preorder ? 'Yes' : 'No') : data.preorder },
      { label: "Requested at", value: formatDate(data.requested_at) },
      { label: "Driver confirmed", value: typeof data.is_driver_confirmed === 'boolean' ? (data.is_driver_confirmed ? 'Yes' : 'No') : data.is_driver_confirmed },
      { label: "Booking confirmed in app", value: typeof data.is_driver_booking_confirmed_in_app === 'boolean' ? (data.is_driver_booking_confirmed_in_app ? 'Yes' : 'No') : data.is_driver_booking_confirmed_in_app },
      { label: "Source", value: data.source },
      { label: "Utm source", value: data.utm_source },
      { label: "Utm campaign", value: data.utm_campaign },
      { label: "Ride action", value: data.ride_action },
      { label: "Fare type", value: data.fare_type },
      { label: "Rider hours", value: data.rider_hours },
      { label: "Ride started at", value: formatDate(data.ride_started_at) },
      { label: "Cancellation reason", value: data.cancellation_reason },
      { label: "Ride claimed", value: typeof data.ride_claimed === 'boolean' ? (data.ride_claimed ? 'Yes' : 'No') : data.ride_claimed },
      { label: "Ride claimed at", value: formatDate(data.ride_claimed_at) }
    ];

    return (
      <div className="card mt-6">
        <div className="p-5 border-b border-default-200 flex items-center gap-2">
          <LuInfo className="size-5 text-default-600" />
          <h4 className="text-base font-semibold text-default-800">Extended Ride Data</h4>
        </div>
        <div className="p-0">
          <ul className="divide-y divide-default-100 flex flex-col">
            {details.map((item, idx) => {
              const val = (item.value !== null && item.value !== undefined && item.value !== '' && item.value !== 'N/A') ? item.value.toString() : '-';
              return (
                <li key={idx} className="px-5 py-3 flex justify-between items-start text-sm hover:bg-default-50 transition-colors">
                  <span className="text-default-500 w-1/2 pr-2">{item.label}</span>
                  <span className="font-semibold text-default-800 text-end w-1/2 break-words">{val}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column = Core Stats & Info */}
        <div className="xl:col-span-1 space-y-6">

          {/* Core Detail Card */}
          <div className="card">
            <div className="p-5 border-b border-default-200 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-default-800">Ride #{data.id}</h4>
              <span className={`py-1 px-3 text-xs font-medium rounded-full ${getStatusBadgeClass(data.status)}`}>
                {data.status_display || 'Unknown Status'}
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex justify-center items-center shrink-0">
                  <LuMapPin className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-default-500 uppercase">Pickup Location</p>
                  <p className="font-medium text-default-800 text-sm mt-0.5">{data.pickup_address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-success/10 text-success flex justify-center items-center shrink-0">
                  <LuNavigation className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-default-500 uppercase">Dropoff Location</p>
                  <p className="font-medium text-default-800 text-sm mt-0.5">{data.dropoff_address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-default-200">
                <div>
                  <p className="text-xs text-default-500">Requested</p>
                  <p className="text-sm font-medium mt-1">{formatDate(data.requested_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-default-500">Created At</p>
                  <p className="text-sm font-medium mt-1">{formatDate(data.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-default-500">Est. Distance</p>
                  <p className="text-sm font-medium mt-1">{parseFloat(data.estimated_distance_miles).toFixed(2)} mi</p>
                </div>
                <div>
                  <p className="text-xs text-default-500">Est. Duration</p>
                  <p className="text-sm font-medium mt-1">{data.estimated_duration_mins} mins</p>
                </div>
              </div>
            </div>
            <div className="bg-default-50 p-5 border-t border-default-200 flex justify-between items-center rounded-b-lg">
              <span className="text-sm font-semibold text-default-600">Estimated Fare</span>
              <span className="text-xl font-bold text-primary">${parseFloat(data.estimated_fare).toFixed(2)}</span>
            </div>
          </div>

          {/* Rider Information */}
          <div className="card">
            <div className="p-5 border-b border-default-200 flex items-center gap-2">
              <LuUser className="size-5 text-default-600" />
              <h4 className="text-base font-semibold text-default-800">Rider Information</h4>
            </div>
            <div className="p-5 space-y-3">
              {data.rider_info ? (
                <>
                  <p className="text-sm"><span className="text-default-500 w-24 inline-block">Name:</span> <span className="font-medium">{data.rider_info.name || 'Unknown'}</span></p>
                  <p className="text-sm flex items-center gap-1.5"><span className="text-default-500 w-24">Phone:</span> <span className="font-medium"><LuPhone className="size-3.5 inline text-default-400" /> {data.rider_info.phone_number || 'N/A'}</span></p>
                  <p className="text-sm flex items-center gap-1.5"><span className="text-default-500 w-24">Email:</span> <span className="font-medium"><LuMail className="size-3.5 inline text-default-400" /> {data.rider_info.email || 'N/A'}</span></p>
                </>
              ) : (
                <p className="text-sm text-default-500 italic">No formal rider data connected.</p>
              )}
            </div>
          </div>

          {/* Extended Data Table */}
          {renderAdditionalDetails()}

        </div>

        {/* Right Content = Driver Assignment Tables & Boardings */}
        <div className="xl:col-span-2 space-y-6">

          {/* Map & Tracking Box */}
          <div className="card">
            <div className="p-5 border-b border-default-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <LuMap className="size-5 text-default-600" />
                <h4 className="text-base font-semibold text-default-800">Driver Location Tracking</h4>
              </div>
              {trackingData ? (
                <div className="flex gap-4 text-sm">
                  <span className="text-default-500">Travelled: <b className="text-default-800">{trackingData.actual_distance_travelled || 0} mi</b></span>
                  <span className="text-default-500">Remaining Dist: <b className="text-default-800">{trackingData.remaining_distance || 0} mi</b></span>
                </div>
              ) : data.tracking ? (
                <div className="flex gap-4 text-sm">
                  <span className="text-default-500">Coords: <b className="text-default-800">{data.tracking.coordinate_count || 0}</b></span>
                  <span className="text-default-500">Remaining Dist: <b className="text-default-800">{data.tracking.remaining_distance || 0} mi</b></span>
                </div>
              ) : null}
            </div>

            <div className="bg-default-100 min-h-[400px] w-full relative" ref={mapRef}>
              {/* Map Mount Point */}
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center" style={{ zIndex: 0 }}>
                {!googleMapsLoaded && (
                  <p className="text-default-500">Loading Google Maps...</p>
                )}
              </div>
            </div>

            {/* Map Legend */}
            <div className="p-4 bg-white border-t border-default-200 rounded-b-lg flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-success"></span>
                <span className="text-sm font-medium text-default-700">Pickup Location</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-danger"></span>
                <span className="text-sm font-medium text-default-700">Dropoff Location</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm ring-1 ring-primary/20"></span>
                <span className="text-sm font-medium text-default-700">Driver Path ({trackingData?.driver_locations?.length || data?.tracking?.coordinate_count || 0} points)</span>
              </div>
            </div>
          </div>

          {/* Location Tracking Data Card */}
          {trackingData && (
            <div className="card">
              <div className="p-5 border-b border-default-200 flex items-center gap-2">
                <LuNavigation className="size-5 text-primary" />
                <h4 className="text-base font-semibold text-primary">Location Tracking Data</h4>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="bg-default-50 p-4 rounded-lg border border-default-100 hover:border-primary/20 transition-all">
                    <p className="text-[11px] text-default-500 mb-2 uppercase tracking-wider font-semibold">Pickup Coordinates</p>
                    <div className="space-y-1.5 mt-2">
                      <p className="text-sm flex justify-between items-center"><span className="font-semibold text-default-600">Lat:</span> <span className="text-default-800 font-mono text-xs">{trackingData.pickup_latitude || 'N/A'}</span></p>
                      <p className="text-sm flex justify-between items-center"><span className="font-semibold text-default-600">Lng:</span> <span className="text-default-800 font-mono text-xs">{trackingData.pickup_longitude || 'N/A'}</span></p>
                    </div>
                  </div>

                  <div className="bg-default-50 p-4 rounded-lg border border-default-100 hover:border-primary/20 transition-all">
                    <p className="text-[11px] text-default-500 mb-2 uppercase tracking-wider font-semibold">Dropoff Coordinates</p>
                    <div className="space-y-1.5 mt-2">
                      <p className="text-sm flex justify-between items-center"><span className="font-semibold text-default-600">Lat:</span> <span className="text-default-800 font-mono text-xs">{trackingData.dropoff_latitude || 'N/A'}</span></p>
                      <p className="text-sm flex justify-between items-center"><span className="font-semibold text-default-600">Lng:</span> <span className="text-default-800 font-mono text-xs">{trackingData.dropoff_longitude || 'N/A'}</span></p>
                    </div>
                  </div>

                  <div className="bg-default-50 p-4 rounded-lg border border-default-100 flex flex-col justify-center hover:border-primary/20 transition-all">
                    <p className="text-[11px] text-default-500 mb-1 uppercase tracking-wider font-semibold">Estimated Distance</p>
                    <p className="text-xl font-bold text-primary">{trackingData.estimated_distance ? `${parseFloat(trackingData.estimated_distance).toFixed(2)} mi` : 'N/A'}</p>
                  </div>

                  <div className="bg-default-50 p-4 rounded-lg border border-default-100 flex flex-col justify-center hover:border-primary/20 transition-all">
                    <p className="text-[11px] text-default-500 mb-1 uppercase tracking-wider font-semibold">Estimated Time</p>
                    <p className="text-xl font-semibold text-default-800">{trackingData.estimated_time ? `${Math.round(trackingData.estimated_time / 60)} mins` : 'N/A'}</p>
                  </div>

                  <div className="bg-warning/10 p-4 rounded-lg border border-warning/20 flex flex-col justify-center">
                    <p className="text-[11px] text-warning mb-1 uppercase tracking-wider font-bold">Remaining Distance</p>
                    <p className="text-xl font-bold text-warning">{trackingData.remaining_distance ? `${parseFloat(trackingData.remaining_distance).toFixed(2)} mi` : '0 mi'}</p>
                  </div>

                  <div className="bg-default-50 p-4 rounded-lg border border-default-100 flex flex-col justify-center">
                    <p className="text-[11px] text-default-500 mb-1 uppercase tracking-wider font-semibold">Remaining Time</p>
                    <p className="text-xl font-semibold text-default-800">{trackingData.remaining_time ? `${Math.round(trackingData.remaining_time / 60)} mins` : '0 mins'}</p>
                  </div>

                  <div className="bg-success/10 p-4 rounded-lg border border-success/20 flex flex-col justify-center">
                    <p className="text-[11px] text-success mb-1 uppercase tracking-wider font-bold">Travelled Distance</p>
                    <p className="text-xl font-bold text-success">{trackingData.actual_distance_travelled ? `${parseFloat(trackingData.actual_distance_travelled).toFixed(2)} mi` : '0.00 mi'}</p>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 flex flex-col justify-center">
                    <p className="text-[11px] text-primary mb-1 uppercase tracking-wider font-bold">Tracking Pings</p>
                    <p className="text-xl font-bold text-primary">{trackingData.driver_locations ? trackingData.driver_locations.length : 0} nodes</p>
                  </div>

                </div>

                {/* Status Banner */}
                <div className="mt-4 bg-default-50 p-5 rounded-lg border border-default-200 flex flex-col sm:flex-row justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      {trackingData.status === 'COMPLETED' ? (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                      ) : (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-default-800">Trip Progression Status</span>
                  </div>
                  <span className={`mt-3 sm:mt-0 py-1.5 px-5 text-xs font-bold tracking-wider uppercase rounded-full ${trackingData.status === 'COMPLETED' ? 'bg-success/20 text-success border border-success/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                    {trackingData.status_display || trackingData.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Driver Assignments Table */}
          <div className="card">
            <div className="p-5 border-b border-default-200 flex items-center gap-2">
              <LuCar className="size-5 text-default-600" />
              <h4 className="text-base font-semibold text-default-800">Driver Assignments</h4>
            </div>
            {data.driver_assignments && data.driver_assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-default-200">
                  <thead className="bg-default-50">
                    <tr>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Driver</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Cancel Reason</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Requested At</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Accepted At</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-200">
                    {data.driver_assignments.map((assignment, idx) => (
                      <tr key={assignment.id || idx} className="hover:bg-default-50 transition-colors">
                        <td className="px-4 py-3 text-sm">
                          <span className="font-semibold text-default-800 block">{assignment.driver_info?.name || 'Unknown'}</span>
                          <span className="text-xs text-default-500">{assignment.driver_info?.phone_number}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={(() => {
                            const s = String(assignment.status_display || assignment.status || '').toUpperCase();
                            return `py-1 px-3 text-[11px] font-bold uppercase tracking-wider rounded-full border ${
                               s.includes('COMPLETE') ? 'bg-success/10 text-success border-success/30' :
                               s.includes('ACCEPT') ? 'bg-warning/10 text-warning border-warning/30' :
                               s.includes('DECLINE') || s.includes('CANCEL') || s.includes('EXPIRE') ? 'bg-danger/10 text-danger border-danger/30' :
                               'bg-default-100 text-default-700 border-default-200'
                            }`;
                          })()}>
                            {assignment.status_display || assignment.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-default-600 italic max-w-xs">{assignment.cancellation_reason || '-'}</td>
                        <td className="px-4 py-3 text-xs text-default-500">{formatDate(assignment.requested_at) !== 'N/A' ? formatDate(assignment.requested_at) : '-'}</td>
                        <td className="px-4 py-3 text-xs text-default-500">{formatDate(assignment.accepted_at) !== 'N/A' ? formatDate(assignment.accepted_at) : '-'}</td>
                        <td className="px-4 py-3 text-xs text-default-500">{formatDate(assignment.created_at) !== 'N/A' ? formatDate(assignment.created_at) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-default-500">
                No driver assignments currently recorded.
              </div>
            )}
          </div>

          {/* Boardings Table */}
          <div className="card">
            <div className="p-5 border-b border-default-200 flex items-center gap-2">
              <LuCreditCard className="size-5 text-default-600" />
              <h4 className="text-base font-semibold text-default-800">Boarding Payments</h4>
            </div>
            {data.boardings && data.boardings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-default-200">
                  <thead className="bg-default-50">
                    <tr>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Boarding ID</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Preauth Amt</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Payable Amt</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Is Preauth</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Is Captured</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Pay Source</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Driver Hold</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Transferred</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Boarded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-200">
                    {data.boardings.map((board) => {
                      const isExpanded = expandedBoardings.has(board.id);
                      return (
                        <React.Fragment key={board.id}>
                          <tr 
                            className="cursor-pointer hover:bg-default-50 transition-colors"
                            onClick={() => toggleBoarding(board.id)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-default-700">
                              <div className="flex items-center gap-2">
                                {isExpanded ? <LuChevronUp className="size-4 text-default-400" /> : <LuChevronDown className="size-4 text-default-400" />}
                                <span>#{board.id} {board.is_primary && <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded ml-1 uppercase">Primary</span>}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-default-600">${parseFloat(board.preauthorized_amount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-default-800">${parseFloat(board.payable_amount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm">{board.is_preauthorized ? <span className="text-success font-semibold">Yes</span> : <span className="text-default-400">No</span>}</td>
                            <td className="px-4 py-3 text-sm">{board.is_payment_captured ? <span className="text-success font-semibold">Yes</span> : <span className="text-default-400">No</span>}</td>
                            <td className="px-4 py-3 text-sm text-xs font-medium text-default-600 uppercase tracking-widest">{board.payment_source || '-'}</td>
                            <td className="px-4 py-3 text-sm text-warning font-medium">${parseFloat(board.driver_transfer_hold_amount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-success font-medium">${parseFloat(board.transferred_driver_amount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-xs text-default-500">{formatDate(board.boarded_at)}</td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan="9" className="p-0 bg-default-50 border-b border-default-200 shadow-inner">
                                <div className="p-5 overflow-x-auto">
                                   <div className="flex items-center gap-2 mb-3">
                                      <h5 className="text-sm font-semibold text-default-800">Extended Boarding Details</h5>
                                      {board.rider_info && <span className="text-xs text-default-500 ml-2">Payer: <b className="text-default-700">{board.rider_info.name}</b></span>}
                                   </div>
                                   <div className="grid grid-cols-1 lg:grid-cols-2 text-xs text-left text-default-600 bg-white border border-default-200 rounded-md shadow-sm overflow-hidden">
                                       {Object.entries(board).map(([key, value]) => {
                                          if (key === 'rider_info' || key === 'id') return null;
                                          return (
                                            <div key={key} className="flex border-b border-default-100 hover:bg-default-50/50 lg:even:border-l lg:even:border-l-default-100">
                                              <div className="px-3 py-2 font-semibold bg-default-50/50 w-2/5 border-r border-default-100 uppercase tracking-wider text-[10px] text-default-500 flex items-center shrink-0">
                                                 {key.replace(/_/g, ' ')}
                                              </div>
                                              <div className="px-3 py-2 break-all text-xs font-mono text-default-700 flex-1 flex items-center">
                                                 {value !== null && value !== undefined ? value.toString() : '-'}
                                              </div>
                                            </div>
                                          )
                                       })}
                                   </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-default-500">
                No boarding payment data populated yet.
              </div>
            )}
          </div>

          {/* Tips Table */}
          <div className="card">
            <div className="p-5 border-b border-default-200 flex items-center gap-2">
              <LuDollarSign className="size-5 text-default-600" />
              <h4 className="text-base font-semibold text-default-800">Ride Tips</h4>
            </div>
            {tipsData && tipsData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-default-200">
                  <thead className="bg-default-50">
                    <tr>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Tip ID</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Boarding ID</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Rider</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Driver</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Tip Amount</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Driver Share</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold text-default-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-200">
                    {tipsData.map((tip) => (
                      <tr key={tip.id} className="hover:bg-default-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-default-700">#{tip.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-default-600">#{tip.boarding_id}</td>
                        <td className="px-4 py-3 text-sm">
                           <span className="block font-medium text-default-800">{tip.rider_info?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                           <span className="block font-medium text-default-800">{tip.driver_info?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-success">${parseFloat(tip.actual_tip || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-default-600">${parseFloat(tip.driver_share || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                           <span className="py-1 px-2.5 bg-default-100 border border-default-200 text-default-700 rounded-full text-[11px] uppercase tracking-wider font-bold">{tip.tip_type_display || tip.tip_type || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-default-500">{formatDate(tip.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-default-500">
                No tips recorded for this ride.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Ride Timeline View */}
      <div className="card">
        <div className="p-5 border-b border-default-200 flex items-center gap-2">
          <LuClock className="size-5 text-default-600" />
          <h4 className="text-base font-semibold text-default-800">Ride Timeline</h4>
        </div>
        <div className="p-5">
          {timelineData && timelineData.length > 0 ? (
            <div className="relative border-s border-default-200 ms-3 py-2">
              {timelineData.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                return (
                  <div key={log.id} className="mb-6 ms-6 relative">
                    <span className="absolute flex items-center justify-center w-3 h-3 bg-white rounded-full -start-[31px] top-4 ring-[3px] ring-success/30 border-2 border-success z-10"></span>
                    <div
                      className="border border-default-200 overflow-hidden rounded-lg shadow-sm bg-white cursor-pointer hover:border-success/50 transition-colors"
                      onClick={() => toggleLog(log.id)}
                    >
                      <div className="flex">
                        <div className="w-1 bg-success shrink-0"></div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-semibold text-sm text-default-800">{log.log_type_display || 'Information'}</h5>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-default-600 font-semibold">{formatTimelineDate(log.timestamp)}</span>
                              {isExpanded ? <LuChevronUp className="size-4 text-default-400" /> : <LuChevronDown className="size-4 text-default-400" />}
                            </div>
                          </div>
                          <p className="text-sm text-default-700 mb-4">{log.description}</p>
                          <div className="flex items-center gap-4 text-xs font-semibold text-default-800">
                            {log.rider_info && <span>Rider: <span className="font-normal text-default-500">{log.rider_info.name || 'Unknown'}</span></span>}
                            {log.driver_info && <span>Driver: <span className="font-normal text-default-500">{log.driver_info.name || 'Unknown'}</span></span>}
                          </div>

                          {/* Collapsible Data Block */}
                          {isExpanded && log.data && (
                            <div className="mt-4 p-4 bg-default-50 border border-default-200 rounded-md">
                              <span className="text-sm font-bold text-default-800 mb-2 block">Data:</span>
                              <pre className="text-xs text-default-700 font-mono whitespace-pre-wrap">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-default-500">
              No timeline events recorded.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default RideDetailsView;
