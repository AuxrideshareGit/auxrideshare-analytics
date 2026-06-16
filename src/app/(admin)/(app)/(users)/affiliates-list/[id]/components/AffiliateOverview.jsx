"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuArrowLeft, LuLoader, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const AffiliateOverview = ({ affiliateId }) => {
  const { token } = useAuthContext();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [commPage, setCommPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !affiliateId) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', commPage);
        queryParams.append('payout_page', payoutPage);
        queryParams.append('limit', limit);

        const result = await apiFetch(`/api/v1/admin/affiliates/${affiliateId}/commission-history/?${queryParams}`, { token });
        setData(result);
      } catch (error) {
        console.error("Error fetching affiliate history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [affiliateId, commPage, payoutPage, limit, token]);

  const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        ...options
    });
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center py-20">
        <LuLoader className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-default-500">No details found.</div>;
  }

  const affiliate = data.affiliate_info || {};
  const totals = data.totals || {};
  const commissions = data.commissions || { data: [], total_count: 0, total_pages: 1 };
  const payouts = data.payouts || { data: [], total_count: 0, total_pages: 1 };

  return (
    <div className="space-y-6">
      {/* PSP User Details Card */}
      <div className="border border-default-200 rounded-lg bg-white overflow-hidden shadow-sm">
        <div className="bg-default-50 px-6 py-4 border-b border-default-200">
          <h3 className="text-lg text-default-800">PSP User Details</h3>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex">
            <div className="w-32 font-semibold text-sm text-default-700">Name:</div>
            <div className="text-sm text-default-600">{affiliate.name || 'N/A'}</div>
          </div>
          <div className="flex">
            <div className="w-32 font-semibold text-sm text-default-700">Phone:</div>
            <div className="text-sm text-default-600">{affiliate.phone_number || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Summary Totals */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-6 flex flex-col justify-center">
          <h4 className="text-warning-700 font-semibold mb-2">Pending Commission</h4>
          <div className="text-warning-600 text-3xl font-bold">
            ${(totals.pending_commission || 0).toFixed(2)}
          </div>
        </div>
        
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 flex flex-col justify-center">
          <h4 className="text-primary font-semibold mb-2">Total Paid Out (Stripe)</h4>
          <div className="text-primary text-3xl font-bold">
            ${(totals.total_paid_out || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Recent Commission Records Table */}
      <div className="card shadow-sm border border-default-200 overflow-hidden">
        <div className="bg-black px-6 py-4 flex items-center">
          <span className="text-yellow-500 mr-2">💰</span>
          <h3 className="text-white font-medium">Recent Commission Records ({commissions.total_count} total)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-default-200">
            <thead className="bg-default-50">
              <tr className="text-sm font-semibold text-default-800 whitespace-nowrap">
                <th className="px-6 py-4 text-start">Rider Request ID</th>
                <th className="px-6 py-4 text-start">Amount</th>
                <th className="px-6 py-4 text-start">Status</th>
                <th className="px-6 py-4 text-start min-w-[200px]">Pickup Address</th>
                <th className="px-6 py-4 text-start min-w-[200px]">Dropoff Address</th>
                <th className="px-6 py-4 text-start">Driver</th>
                <th className="px-6 py-4 text-start">PSP</th>
                <th className="px-6 py-4 text-start">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200 bg-white">
              {commissions.data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-default-500">
                    No recent commissions found.
                  </td>
                </tr>
              ) : (
                commissions.data.map((comm) => {
                  return (
                    <tr key={comm.id} className="text-default-700 text-sm hover:bg-default-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                        <Link href={`/rider-requests/${comm.ride_request_id || ''}`} className="hover:underline">
                          #{comm.ride_request_id || comm.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-success-600">
                        ${(comm.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-[11px] uppercase font-bold rounded ${
                          comm.status === 'PAID' ? 'bg-success text-white' : 'bg-warning text-white'
                        }`}>
                          {comm.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs" title={comm.ride_details?.pickup_address}>
                        {comm.ride_details?.pickup_address || '-'}
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs" title={comm.ride_details?.dropoff_address}>
                        {comm.ride_details?.dropoff_address || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {comm.ride_details?.driver_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {affiliate.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-default-600">
                        {formatDate(comm.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {commissions.total_pages > 1 && (
          <div className="p-4 border-t border-default-200 flex justify-end gap-2 bg-white">
             <button
                type="button"
                onClick={() => setCommPage(p => Math.max(1, p - 1))}
                disabled={commPage === 1}
                className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 disabled:opacity-50"
              >
                <LuChevronLeft className="size-4" />
             </button>
             <span className="flex items-center px-4 text-sm text-default-500">Page {commPage} of {commissions.total_pages}</span>
             <button
                type="button"
                onClick={() => setCommPage(p => Math.min(commissions.total_pages, p + 1))}
                disabled={commPage >= commissions.total_pages}
                className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 disabled:opacity-50"
              >
                <LuChevronRight className="size-4" />
             </button>
          </div>
        )}
      </div>

      {/* Recent Payout Transactions Table */}
      <div className="card shadow-sm border border-default-200 overflow-hidden">
        <div className="bg-black px-6 py-4 flex items-center">
          <span className="text-success mr-2">💸</span>
          <h3 className="text-white font-medium">Recent Payout Transactions ({payouts.total_count} total)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-default-200">
            <thead className="bg-default-50">
              <tr className="text-sm font-semibold text-default-800 whitespace-nowrap">
                <th className="px-6 py-4 text-start">Amount</th>
                <th className="px-6 py-4 text-start">Status</th>
                <th className="px-6 py-4 text-start">Processed By</th>
                <th className="px-6 py-4 text-start">Stripe Transfer ID</th>
                <th className="px-6 py-4 text-start">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200 bg-white">
              {payouts.data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-default-500">
                    No recent payout transactions found.
                  </td>
                </tr>
              ) : (
                payouts.data.map((payout) => (
                  <tr key={payout.id} className="text-default-700 text-sm hover:bg-default-50">
                    <td className="px-6 py-4 font-bold text-danger-600 whitespace-nowrap">
                      ${(payout.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[11px] uppercase font-bold rounded ${
                        payout.status === 'COMPLETED' ? 'bg-success text-white' : 'bg-default-300 text-default-800'
                      }`}>
                        {payout.status === 'COMPLETED' ? 'SUCCESS' : payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payout.processed_by || '-'}
                    </td>
                    <td className="px-6 py-4 text-default-500 whitespace-nowrap">
                      {payout.id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-default-500">
                      {formatDate(payout.processed_at || payout.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {payouts.total_pages > 1 && (
          <div className="p-4 border-t border-default-200 flex justify-end gap-2 bg-white">
             <button
                type="button"
                onClick={() => setPayoutPage(p => Math.max(1, p - 1))}
                disabled={payoutPage === 1}
                className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 disabled:opacity-50"
              >
                <LuChevronLeft className="size-4" />
             </button>
             <span className="flex items-center px-4 text-sm text-default-500">Page {payoutPage} of {payouts.total_pages}</span>
             <button
                type="button"
                onClick={() => setPayoutPage(p => Math.min(payouts.total_pages, p + 1))}
                disabled={payoutPage >= payouts.total_pages}
                className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 disabled:opacity-50"
              >
                <LuChevronRight className="size-4" />
             </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AffiliateOverview;
