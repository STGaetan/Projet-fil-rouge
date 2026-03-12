import React from 'react';

export function StatCard({ 
  title, 
  value, 
  icon, 
  accentColor,
  trend
}: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode, 
  accentColor: 'orange' | 'red' | 'blue',
  trend?: string
}) {
  const accentBorder = 
    accentColor === 'orange' ? 'border-[#FF6600]' : 
    accentColor === 'red' ? 'border-[#EF4444]' : 
    'border-[#1A1F3D]';
    
  const accentBg = 
    accentColor === 'orange' ? 'bg-[#FF6600]/10 text-[#FF6600]' : 
    accentColor === 'red' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 
    'bg-[#1A1F3D]/10 text-[#1A1F3D]';

  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between border-l-4 ${accentBorder} relative overflow-hidden group hover:shadow-md transition-all cursor-pointer`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-600 font-medium text-sm">{title}</span>
        <div className={`p-2.5 rounded-lg ${accentBg}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-4xl font-bold text-[#1A1F3D] leading-none">
          {value}
        </div>
        {trend && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
