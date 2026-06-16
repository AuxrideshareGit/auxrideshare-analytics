'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false
});
const ApexChartClient = ({
  type,
  height,
  width = '100%',
  getOptions,
  series,
  className
}) => {
  const options = useMemo(() => {
    if (typeof getOptions === 'function') {
      return getOptions();
    }
    return getOptions;
  }, [getOptions, series]); // Adding series as well as it sometimes impacts how options should look (like data labels)

  return <ReactApexChart type={type} height={height} width={width} options={options} series={series} className={className} />;
};
export default ApexChartClient;