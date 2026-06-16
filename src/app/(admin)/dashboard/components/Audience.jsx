'use client';

import ApexChartClient from '@/components/client-wrapper/ApexChartClient';
import Link from 'next/link';
import { LuEllipsisVertical } from 'react-icons/lu';
import { getAudienceChart } from './data';
const Audience = () => {
  return <div className="card">
      <div className="card-header">
        <h6 className="card-title">Audience</h6>

        <div className="hs-dropdown relative inline-flex">
          <button type="button" className="hs-dropdown-toggle bt size-7.5 text-sm font-semibold rounded-lg hover:bg-default-150" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown" hs-dropdown-placement="bottom-end">
            <LuEllipsisVertical className="size-4 text-default-500" />
          </button>

          <div className="hs-dropdown-menu" role="menu">
            <Link className="flex items-center gap-x-3.5 py-1.5 font-medium px-3 text-default-600 hover:bg-default-150 rounded" href="#">
              1 Weekly
            </Link>
            <Link className="flex items-center gap-x-3.5 py-1.5 font-medium px-3 text-default-600 hover:bg-default-150 rounded" href="#">
              1 Monthly
            </Link>
            <Link className="flex items-center gap-x-3.5 py-1.5 font-medium px-3 text-default-600 hover:bg-default-150 rounded" href="#">
              3 Monthly
            </Link>
            <Link className="flex items-center gap-x-3.5 py-1.5 font-medium px-3 text-default-600 hover:bg-default-150 rounded" href="#">
              6 Monthly
            </Link>
            <Link className="flex items-center gap-x-3.5 py-1.5 font-medium px-3 text-default-600 hover:bg-default-150 rounded" href="#">
              This Yearly
            </Link>
          </div>
        </div>
      </div>

      <div className="card-body">
        <ApexChartClient getOptions={getAudienceChart} series={getAudienceChart().series} type="bar" height={340} className="apex-charts min-h-auto" />
      </div>
    </div>;
};
export default Audience;