"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LuChevronLeft, LuChevronRight, LuLoader, LuArrowLeft, LuCircleX } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const TransferListTabel = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [transferDetails, setTransferDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [limit, setLimit] = useState(10);
  const [history, setHistory] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  
  const startingAfter = history.length > 0 ? history[history.length - 1] : undefined;
  const currentPage = history.length + 1;

  useEffect(() => {
    const fetchTransfers = async () => {
      if (!token || !userId) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('user_id', userId);
        queryParams.append('limit', limit);
        if (startingAfter) {
          queryParams.append('starting_after', startingAfter);
        }

        const result = await apiFetch(`/api/v1/admin/stripe/transfers/?${queryParams}`, { token });
        
        setData(result.data || []);
        setHasMore(result.has_more || false);
      } catch (error) {
        console.error("Error fetching transfers:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchTransfers();
    }, 300);

    return () => clearTimeout(timer);
  }, [userId, limit, startingAfter, token]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const d = new Date(timestamp * 1000);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  const formatAmount = (amount) => {
    return (amount / 100).toFixed(2);
  };

  const handleNext = () => {
    if (!hasMore || data.length === 0) return;
    setHistory([...history, data[data.length - 1].id]);
  };

  const handlePrev = () => {
    if (history.length === 0) return;
    setHistory(history.slice(0, -1));
  };
  
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setHistory([]);
  };

  const handleTransferClick = async (transferId) => {
    setSelectedTransfer(transferId);
    setLoadingDetails(true);
    setTransferDetails(null);
    try {
      const result = await apiFetch(`/api/v1/admin/stripe/transfers/${transferId}/`, { token });
      setTransferDetails(result.data || result);
    } catch (error) {
      console.error("Error fetching transfer details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeSidebar = () => {
    setSelectedTransfer(null);
    setTransferDetails(null);
  };

  if (!userId) {
    return (
      <div className="card text-center p-10 mt-8 shadow-sm">
        <h3 className="text-xl text-default-800">No User Provided</h3>
        <p className="text-default-500 mt-2">Cannot fetch Stripe transfers without a user ID specified.</p>
        <Link href="/drivers-list" className="btn btn-primary mt-6 inline-flex items-center">
          <LuArrowLeft className="size-4 me-2" /> Back to Drivers
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className={`transition-all duration-300 ${selectedTransfer ? 'lg:w-[70%]' : 'w-full'}`}>
        <div className="card">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-default-200">
            <Link href="/drivers-list" className="btn btn-sm bg-default-100 text-default-600 hover:bg-default-200 flex items-center">
              <LuArrowLeft className="size-4 me-1" /> Back to Drivers
            </Link>
          </div>

          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-default-200">
                    <thead className="bg-default-150">
                      <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
                        <th className="px-3.5 py-3 text-start">Transfer ID</th>
                        <th className="px-3.5 py-3 text-start">Amount</th>
                        <th className="px-3.5 py-3 text-start">Currency</th>
                        <th className="px-3.5 py-3 text-start">Description</th>
                        <th className="px-3.5 py-3 text-start">Destination Account</th>
                        <th className="px-3.5 py-3 text-start">Date</th>
                        <th className="px-3.5 py-3 text-start">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default-200">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="py-10 text-center">
                            <LuLoader className="animate-spin size-6 text-primary mx-auto" />
                            <p className="mt-2 text-default-500">Loading transfers...</p>
                          </td>
                        </tr>
                      ) : data.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-default-500">
                            No transfers found for this user.
                          </td>
                        </tr>
                      ) : (
                        data.map((transfer) => (
                          <tr 
                            key={transfer.id} 
                            onClick={() => handleTransferClick(transfer.id)}
                            className={`text-default-800 font-normal text-sm whitespace-nowrap hover:bg-default-50 transition-colors cursor-pointer ${selectedTransfer === transfer.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                          >
                            <td className="px-3.5 py-3 text-primary">{transfer.id}</td>
                            <td className="px-3.5 py-3 font-medium text-success">
                              ${formatAmount(transfer.amount)}
                            </td>
                            <td className="px-3.5 py-3 uppercase">{transfer.currency}</td>
                            <td className="px-3.5 py-3 text-default-600 truncate max-w-[200px]" title={transfer.description}>{transfer.description || 'Stripe Payout'}</td>
                            <td className="px-3.5 py-3 text-default-600">{transfer.destination || 'N/A'}</td>
                            <td className="py-3 px-3.5 text-default-600">{formatTimestamp(transfer.created)}</td>
                            <td className="px-3.5 py-3 whitespace-nowrap">
                              {transfer.reversed ? (
                                <span className="py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium bg-danger/10 text-danger rounded-md">
                                  Reversed
                                </span>
                              ) : (
                                <span className="py-0.5 px-2.5 inline-flex items-center gap-x-1 text-xs font-medium bg-success/10 text-success rounded-md">
                                  Completed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {!loading && (
              <div className="card-footer p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-default-500 text-sm">
                  Page <b>{currentPage}</b> {data.length > 0 ? `(Showing ${data.length} transfers)` : ''}
                </p>
                <nav className="flex items-center gap-1.5" aria-label="Pagination">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={history.length === 0}
                    className="btn btn-sm border bg-transparent border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LuChevronLeft className="size-4 me-1" /> Prev
                  </button>
    
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasMore}
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
                    onChange={handleLimitChange}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTransfer && (
        <div className="lg:w-[30%] w-full transition-all duration-300">
          <div className="card h-full">
            <div className="p-4 border-b border-default-200 flex justify-between items-center bg-default-50 rounded-t-lg">
              <h4 className="text-lg font-semibold text-default-800">Transfer Details</h4>
              <button 
                onClick={closeSidebar}
                className="text-default-400 hover:text-danger transition-colors bg-white rounded-full p-1 shadow-sm border border-default-200"
              >
                <LuCircleX className="size-5" />
              </button>
            </div>
            <div className="p-5">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <LuLoader className="animate-spin size-8 text-primary mb-4" />
                  <p className="text-default-500">Fetching Transfer Information...</p>
                </div>
              ) : transferDetails ? (
                <div className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-500 mb-1">Transfer Amount</p>
                      <h3 className="text-2xl font-bold text-success">${formatAmount(transferDetails.amount || 0)} <span className="text-sm font-normal uppercase text-default-600">{transferDetails.currency || 'usd'}</span></h3>
                    </div>
                    {transferDetails.reversed ? (
                      <span className="py-1 px-3 inline-flex items-center gap-x-1 text-sm font-medium bg-danger/10 text-danger rounded-md">Reversed</span>
                    ) : (
                      <span className="py-1 px-3 inline-flex items-center gap-x-1 text-sm font-medium bg-success/10 text-success rounded-md">Completed</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Transfer ID</p>
                      <p className="text-sm font-medium text-default-800 break-all">{transferDetails.id}</p>
                    </div>
                    
                    <div className="pt-3 border-t border-dashed border-default-200">
                      <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm font-medium text-default-800">{transferDetails.description || 'N/A'}</p>
                    </div>
                    
                    <div className="pt-3 border-t border-dashed border-default-200">
                      <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Destination Account</p>
                      <p className="text-sm text-primary font-medium">{transferDetails.destination || 'N/A'}</p>
                    </div>

                    {transferDetails.destination_payment && (
                      <div className="pt-3 border-t border-dashed border-default-200">
                        <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Destination Payment</p>
                        <p className="text-sm text-default-800 break-all">{transferDetails.destination_payment}</p>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-dashed border-default-200">
                      <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Balance Transaction</p>
                      <p className="text-sm text-default-800">{transferDetails.balance_transaction || 'N/A'}</p>
                    </div>

                    <div className="pt-3 border-t border-dashed border-default-200 flex justify-between">
                      <div>
                        <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Source Type</p>
                        <p className="text-sm font-medium text-default-800 capitalize">{transferDetails.source_type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Source Transaction</p>
                        <p className="text-sm font-medium text-default-800 break-all">{transferDetails.source_transaction || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-dashed border-default-200 flex justify-between">
                      <div>
                        <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Created At</p>
                        <p className="text-sm font-medium text-default-800">{formatTimestamp(transferDetails.created)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Amount Reversed</p>
                        <p className={`text-sm font-medium ${transferDetails.amount_reversed > 0 ? 'text-warning' : 'text-default-800'}`}>
                          ${formatAmount(transferDetails.amount_reversed || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-dashed border-default-200 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Object</p>
                        <span className="py-0.5 px-2 inline-flex items-center text-xs font-medium bg-default-100 text-default-600 rounded-md">
                          {transferDetails.object || 'transfer'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Livemode</p>
                        <span className={`py-0.5 px-2 inline-flex items-center text-xs font-medium rounded-md ${transferDetails.livemode ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {transferDetails.livemode ? 'Live' : 'Test'}
                        </span>
                      </div>
                    </div>

                    {transferDetails.reversals && transferDetails.reversals.data && (
                      <div className="pt-3 border-t border-dashed border-default-200 flex justify-between">
                        <div>
                          <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Total Reversals</p>
                          <p className={`text-sm font-medium ${transferDetails.reversals.total_count > 0 ? 'text-warning' : 'text-default-800'}`}>
                            {transferDetails.reversals.total_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-default-400 uppercase tracking-wider mb-1">Has More Reversals</p>
                          <p className="text-sm font-medium text-default-800">{transferDetails.reversals.has_more ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-danger bg-danger/5 rounded-lg border border-danger/20">
                  <p>Failed to load transfer details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferListTabel;