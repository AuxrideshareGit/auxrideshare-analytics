import ArabianFlag from '@/assets/images/flags/arebian.svg';
import FrenchFlag from '@/assets/images/flags/french.jpg';
import GermanyFlag from '@/assets/images/flags/germany.jpg';
import ItalyFlag from '@/assets/images/flags/italy.jpg';
import JapaneseFlag from '@/assets/images/flags/japanese.svg';
import RussiaFlag from '@/assets/images/flags/russia.jpg';
import SpainFlag from '@/assets/images/flags/spain.jpg';
import UsFlag from '@/assets/images/flags/us.jpg';
import avatar1 from '@/assets/images/user/avatar-1.png';
import avatar3 from '@/assets/images/user/avatar-3.png';
import avatar5 from '@/assets/images/user/avatar-5.png';
import avatar7 from '@/assets/images/user/avatar-7.png';
import Image from 'next/image';
import Link from 'next/link';
import { TbSearch } from 'react-icons/tb';
import React, { useState, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import SidenavToggle from './SidenavToggle';
import ThemeModeToggle from './ThemeModeToggle';
import { apiFetch } from '@/utils/api';
import { LuBellRing, LuClipboardList, LuClock, LuFileText, LuLoader, LuGem, LuHeart, LuLogOut, LuMail, LuMessagesSquare, LuMonitorDot, LuMoveRight, LuSettings, LuShieldCheck, LuShoppingBag } from 'react-icons/lu';
import { useAuthContext } from '@/context/useAuthContext';

const tabs = [{
  id: 'tabsViewall',
  title: 'View all',
  active: true
}, {
  id: 'tabsMentions',
  title: 'Mentions'
}, {
  id: 'tabsFollowers',
  title: 'Followers'
}, {
  id: 'tabsInvites',
  title: 'Invites'
}];

const profileMenu = [{
  icon: <LuFileText className="size-4" />,
  label: 'Error Logs',
  href: '/error-logs'
}, {
  icon: <LuClipboardList className="size-4" />,
  label: 'Activity Logs',
  href: '/activity-logs'
}, {
  icon: <LuShieldCheck className="size-4" />,
  label: 'Audit Log Entries',
  href: '/audit-logs'
}, {
  divider: true
}, {
  icon: <LuLogOut className="size-4" />,
  label: 'Sign Out',
  href: '/basic-logout'
}];
const Topbar = () => {
  const { user, token, logout } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setIsSearching(true);
        try {
          const result = await apiFetch(`/api/v1/admin/search/?q=${encodeURIComponent(searchQuery)}`, { token });
          const items = result.data || result.results || (Array.isArray(result) ? result : []);
          setSearchResults(items);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search API Failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token]);

  return <div className="app-header min-h-topbar-height flex items-center sticky top-0 z-30 bg-(--topbar-background) border-b border-default-200">
    <div className="w-full flex items-center justify-between px-6">
      <div className="flex items-center gap-5 flex-1 me-8">
        <SidenavToggle />

        <div className="lg:flex hidden items-center relative z-50 w-full max-w-[400px]">
          <input
            type="search"
            id="topbar-search"
            className="form-input ps-4 pe-12 py-2 text-sm rounded border-default-200 focus:border-default-300 w-full relative z-50 bg-white shadow-sm"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoComplete="off"
          />
          <button type="button" className="absolute inset-y-0 end-0 flex items-center pe-4 z-50">
            {isSearching ? <LuLoader className="animate-spin text-primary size-4" /> : <TbSearch className="text-default-500 size-[18px]" />}
          </button>

          {/* Suggestions Dropdown Window */}
          {showSuggestions && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-default-200 shadow-xl rounded py-1 z-50 overflow-hidden text-sm">
              {isSearching && searchResults.length === 0 ? (
                <div className="px-4 py-3 text-default-500 italic transition-opacity">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <Link
                      href={`#${res.id || ''}`}
                      key={i}
                      className="px-4 py-2 hover:bg-default-100 cursor-pointer flex justify-between items-center transition-colors group"
                    >
                      <div className="flex flex-col truncate w-full gap-1">
                        <span className="font-bold text-default-900 text-[15px]">
                          {res.display_text || res.name || res.title || res.text || res.email || res.phone_number || res.id || 'Result'}
                        </span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                          {Object.entries(res).map(([key, value]) => {
                            if (['name', 'title', 'text', 'type', 'url', 'display_text', 'id'].includes(key)) return null;
                            if (typeof value === 'object' || Array.isArray(value) || value === null || value === undefined || value === '') return null;
                            return (
                              <span key={key} className="text-[11px] text-default-500 flex gap-1 items-center">
                                <span className="uppercase tracking-widest text-[9px] font-bold text-default-400">{key.replace(/_/g, ' ')}:</span>
                                <span className="truncate max-w-[150px]">{String(value)}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      {res.type && (
                        <span className="text-[10px] bg-default-150 group-hover:bg-primary/10 group-hover:text-primary transition-colors px-2 py-0.5 rounded font-bold uppercase tracking-widest text-default-500 ml-3 shrink-0">
                          {res.type}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-default-500 italic text-sm">No exact matches found for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="topbar-item hs-dropdown [--placement:bottom-right] relative inline-flex">
          <button className="hs-dropdown-toggle btn btn-icon size-8 hover:bg-default-150 rounded-full relative" type="button">
            <Image src={UsFlag} alt="us-flag" className="size-4.5 rounded" />
          </button>

        </div>

        <ThemeModeToggle />

        <div className="topbar-item hs-dropdown [--auto-close:inside] relative inline-flex">
          <button type="button" className="hs-dropdown-toggle btn btn-icon size-8 hover:bg-default-150 rounded-full relative">
            <LuBellRing className="size-4.5" />
            <span className="absolute end-0 top-0 size-1.5 bg-primary/90 rounded-full"></span>
          </button>

        </div>

        <div className="topbar-item">
          <button className="btn btn-icon size-8 hover:bg-default-150 rounded-full" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="theme-customization" data-hs-overlay="#theme-customization">
            <LuSettings className="size-4.5" />
          </button>
        </div>

        <div className="topbar-item hs-dropdown relative inline-flex">
          <button className="cursor-pointer bg-pink-100 rounded-full">
            <Image src={avatar1} alt="user" className="hs-dropdown-toggle rounded-full size-9.5" />
          </button>
          <div className="hs-dropdown-menu min-w-48">
            <div className="p-2">
              <h6 className="mb-2 text-default-500">Welcome to Auxrideshare</h6>
              <Link href="#!" className="flex gap-3">
                <div className="relative inline-block">
                  <Image src={avatar1} alt="user" className="size-12 rounded" />
                  <span className="-top-1 -end-1 absolute w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h6 className="mb-1 text-sm font-semibold text-default-800" suppressHydrationWarning>{user?.name || user?.first_name || 'Admin User'}</h6>
                  <p className="text-default-500 capitalize" suppressHydrationWarning>{user?.role_display || user?.role || 'Administrator'}</p>
                </div>
              </Link>
            </div>

            <div className="border-t border-default-200 -mx-2 my-2"></div>

            <div className="flex flex-col gap-y-1">
              {profileMenu.map((item, i) => item.divider ? <div key={i} className="border-t border-default-200 -mx-2 my-1"></div> :
                <Link key={i} href={item.href || '#!'} onClick={async (e) => {
                  if (item.label === 'Sign Out') {
                    e.preventDefault();
                    try {
                      const storedRefresh = localStorage.getItem('__AUX_AUTH_REFRESH__') || user?.refresh || "fallback_token_string";
                      await apiFetch('/api/v1/admin/auth/logout/', {
                        method: 'POST',
                        token,
                        body: JSON.stringify({ refresh: storedRefresh })
                      });
                    } catch (err) {
                      console.error("Backend blacklist failed, enforcing local logout:", err);
                    } finally {
                      logout();
                    }
                  }
                }} className="flex items-center gap-x-3.5 py-1.5 px-3 text-default-600 hover:bg-default-150 rounded font-medium">
                  {item.icon}
                  {item.label}
                  {item.badge && <span className="size-4.5 font-semibold bg-danger rounded text-white flex items-center justify-center text-xs">
                    {item.badge}
                  </span>}
                </Link>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
};
export default Topbar;