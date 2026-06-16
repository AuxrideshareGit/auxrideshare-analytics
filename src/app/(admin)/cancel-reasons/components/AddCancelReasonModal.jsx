import React, { useState, useEffect } from 'react';
import { LuX, LuLoader } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const AddCancelReasonModal = ({ isOpen, onClose, onAdded, editData }) => {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    reason: '',
    user_type: 'Driver',
    reassign_to_pool: true,
    send_notification_to_rider: true
  });

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          reason: editData.reason || '',
          user_type: editData.user_type || 'Driver',
          reassign_to_pool: editData.reassign_to_pool || false,
          send_notification_to_rider: editData.send_notification_to_rider || false
        });
      } else {
        setFormData({
          reason: '',
          user_type: 'Driver',
          reassign_to_pool: true,
          send_notification_to_rider: true
        });
      }
      setError(null);
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editData) {
        // PUT
        await apiFetch(`/api/v1/admin/system/cancel-reasons/${editData.id}/`, {
          method: 'PUT',
          token,
          body: JSON.stringify(formData)
        });
      } else {
        // POST
        await apiFetch('/api/v1/admin/system/cancel-reasons/add/', {
          method: 'POST',
          token,
          body: JSON.stringify(formData)
        });
      }
      setLoading(false);
      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while saving the cancel reason.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-default-50">
        <div className="flex items-center justify-between border-b border-default-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-default-800">
            {editData ? 'Edit Cancel Reason' : 'Add Cancel Reason'}
          </h3>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-default-400 hover:bg-default-100 hover:text-default-700"
            onClick={onClose}
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="rounded-md bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-default-800">
                Reason Text <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                className="form-input w-full rounded-lg border border-default-200 px-4 py-2.5 dark:bg-default-50"
                placeholder="e.g. Driver arrived late"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-default-800">
                User Type <span className="text-danger">*</span>
              </label>
              <select
                required
                className="form-input w-full rounded-lg border border-default-200 px-4 py-2.5 dark:bg-default-50"
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
              >
                <option value="Driver">Driver</option>
                <option value="Rider">Rider</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-sm font-medium text-default-800">
                Reassign to Pool
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 rounded border-default-300 text-primary focus:ring-primary"
                  checked={formData.reassign_to_pool}
                  onChange={(e) => setFormData({ ...formData, reassign_to_pool: e.target.checked })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="text-sm font-medium text-default-800">
                Send Notification to Rider
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 rounded border-default-300 text-primary focus:ring-primary"
                  checked={formData.send_notification_to_rider}
                  onChange={(e) => setFormData({ ...formData, send_notification_to_rider: e.target.checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-default-200 px-6 py-4">
            <button
              type="button"
              className="rounded-lg border border-default-200 bg-white px-5 py-2.5 text-sm font-medium text-default-700 hover:bg-default-100"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <LuLoader className="h-5 w-5 animate-spin mr-2" /> : null}
              {editData ? 'Update Reason' : 'Save Reason'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCancelReasonModal;
