import React from 'react';

export const MetricCard = ({ title, children, accent = 'bg-white' }: { title: string, children: React.ReactNode, accent?: string }) => {
  return (
    <div className={`p-4 border-4 border-brutal rounded-brutal shadow-brutal transition-transform hover:-translate-y-1 hover:shadow-brutal-lg ${accent}`}>
      <h2 className="text-brutal font-bold text-lg mb-3 uppercase tracking-tight">{title}</h2>
      <div className="flex flex-col gap-2 font-mono">
        {children}
      </div>
    </div>
  );
};

export const KpiRow = ({ label, value }: { label: string, value: string | number }) => (
  <div className="flex justify-between items-center border-b-2 border-brutal/20 pb-1">
    <span className="text-sm font-sans font-semibold text-gray-700">{label}</span>
    <span className="text-base font-bold text-brutal">{value}</span>
  </div>
);

export const Badge = ({ children, active }: { children: React.ReactNode, active: boolean }) => (
  <span className={`px-2 py-1 text-xs font-bold border-2 border-brutal rounded-full shadow-[2px_2px_0px_#111827] ${active ? 'bg-mint' : 'bg-pink'}`}>
    {children}
  </span>
);
