"use client";
import React, { useState } from 'react';
import { LuX, LuChevronRight, LuChevronLeft, LuUpload, LuLoader, LuEye, LuEyeOff } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const AddDriverModal = ({ isOpen, onClose, onAdded, driverData }) => {
  const { token } = useAuthContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const fetchedVehiclesRef = React.useRef(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    password: '',
    username: '',
    is_verified: 'true',
    is_affiliate: 'false',
    is_psp_user: 'false',
    active: 'true',
    longitude: '',
    latitude: '',
    rating: '4.5',
    profile_picture: null,
    source: 'admin_panel',
    license_image: null,
    vehicle_type_id: '1',
    vehicle_number: '',
    status: '3',
    is_locked: 'false',
    is_location_shared: 'true',
    is_approved: 'false',
    is_stripe_onboarded: 'false'
  });

  React.useEffect(() => {
    if (isOpen && driverData) {
      setStep(1);
      setFormData({
         name: driverData.name || '',
         phone_number: driverData.phone_number || '',
         email: driverData.email || '',
         password: '', // Optional on edit
         username: driverData.username || '',
         is_verified: driverData.is_verified ? 'true' : 'false',
         is_affiliate: driverData.is_affiliate ? 'true' : 'false',
         is_psp_user: driverData.is_psp_user ? 'true' : 'false',
         active: driverData.is_active ? 'true' : 'false',
         longitude: driverData.longitude || '',
         latitude: driverData.latitude || '',
         rating: driverData.rating || '4.5',
         source: driverData.source || 'admin_panel',
         profile_picture: null,
         license_image: null,
         vehicle_type_id: driverData.driver_info?.vehicle_type ? String(driverData.driver_info.vehicle_type) : '1',
         vehicle_number: driverData.driver_info?.vehicle_number || '',
         status: driverData.driver_info?.status ? String(driverData.driver_info.status) : '3',
         is_locked: driverData.driver_info?.is_locked ? 'true' : 'false',
         is_location_shared: driverData.driver_info?.is_location_shared ? 'true' : 'false',
         is_approved: driverData.driver_info?.is_approved ? 'true' : 'false',
         is_stripe_onboarded: driverData.driver_info?.is_stripe_onboarded ? 'true' : 'false'
      });
      setProfilePreview(driverData.profile_picture || null);
      setLicensePreview(driverData.driver_info?.license_image || null);
    } else if (isOpen && !driverData) {
      setStep(1);
      setFormData({
        name: '', phone_number: '', email: '', password: '', username: '', 
        is_verified: 'true', is_affiliate: 'false', is_psp_user: 'false', 
        active: 'true', longitude: '', latitude: '', rating: '4.5', 
        profile_picture: null, source: 'admin_panel',
        license_image: null, vehicle_type_id: '1', vehicle_number: '', status: '3',
        is_locked: 'false', is_location_shared: 'true', is_approved: 'false', is_stripe_onboarded: 'false'
      });
      setConfirmPassword('');
      setProfilePreview(null);
      setLicensePreview(null);
    }
  }, [isOpen, driverData]);

  React.useEffect(() => {
    const fetchVehicles = async () => {
      if (!isOpen || !token || fetchedVehiclesRef.current) return;
      fetchedVehiclesRef.current = true;
      try {
        const res = await apiFetch('/api/v1/admin/system/vehicles/?limit=100', { token });
        const dataList = res.data || res || [];
        setVehicles(dataList);
        // Pre-select first vehicle if none selected and it's step 1 initialization (or early)
        if (dataList.length > 0 && formData.vehicle_type_id === '1') {
          setFormData(prev => ({ ...prev, vehicle_type_id: String(dataList[0].id) }));
        }
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
        fetchedVehiclesRef.current = false;
      }
    };
    fetchVehicles();
  }, [isOpen, token]);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone_number || (!driverData && !formData.username)) {
        setError(driverData ? 'Name and Phone Number are mandatory.' : 'Name, Phone Number, and Username are mandatory.');
        return;
      }
      if (!driverData && (!formData.password || !confirmPassword)) {
        setError('Please fill in password fields.');
        return;
      }
      if (formData.password && formData.password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    if (step === 2) {
      if (!driverData && !formData.license_image && !licensePreview) {
        setError('License Image is a mandatory field.');
        return;
      }
    }
    setError('');
    setStep(prev => prev + 1);
  };
  const handlePrev = () => setStep(prev => prev - 1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked ? 'true' : 'false' }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleLicenseChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, license_image: file }));
      setLicensePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.vehicle_type_id || !formData.vehicle_number) {
      setError('Vehicle Type and Vehicle Number are mandatory fields.');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if ((key === 'profile_picture' || key === 'license_image') && !formData[key]) return;
        submitData.append(key, formData[key]);
      });
      if (!driverData) {
         submitData.append('last_login', new Date().toISOString());
         submitData.append('date_joined', new Date().toISOString());
      } else {
         if (!formData.password) {
            submitData.delete('password'); // Don't send empty password string on update
         }
      }

      await apiFetch(driverData ? `/api/v1/admin/drivers/${driverData.id}/` : '/api/v1/admin/drivers/add/', {
        method: driverData ? 'PUT' : 'POST',
        token, 
        body: submitData
      });

      onAdded();
      onClose();
      // Reset form
      setStep(1);
      setFormData({
        name: '', phone_number: '', email: '', password: '', username: '', 
        is_verified: 'true', is_affiliate: 'false', is_psp_user: 'false', 
        active: 'true', longitude: '', latitude: '', rating: '4.5', 
        source: 'admin_panel', profile_picture: null,
        license_image: null, vehicle_type_id: '1', vehicle_number: '', status: '3',
        is_locked: 'false', is_location_shared: 'true', is_approved: 'false', is_stripe_onboarded: 'false'
      });
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setProfilePreview(null);
      setLicensePreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-default-200">
          <div>
            <h3 className="text-xl font-semibold text-default-800">{driverData ? 'Edit Driver' : 'Add New Driver'}</h3>
            <p className="text-sm text-default-500 mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-default-400 hover:text-default-600 transition-colors">
            <LuX className="size-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="w-full bg-default-100 h-1.5">
          <div
            className="bg-primary h-1.5 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-danger/10 text-danger border border-danger/20 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <form id="add-driver-form" className="space-y-4">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h4 className="font-medium text-default-700 mb-4 border-b border-default-200 pb-2">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Name <span className="text-danger">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input w-full" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input w-full" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Phone Number <span className="text-danger">*</span></label>
                    <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="form-input w-full" placeholder="+1234567890" />
                  </div>
                  {!driverData ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-default-700">Username <span className="text-danger">*</span></label>
                      <input type="text" name="username" value={formData.username} onChange={handleChange} required className="form-input w-full" placeholder="user_123" />
                    </div>
                  ) : (
                    <div className="hidden md:block"></div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Password {!driverData && <span className="text-danger">*</span>}</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required className="form-input w-full pe-10" placeholder="SecurePass123!" />
                      <button type="button" className="absolute inset-y-0 end-0 flex items-center pe-3 text-default-400 hover:text-default-600" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Confirm Password <span className="text-danger">*</span></label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="form-input w-full pe-10" placeholder="Confirm your password" />
                      <button type="button" className="absolute inset-y-0 end-0 flex items-center pe-3 text-default-400 hover:text-default-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h4 className="font-medium text-default-700 mb-4 border-b border-default-200 pb-2">Images & Location</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Profile Picture */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      {profilePreview && (
                        <div className="relative size-24 rounded-full border border-default-200 overflow-hidden shrink-0">
                          <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-default-300 border-dashed rounded-lg cursor-pointer bg-default-50 hover:bg-default-100 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <LuUpload className="size-5 text-default-400 mb-1" />
                          <p className="text-sm text-default-500">
                            {formData.profile_picture ? "Change image" : <><span className="font-semibold text-primary">Click to upload</span></>}
                          </p>
                        </div>
                        <input type="file" name="profile_picture" onChange={handleProfileChange} className="hidden" accept="image/*" />
                      </label>
                    </div>
                  </div>

                  {/* License Image */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">License Image <span className="text-danger">*</span></label>
                    <div className="flex items-center gap-4">
                      {licensePreview && (
                        <div className="relative w-24 h-24 rounded border border-default-200 overflow-hidden shrink-0 bg-white">
                          <img src={licensePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-default-300 border-dashed rounded-lg cursor-pointer bg-default-50 hover:bg-default-100 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <LuUpload className="size-5 text-default-400 mb-1" />
                          <p className="text-sm text-default-500">
                            {formData.license_image ? "Change image" : <><span className="font-semibold text-primary">Click to upload</span></>}
                          </p>
                        </div>
                        <input type="file" name="license_image" onChange={handleLicenseChange} className="hidden" accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Latitude</label>
                    <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} className="form-input w-full" placeholder="40.730610" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Longitude</label>
                    <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} className="form-input w-full" placeholder="-73.935242" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Initial Rating</label>
                    <input type="number" step="0.1" max="5.0" min="0" name="rating" value={formData.rating} onChange={handleChange} required className="form-input w-full" placeholder="4.5" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h4 className="font-medium text-default-700 mb-4 border-b border-default-200 pb-2">Vehicle & Settings</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Assigned Vehicle <span className="text-danger">*</span></label>
                    <select name="vehicle_type_id" value={formData.vehicle_type_id} onChange={handleChange} required className="form-input w-full pe-8 text-ellipsis">
                      <option value="">Select an assigned vehicle</option>
                      {vehicles.map(v => {
                        const baseName = v.name || v.vehicle_type || `Vehicle #${v.id}`;
                        const tag = v.ride_type ? ` [${String(v.ride_type).toUpperCase()}]` : '';
                        return <option key={v.id} value={v.id}>{baseName}{tag}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Vehicle Number <span className="text-danger">*</span></label>
                    <input type="text" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} required className="form-input w-full" placeholder="XYZ-9876" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Source</label>
                    <select name="source" value={formData.source} onChange={handleChange} className="form-input w-full pe-8 text-ellipsis">
                      <option value="admin_panel">Admin Panel</option>
                      <option value="app">App</option>
                      <option value="web">Web</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="form-input w-full pe-8 text-ellipsis">
                      <option value="1">Available</option>
                      <option value="2">Busy</option>
                      <option value="3">Offline</option>
                    </select>
                  </div>
                </div>

                <h4 className="font-medium text-default-700 mb-4 border-b border-default-200 pb-2">Flags & Approvals</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                  
                  {[
                    { label: "Is Verified", name: "is_verified", desc: "Phone/Email verified" },
                    { label: "Is Affiliate", name: "is_affiliate", desc: "Is affiliate user" },
                    { label: "Is PSP User", name: "is_psp_user", desc: "PSP mapped user" },
                    { label: "Active Status", name: "active", desc: "Can log in" },
                    { label: "Is Locked", name: "is_locked", desc: "Manual account lock" },
                    { label: "Location Shared", name: "is_location_shared", desc: "Current location is shared" },
                    { label: "Is Approved", name: "is_approved", desc: "Approved to drive" },
                    { label: "Stripe Onboarded", name: "is_stripe_onboarded", desc: "Completed Stripe flow" }
                  ].map((field) => (
                    <div key={field.name} className="flex items-center justify-between p-3 border border-default-200 rounded-lg bg-default-50/50">
                      <div>
                        <h5 className="text-sm font-medium text-default-800">{field.label}</h5>
                        <p className="text-xs text-default-500">{field.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name={field.name} onChange={handleChange} checked={formData[field.name] === 'true'} className="sr-only peer" />
                        <div className={`w-11 h-6 bg-default-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${formData[field.name] === 'true' ? 'peer-checked:bg-primary' : ''}`}></div>
                      </label>
                    </div>
                  ))}

                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-default-200 flex items-center justify-between bg-default-50/50">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className={`btn px-4 py-2 border transition-colors flex items-center gap-1.5 ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white border-default-200 text-default-600 hover:bg-default-100'}`}
          >
            <LuChevronLeft className="size-4" /> Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              Continue <LuChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn px-5 py-2 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <><LuLoader className="size-4 animate-spin" /> {driverData ? 'Saving...' : 'Adding...'}</>
              ) : (
                <>{driverData ? 'Save Changes' : 'Complete'} <LuChevronRight className="size-4" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDriverModal;
