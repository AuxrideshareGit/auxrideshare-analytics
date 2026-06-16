'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamically import ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-default-100 rounded-lg w-full h-full" />
});

const EChartsClient = ({
  option,
  style,
  theme,
  notMerge = false,
  lazyUpdate = false,
  onChartReady,
  onEvents,
  opts,
  className
}) => {
  // We use useMemo for style if it's passed as an object to prevent unnecessary re-renders
  const memoizedStyle = useMemo(() => style, [style]);

  return (
    <ReactECharts
      option={option}
      style={memoizedStyle || { height: '100%', width: '100%' }}
      theme={theme}
      notMerge={notMerge}
      lazyUpdate={lazyUpdate}
      onChartReady={onChartReady}
      onEvents={onEvents}
      opts={opts}
      className={className}
    />
  );
};

export default EChartsClient;
