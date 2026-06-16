"use client";
import React, { useState, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuSearch, LuLoader, LuCircleX, LuArrowDown, LuArrowUp, LuFileText } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/utils/api';

const AuditLogsTable = () => {
  const { token } = useAuthContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [contentType, setContentType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (search) queryParams.append('search', search);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (order) queryParams.append('order', order);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);
        if (contentType) queryParams.append('content_type_id', contentType);

        const result = await apiFetch(`/api/v1/admin/system/audit-logs/?${queryParams}`, { token });
        setData(result.data || result.results || []);
        setTotalPages(result.total_pages || Math.ceil((result.total_count || result.count || 0) / limit) || 1);
        setTotalCount(result.total_count || result.count || 0);
      } catch (error) {
        console.error("Error fetching Audit Logs:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, sortBy, order, token, startDate, endDate, contentType]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

  const currentSortIcon = (column) => {
    if (sortBy !== column) return null;
    return order === 'asc' ? <LuArrowUp className="size-3 inline ms-1" /> : <LuArrowDown className="size-3 inline ms-1" />;
  };

  const handleSort = (column) => {
    if (sortBy === column) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setOrder('asc'); }
  };

  const renderActionBadge = (action) => {
    switch(action) {
       case 1: return <span className="bg-success/10 text-success text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Create</span>;
       case 2: return <span className="bg-warning/10 text-warning text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Update</span>;
       case 3: return <span className="bg-danger/10 text-danger text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Delete</span>;
       default: return <span className="bg-default-100 text-default-600 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">Unknown</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-default-200">
        <div className="relative w-80">
          <input type="text" className="form-input form-input-sm ps-9 w-full" placeholder="Search logs format, entries or objects..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <div className="absolute inset-y-0 start-0 flex items-center ps-3">
            <LuSearch className="size-3.5 flex items-center text-default-500 fill-default-100" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="date" 
            className="form-input form-input-sm w-36" 
            value={startDate} 
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }} 
            placeholder="Start Date"
          />
          <span className="text-default-400 text-sm">to</span>
          <input 
            type="date" 
            className="form-input form-input-sm w-36" 
            value={endDate} 
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }} 
            placeholder="End Date"
          />
        </div>

        <div className="w-64 shrink-0">
          <select 
            className="form-input form-input-sm w-full"
            value={contentType}
            onChange={(e) => { setContentType(e.target.value); setPage(1); }}
          >
            <option value="">All Content Types</option>
          <option value="1">Log Entry</option>
          <option value="2">Permission</option>
          <option value="3">Group</option>
          <option value="4">Content Type</option>
          <option value="5">Session</option>
          <option value="6">Site</option>
          <option value="7">User</option>
          <option value="8">Auth Token</option>
          <option value="9">Auth Token (Knox)</option>
          <option value="10">Email Address</option>
          <option value="11">Email Confirmation</option>
          <option value="12">Social Account</option>
          <option value="13">Social Application</option>
          <option value="14">Social Application Token</option>
          <option value="34">Cron Schedule</option>
          <option value="35">Interval Schedule</option>
          <option value="36">Periodic Task</option>
          <option value="37">Periodic Tasks</option>
          <option value="38">Solar Event</option>
          <option value="39">Clocked Schedule</option>
          <option value="40">Task Result</option>
          <option value="41">Chord Counter</option>
          <option value="42">Group Result</option>
          <option value="43">OTP</option>
          <option value="44">Notification</option>
          <option value="45">Driver</option>
          <option value="46">User FCM Token</option>
          <option value="47">Driver Assignment</option>
          <option value="48">Rider Request</option>
          <option value="49">Ride</option>
          <option value="50">Boarding</option>
          <option value="51">Fare Config</option>
          <option value="52">Review</option>
          <option value="53">Vehicle Type</option>
          <option value="54">Ride Stop Log</option>
          <option value="55">Ride Update Log</option>
          <option value="56">Stripe User Profile</option>
          <option value="57">Stripe Webhook Event</option>
          <option value="58">Cancel Reason</option>
          <option value="59">Preorder Driver Assignment Task</option>
          <option value="60">PayPal Webhook Event</option>
          <option value="61">Contact Us</option>
          <option value="62">Stripe Transfer Failure</option>
          <option value="63">Driver Tip</option>
          <option value="67">Ride Messages</option>
          <option value="68">User Notification</option>
          <option value="69">Activity Log</option>
          <option value="70">Admin Phone Number</option>
          <option value="71">Driver Booking Request</option>
          <option value="72">Error Log</option>
          <option value="73">Lead</option>
          <option value="74">Ride Location Point</option>
          <option value="75">Ride Path</option>
          <option value="76">Driver Registration Lead</option>
          <option value="77">Device Information</option>
          <option value="78">Notification Settings</option>
          <option value="79">Coupon Code</option>
          <option value="80">Coupon Usage</option>
          <option value="81">File Upload</option>
          <option value="82">Affiliate Profile</option>
          <option value="83">Affiliate Marketing</option>
          <option value="84">Affiliate Wallet</option>
          <option value="85">Withdrawal Request</option>
          <option value="86">Wallet Transaction</option>
          <option value="87">Affiliate Stripe Profile</option>
          <option value="88">Admin Phone Number (Ride)</option>
          <option value="89">Ride Cycle Tracker</option>
          <option value="90">Bulk Notification</option>
          <option value="91">Bulk Notification Recipient</option>
          <option value="92">Location Snapshot</option>
          <option value="93">City</option>
          <option value="94">Celery Queue Dashboard</option>
          <option value="95">App Settings</option>
          <option value="96">Rides Radar</option>
          <option value="97">PSP Settings</option>
          <option value="98">Driver PSP Mapping</option>
          <option value="99">Transaction Report</option>
          <option value="100">Driver Balance</option>
          <option value="101">Driver Negative Balance History</option>
          <option value="102">Ride Negative Balance Tracker</option>
          <option value="103">Audit Log Entry</option>
          <option value="104">PSP Payout</option>
          <option value="105">WordPress Session</option>
          <option value="106">Driver Leaderboard Stats</option>
          <option value="107">Rider Balance</option>
          <option value="108">Rider Negative Balance History</option>
          <option value="109">Ride Location Meta</option>
          <option value="110">Ride Tracking Snapshot</option>
          <option value="111">Commission Record</option>
          <option value="112">Payout Transaction</option>
          <option value="113">Affiliate User</option>
          <option value="114">Driver Commission Transfer Delay</option>
          <option value="115">Driver Withdrawal</option>
          <option value="116">Driver Wallet Transaction</option>
          <option value="117">Driver Wallet</option>
          <option value="118">Driver Negative Balance Charge</option>
          <option value="119">Charge Deduction Log</option>
          <option value="120">Boarding Commission Breakdown</option>
          <option value="121">Instant Withdrawal Status</option>
          <option value="122">PSP User</option>
          <option value="123">Rider Location Update Request</option>
        </select>
        </div>

        {(search || startDate || endDate || contentType) && (
          <button onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setContentType(''); setPage(1); }} className="btn btn-sm bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center gap-1.5">
            <LuCircleX className="size-4" /> Clear
          </button>
        )}
      </div>

      <div className="overflow-auto max-h-[70vh] min-h-[500px]">
        <table className="min-w-full divide-y divide-default-200">
          <thead className="bg-default-150 sticky top-0 z-20 shadow-sm backdrop-blur-md">
            <tr className="text-sm font-normal text-default-700 whitespace-nowrap">
              <th className="ps-6 py-3 text-start cursor-pointer select-none w-24" onClick={() => handleSort('id')}>ID {currentSortIcon('id')}</th>
              <th className="px-3.5 py-3 text-start w-1/2">Object Representation</th>
              <th className="px-3.5 py-3 text-center cursor-pointer select-none" onClick={() => handleSort('action')}>Action {currentSortIcon('action')}</th>
              <th className="px-3.5 py-3 text-start">Actor</th>
              <th className="px-3.5 py-3 text-start cursor-pointer select-none" onClick={() => handleSort('timestamp')}>Timestamp {currentSortIcon('timestamp')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {loading ? (
              <tr><td colSpan="5" className="py-10 text-center"><LuLoader className="animate-spin size-6 text-primary mx-auto" /><p className="mt-2 text-default-500">Loading audit log entries...</p></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="5" className="py-10 text-center text-default-500">No logs found.</td></tr>
            ) : (
              data.map((row) => (
                <React.Fragment key={row.id}>
                <tr onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)} className={`text-default-800 font-normal text-sm hover:bg-default-50 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-default-50' : ''}`}>
                  <td className="ps-6 py-3 font-semibold text-primary">#{row.id}</td>
                  <td className="px-3.5 py-3">
                    <span className="font-semibold text-default-700 truncate block max-w-xl" title={row.object_repr || '-'}>
                      {row.object_repr || '-'}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    {renderActionBadge(row.action)}
                  </td>
                  <td className="px-3.5 py-3 text-xs text-default-600 whitespace-nowrap">
                    {row.actor || <span className="text-default-400 italic">System</span>}
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap text-default-700 font-mono text-xs">
                    {formatDate(row.timestamp)}
                  </td>
                </tr>
                {expandedRow === row.id && (
                  <tr className="bg-primary/5 border-b border-default-200">
                    <td colSpan="5" className="p-0">
                      <div className="bg-default-50 p-4 w-full">
                        <div className="max-w-4xl text-sm border border-default-200 bg-white shadow-sm rounded-lg overflow-hidden">
                           <div className="bg-default-100 border-b border-default-200 px-4 py-2 flex items-center gap-2">
                             <LuFileText className="size-4 text-default-600" />
                             <span className="font-semibold text-default-700">Detailed Context & Field Changes</span>
                           </div>
                           
                           {/* Info Header */}
                           <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border-b border-default-200">
                              <div>
                                 <span className="block text-[10px] uppercase tracking-widest text-default-400 font-bold mb-0.5">Object ID</span>
                                 <span className="font-mono text-xs text-default-700">{row.object_id || row.object_pk || '-'}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] uppercase tracking-widest text-default-400 font-bold mb-0.5">Content Type</span>
                                 <span className="font-semibold text-default-700 text-sm">{row.content_type || '-'}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] uppercase tracking-widest text-default-400 font-bold mb-0.5">Remote IP Address</span>
                                 <span className="font-mono text-xs text-default-700">{row.remote_addr || '-'}</span>
                              </div>
                              <div>
                                 <span className="block text-[10px] uppercase tracking-widest text-default-400 font-bold mb-0.5">CID Reference</span>
                                 <span className="font-mono text-xs text-default-700">{row.cid || '-'}</span>
                              </div>
                           </div>
                           
                           {/* Differences Table */}
                           <div className="p-0 bg-default-50">
                               {row.changes && Object.keys(row.changes).length > 0 ? (
                                   <table className="w-full text-left text-sm">
                                      <thead className="bg-default-100 text-default-500 text-xs uppercase border-b border-default-200">
                                         <tr>
                                             <th className="px-4 py-2 border-r border-default-200 w-1/4">Field Mutated</th>
                                             <th className="px-4 py-2 border-r border-default-200 w-2/5">Old Value (Before)</th>
                                             <th className="px-4 py-2 w-2/5 text-primary">New Value (After)</th>
                                         </tr>
                                      </thead>
                                      <tbody>
                                         {Object.entries(row.changes).map(([key, vals], index) => {
                                             const oldVal = Array.isArray(vals) ? vals[0] : '-';
                                             const newVal = Array.isArray(vals) ? vals[1] : vals;
                                             return (
                                                  <tr key={index} className="border-b border-default-100 hover:bg-white transition-colors bg-default-50">
                                                      <td className="px-4 py-2.5 font-mono text-xs text-default-600 border-r border-default-200 align-top">{key}</td>
                                                      <td className="px-4 py-2.5 font-mono text-xs text-danger/80 border-r border-default-200 align-top break-all bg-danger/5">{String(oldVal)}</td>
                                                      <td className="px-4 py-2.5 font-mono text-xs text-success align-top break-all bg-success/5 font-semibold">{String(newVal)}</td>
                                                  </tr>
                                             );
                                         })}
                                      </tbody>
                                   </table>
                               ) : (
                                   <div className="p-4 text-center text-default-500 italic text-sm">No explicit field changes detected in this payload.</div>
                               )}
                           </div>

                             {/* Raw Data Append */}
                             {row.additional_data && (
                                <div className="p-4 border-t border-default-200 bg-white">
                                    <span className="block text-[10px] uppercase tracking-widest text-default-400 font-bold mb-1">Additional Dump</span>
                                    <pre className="text-xs bg-default-100 text-default-700 p-3 rounded font-mono overflow-auto max-h-40 break-all whitespace-pre-wrap">
                                      {typeof row.additional_data === 'object' ? JSON.stringify(row.additional_data, null, 2) : String(row.additional_data)}
                                    </pre>
                                </div>
                             )}

                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && totalCount > 0 && (
          <div className="p-4 border-t border-default-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-default-50 mt-auto">
          <p className="text-default-500 text-sm">Showing <b>{data.length}</b> of <b>{totalCount}</b></p>
          <nav className="flex items-center gap-1.5" aria-label="Pagination">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-sm border bg-white border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"><LuChevronLeft className="size-4 me-1" /> Prev</button>
            {getPageNumbers().map(p => (
              <button key={p} type="button" onClick={() => setPage(p)} className={`btn size-7.5 ${page === p ? 'bg-primary text-white border-primary' : 'bg-white border border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10'}`}>{p}</button>
            ))}
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn btn-sm border bg-white border-default-200 text-default-600 hover:bg-primary/10 hover:text-primary hover:border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed">Next <LuChevronRight className="size-4 ms-1" /></button>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-sm text-default-500">Per Page:</span>
            <select className="form-input form-input-sm w-16 px-2 py-1" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuditLogsTable;
