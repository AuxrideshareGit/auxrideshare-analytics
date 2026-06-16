"use client";
import React, { useState } from 'react';
import { LuX, LuChevronRight, LuChevronLeft, LuUpload, LuLoader, LuImage, LuEye, LuEyeOff } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const AddRiderModal = ({ isOpen, onClose, onAdded, riderData }) => {
  const { token } = useAuthContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
    rating: '5.0',
    source: 'admin_panel',
    profile_picture: null,
  });

  React.useEffect(() => {
    if (isOpen && riderData) {
      setStep(1);
      setFormData({
         name: riderData.name || '',
         phone_number: riderData.phone_number || '',
         email: riderData.email || '',
         password: '', // Optional on edit
         username: riderData.username || '',
         is_verified: riderData.is_verified ? 'true' : 'false',
         is_affiliate: riderData.is_affiliate ? 'true' : 'false',
         is_psp_user: riderData.is_psp_user ? 'true' : 'false',
         active: riderData.is_active ? 'true' : 'false',
         longitude: riderData.longitude || '',
         latitude: riderData.latitude || '',
         rating: riderData.rating || '5.0',
         source: riderData.source || 'admin_panel',
         profile_picture: null,
      });
      setImagePreview(riderData.profile_picture || null);
    } else if (isOpen && !riderData) {
      setStep(1);
      setFormData({
        name: '', phone_number: '', email: '', password: '', username: '',
        is_verified: 'true', is_affiliate: 'false', is_psp_user: 'false',
        active: 'true', longitude: '', latitude: '', rating: '5.0',
        source: 'admin_panel', profile_picture: null
      });
      setConfirmPassword('');
      setImagePreview(null);
    }
  }, [isOpen, riderData]);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone_number || (!riderData && !formData.username)) {
        setError(riderData ? 'Name and Phone Number are mandatory.' : 'Name, Phone Number, and Username are mandatory.');
        return;
      }
      if (!riderData && (!formData.password || !confirmPassword)) {
        setError('Please fill in password fields.');
        return;
      }
      if (formData.password && formData.password !== confirmPassword) {
        setError('Passwords do not match.');
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'profile_picture' && !formData[key]) return;
        submitData.append(key, formData[key]);
      });
      if (!riderData) {
        submitData.append('last_login', new Date().toISOString());
        submitData.append('date_joined', new Date().toISOString());
      } else {
        if (!formData.password) {
           submitData.delete('password'); 
        }
      }

      await apiFetch(riderData ? `/api/v1/admin/riders/${riderData.id}/` : '/api/v1/admin/riders/add/', {
        method: riderData ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      onAdded();
      onClose();
      // Reset form
      setStep(1);
      setFormData({
        name: '', phone_number: '', email: '', password: '', username: '',
        is_verified: 'true', is_affiliate: 'false', is_psp_user: 'false',
        active: 'true', longitude: '', latitude: '', rating: '5.0',
        source: 'admin_panel', profile_picture: null
      });
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setImagePreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-default-200">
          <div>
            <h3 className="text-xl font-semibold text-default-800">{riderData ? 'Edit Rider' : 'Add New Rider'}</h3>
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

          <form id="add-rider-form" onSubmit={handleSubmit} className="space-y-4">

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
                  {!riderData ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-default-700">Username <span className="text-danger">*</span></label>
                      <input type="text" name="username" value={formData.username} onChange={handleChange} required className="form-input w-full" placeholder="user_123" />
                    </div>
                  ) : (
                    <div className="hidden md:block"></div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Password {!riderData && <span className="text-danger">*</span>}</label>
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
                <h4 className="font-medium text-default-700 mb-4 border-b border-default-200 pb-2">Profile & Location</h4>

                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-default-700">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <div className="relative size-24 rounded-full border border-default-200 overflow-hidden shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-default-300 border-dashed rounded-lg cursor-pointer bg-default-50 hover:bg-default-100 transition-colors">
                      <div className="flex flex-col items-center justify-center">
                        <LuUpload className="size-5 text-default-400 mb-1" />
                        <p className="text-sm text-default-500">
                          {formData.profile_picture ? "Change image" : <><span className="font-semibold text-primary">Click to upload</span></>}
                        </p>
                      </div>
                      <input type="file" name="profile_picture" onChange={handleFileChange} className="hidden" accept="image/*" />
                    </label>
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
                <h4 className="font-medium text-default-700 mb-4 border-b border-default-200 pb-2">Status & Settings</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">

                  <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg bg-default-50/50">
                    <div>
                      <h5 className="text-sm font-medium text-default-800">Is Verified</h5>
                      <p className="text-xs text-default-500">Rider phone/email is verified</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="is_verified" onChange={handleChange} checked={formData.is_verified === 'true'} className="sr-only peer" />
                      <div className="w-11 h-6 bg-default-200 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg bg-default-50/50">
                    <div>
                      <h5 className="text-sm font-medium text-default-800">Is Affiliate</h5>
                      <p className="text-xs text-default-500">Is this rider an affiliate</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="is_affiliate" onChange={handleChange} checked={formData.is_affiliate === 'true'} className="sr-only peer" />
                      <div className="w-11 h-6 bg-default-200 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg bg-default-50/50">
                    <div>
                      <h5 className="text-sm font-medium text-default-800">Is PSP User</h5>
                      <p className="text-xs text-default-500">Payment Service Provider User</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="is_psp_user" onChange={handleChange} checked={formData.is_psp_user === 'true'} className="sr-only peer" />
                      <div className="w-11 h-6 bg-default-200 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg bg-default-50/50">
                    <div>
                      <h5 className="text-sm font-medium text-default-800">Active Status</h5>
                      <p className="text-xs text-default-500">Allow rider to log in</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="active" onChange={handleChange} checked={formData.active === 'true'} className="sr-only peer" />
                      <div className="w-11 h-6 bg-default-200 rounded-full peer peer-checked:bg-success peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-default-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="mb-1.5 block text-sm font-medium text-default-700">Source</label>
                    <select name="source" value={formData.source} onChange={handleChange} className="form-input w-full">
                      <option value="admin_panel">Admin Panel</option>
                      <option value="app">App</option>
                      <option value="web">Web</option>
                    </select>
                  </div>

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
                <><LuLoader className="size-4 animate-spin" /> Adding...</>
              ) : (
                <>Complete <LuChevronRight className="size-4" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRiderModal;
