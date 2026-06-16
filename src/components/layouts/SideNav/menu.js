import {
  LuCalendar1,
  LuCircuitBoard,
  LuClipboardList,
  LuCodesandbox,
  LuFileText,
  LuFingerprint,
  LuLayoutPanelLeft,
  LuLock,
  LuMail,
  LuMessagesSquare,
  LuMonitorDot,
  LuChartBar,
  LuPackage,
  LuPictureInPicture2,
  LuShare2,
  LuShieldCheck,
  LuShoppingBag,
  LuSquareUserRound,
} from 'react-icons/lu';
export const menuItemsData = [
  {
    key: 'Overview',
    label: 'Overview',
    isTitle: true,
  },
  {
    key: 'Dashboard',
    label: 'Dashboard',
    icon: LuMonitorDot,
    href: '/dashboard',
  },
  {
    key: 'rideanalytics',
    label: 'Ride Analytics',
    icon: LuChartBar,
    href: '/ride-analytics',
  },
  {
    key: 'Management',
    label: 'Management',
    isTitle: true,
  },
  {
    key: 'Users',
    label: 'Users',
    icon: LuSquareUserRound,
    children: [
      {
        key: 'riders',
        label: 'Riders',
        href: '/riders-list',
      },
      {
        key: 'drivers',
        label: 'Drivers',
        href: '/drivers-list',
      },
      {
        key: 'affiliate',
        label: 'Affiliate Users',
        href: '/affiliates-list',
      },
      {
        key: 'psp-list',
        label: 'PSP Users',
        href: '/psp-list',
      },
    ],
  },
  {
    key: 'Utilities',
    label: 'Utilities',
    icon: LuCodesandbox,
    children: [
      {
        key: 'Otps',
        label: 'Otps',
        href: '/otps',
      },
      {
        key: 'Auth Tokens',
        label: 'Auth Tokens',
        href: '/auth-tokens',
      },
      {
        key: 'Notifications',
        label: 'Notifications',
        href: '/notifications',
      },
      {
        key: 'User FCM Tokens',
        label: 'User FCM Tokens',
        href: '/user-fcm-tokens',
      },
      {
        key: 'Device Information',
        label: 'Device Information',
        href: '/device-info',
      },
    ],
  },
  {
    key: 'Payments & Settlements',
    label: 'Payments & Settlements',
    icon: LuFileText,
    children: [
      {
        key: 'Driver Balances',
        label: 'Driver Balances',
        href: '/driver-balances',
      },
      {
        key: 'Rider Balances',
        label: 'Rider Balances',
        href: '/rider-balances',
      }
    ],
  },
  {
    key: 'Ride Management',
    label: 'Ride Management',
    icon: LuShoppingBag,
    children: [
      {
        key: 'Rider Requests',
        label: 'Rider Requests',
        href: '/rider-requests',
      },

      {
        key: 'Boardings',
        label: 'Boardings',
        href: '/boardings',
      },
      {
        key: 'Driver Assignments',
        label: 'Driver Assignments',
        href: '/driver-assignments',
      },
      {
        key: 'Driver Wallets',
        label: 'Driver Wallets',
        href: '/driver-wallets',
      },
      {
        key: 'Driver Commission Transfers',
        label: 'Driver Commission Transfers',
        href: '/transfer-delays',
      },
      {
        key: 'Driver Wallet Transactions',
        label: 'Driver Wallet Transactions',
        href: '#',
      },
      {
        key: 'Driver Withdrawals',
        label: 'Driver Withdrawals',
        href: '#',
      },
    ],
  },
  {
    key: 'Logs',
    label: 'Logs',
    icon: LuClipboardList,
    children: [
      {
        key: 'Error Logs',
        label: 'Error Logs',
        href: '/error-logs',
      },
      {
        key: 'Activity Logs',
        label: 'Activity Logs',
        href: '/activity-logs',
      },
      {
        key: 'Audit Log Entries',
        label: 'Audit Log Entries',
        href: '/audit-logs',
      }
    ],
  },
  {
    key: 'Settings',
    label: 'Settings',
    icon: LuLock,
    children: [
      {
        key: 'Vehicles',
        label: 'Vehicles',
        href: '/vehicles',
      },
      {
        key: 'Cities',
        label: 'Cities',
        href: '/cities',
      },
      {
        key: 'App Settings',
        label: 'App Settings',
        href: '/app-settings',
      },
      {
        key: 'Driver Mappings',
        label: 'Driver Mappings',
        href: '/driver-psp-mappings',
      },
      {
        key: 'Cancel Reasons',
        label: 'Cancel Reasons',
        href: '/cancel-reasons',
      },
      {
        key: 'Coupon Codes',
        label: 'Coupon Codes',
        href: '/coupon-codes',
      },
    ],
  },
  {
    key: 'Reports',
    label: 'Reports',
    icon: LuMonitorDot,
    children: [

      {
        key: 'Ride Stats',
        label: 'Ride Stats',
        href: '/ride-stats',
      },
      {
        key: 'Ride Peak Times',
        label: 'Ride Peak Times',
        href: '/ride-peak-times',
      },
      {
        key: 'Driver Report',
        label: 'Driver Report',
        href: '/driver-report',
      }
    ],
  },
];
