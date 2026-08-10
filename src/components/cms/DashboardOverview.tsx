'use client';

import React, { useState } from 'react';
import {
  Users,
  FileText,
  Search,
  Plus,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardStats, CMSOrder, CMSProduct } from '@/src/types';

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentOrders: CMSOrder[];
  lowStockProducts: CMSProduct[];
  onNavigateProducts: () => void;
  onNavigateOrders: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  recentOrders,
  lowStockProducts,
  onNavigateProducts,
  onNavigateOrders,
}) => {
  const [activeTab, setActiveTab] = useState('delivered');

  // Request sample dataset
  const requests = [
    {
      id: '1',
      car: 'Volkswagen Golf',
      sub: 'Sportback 1.4 TFS...',
      img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=200&q=80',
      request: '#12434',
      clientName: 'Peter Bishop',
      clientEmail: 'peter.b@statamic.org',
      price: '$430.00',
      status: 'Accepted',
      assigned: 'Kate Willton',
      duration: '3 years',
      date: '18:04:32 15/05/2025',
    },
    {
      id: '2',
      car: 'Ford Focus',
      sub: 'Sportback 1.4 TFS...',
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80',
      request: '#12435',
      clientName: 'Peter Bishop',
      clientEmail: 'peter.b@statamic.org',
      price: '$430.00',
      status: 'Accepted',
      assigned: 'Kate Willton',
      duration: '10 month',
      date: '18:04:32 15/05/2025',
    },
    {
      id: '3',
      car: 'Peugeot 308',
      sub: 'Sportback 1.4 TFS...',
      img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=200&q=80',
      request: '#12436',
      clientName: 'Peter Bishop',
      clientEmail: 'peter.b@statamic.org',
      price: '$430.00',
      status: 'Accepted',
      assigned: 'Kate Willton',
      duration: '6 month',
      date: '18:04:32 15/05/2025',
    },
    {
      id: '4',
      car: 'Citroën C3',
      sub: 'Sportback 1.4 TFS...',
      img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=200&q=80',
      request: '#12437',
      clientName: 'Peter Bishop',
      clientEmail: 'peter.b@statamic.org',
      price: '$430.00',
      status: 'Accepted',
      assigned: 'Kate Willton',
      duration: '1 year',
      date: '18:04:32 15/05/2025',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#cbd5e0]/60">
        <div>
          <span className="text-xs font-sans uppercase font-bold tracking-widest text-[#5e5a5a] block mb-1">
            Publishing Overview
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#191a1b]">
            CMS Dashboard <em className="font-serif italic font-light text-[#4c305a]">analytics & requests</em>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateProducts}
            className="px-4 py-2 rounded-lg bg-[#191a1b] text-[#d4ff4c] font-sans font-medium text-xs shadow-xs hover:bg-[#000000] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#d4ff4c]" />
            <span>Manage Catalog</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: Leasing Requests / Wave Line Chart (Col 5) */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[#191a1b] uppercase tracking-wider">
              Total Revenue & Leasing
            </span>
            <Users className="w-4 h-4 text-[#5e5a5a]" />
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-serif font-normal text-[#191a1b] tracking-tight">
              ${stats?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '45,231.89'}
            </div>
            <div className="text-xs font-sans text-[#5e5a5a] mt-1 flex items-center gap-1">
              <span className="text-[#10b981] font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +20.1%
              </span>
              <span>from last month</span>
            </div>
          </div>

          {/* SVG Wave Line Chart */}
          <div className="pt-2">
            <svg viewBox="0 0 300 80" className="w-full h-16 overflow-visible">
              <path
                d="M 0,55 C 30,65 50,45 70,55 C 90,65 110,35 130,40 C 150,45 170,25 190,45 C 210,50 230,35 250,45 C 270,55 285,45 300,50"
                fill="none"
                stroke="#191a1b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-sans font-medium text-[#5e5a5a] mt-2 px-1">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        {/* Card 2: Website Requests / Donut Breakdown (Col 4) */}
        <div className="md:col-span-4 p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[#191a1b] uppercase tracking-wider">
              Website Traffic & Requests
            </span>
            <Users className="w-4 h-4 text-[#5e5a5a]" />
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-serif font-normal text-[#191a1b] tracking-tight">
              1,087
            </div>
            <div className="text-xs font-sans text-[#5e5a5a] mt-1 flex items-center gap-1">
              <span className="text-[#10b981] font-semibold">+12.4%</span>
              <span>active website inquiries</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            {/* SVG Donut Chart */}
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#191a1b" strokeWidth="5" strokeDasharray="35.8 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#cbc2ea" strokeWidth="5" strokeDasharray="19.2 100" strokeDashoffset="-35.8" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f5ddee" strokeWidth="5" strokeDasharray="15.3 100" strokeDashoffset="-55" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#d7e5fe" strokeWidth="5" strokeDasharray="11.4 100" strokeDashoffset="-70.3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#beb9b3" strokeWidth="5" strokeDasharray="9.7 100" strokeDashoffset="-81.7" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" strokeWidth="5" strokeDasharray="8.6 100" strokeDashoffset="-91.4" />
              </svg>
            </div>

            {/* Donut Legend List */}
            <div className="space-y-1 text-[11px] font-sans font-normal text-[#5e5a5a] flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#191a1b]" /> Leasing
                </span>
                <span className="font-semibold text-[#191a1b]">35.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#cbc2ea]" /> Look for me
                </span>
                <span className="font-semibold text-[#191a1b]">19.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f5ddee]" /> Purchase
                </span>
                <span className="font-semibold text-[#191a1b]">15.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d7e5fe]" /> Sale
                </span>
                <span className="font-semibold text-[#191a1b]">11.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Status of Requests List (Col 3) */}
        <div className="md:col-span-3 p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-semibold text-[#191a1b] uppercase tracking-wider">
              Status Breakdown
            </span>
            <FileText className="w-4 h-4 text-[#5e5a5a]" />
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-sans font-medium text-[#5e5a5a] block">Approved</span>
                <span className="text-2xl font-serif font-normal text-[#191a1b]">134</span>
              </div>
              <span className="text-xs font-sans font-semibold text-[#10b981]">+15.1%</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-sans font-medium text-[#5e5a5a] block">In progress</span>
                <span className="text-2xl font-serif font-normal text-[#191a1b]">56</span>
              </div>
              <span className="text-xs font-sans font-semibold text-[#10b981]">+25.6%</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-sans font-medium text-[#5e5a5a] block">Documents</span>
                <span className="text-2xl font-serif font-normal text-[#191a1b]">17</span>
              </div>
              <span className="text-xs font-sans font-semibold text-[#10b981]">+11.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Large Bottom Requests Data Table Card */}
      <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#cbd5e0] shadow-statamic space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-normal text-[#191a1b]">
            Recent Inquiries & Requests
          </h2>
          <span className="text-xs font-sans font-medium text-[#5e5a5a]">
            Updated live from storefront
          </span>
        </div>

        {/* Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Pill Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans font-medium text-[#191a1b] cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-[#5e5a5a]" />
              <span>Jan 20, 2025 - Jun 09, 2025</span>
            </div>

            {/* Status Select Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans font-medium text-[#191a1b] cursor-pointer">
              <span>Status: All</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5e5a5a]" />
            </div>

            {/* Assigned Select Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans font-medium text-[#191a1b] cursor-pointer">
              <span>Assigned to</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5e5a5a]" />
            </div>
          </div>

          {/* Right Search & Add CTA */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#5e5a5a] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#fdf1ef] border border-[#cbd5e0] text-xs font-sans text-[#191a1b] outline-none placeholder:text-[#beb9b3] focus:border-[#cbc2ea]"
              />
            </div>

            <button
              onClick={onNavigateProducts}
              className="px-4 py-2 bg-[#191a1b] hover:bg-[#000000] text-[#d4ff4c] font-sans font-medium text-xs rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#d4ff4c]" />
              <span>Add request</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-[#cbd5e0]/60">
          {[
            { id: 'delivered', label: 'Need to be delivered (59)' },
            { id: 'buy', label: 'Request to buy (40)' },
            { id: 'sale', label: 'Sale (11)' },
            { id: 'look', label: 'Look for me (3)' },
            { id: 'maintance', label: 'Maintenance (8)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg font-sans font-medium transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#191a1b] text-[#ffffff]'
                  : 'text-[#5e5a5a] hover:text-[#191a1b] hover:bg-[#fdf1ef]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="border-b border-[#cbd5e0] text-[#5e5a5a] font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-2 w-8">
                  <input type="checkbox" className="rounded border-[#cbd5e0] accent-[#191a1b]" />
                </th>
                <th className="py-3 px-3">Item / Service</th>
                <th className="py-3 px-3">Request ID</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cbd5e0]/60">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-[#fdf1ef]/60 transition-colors">
                  <td className="py-3 px-2">
                    <input type="checkbox" className="rounded border-[#cbd5e0] accent-[#191a1b]" />
                  </td>

                  {/* Car / Product */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.img}
                        alt={req.car}
                        className="w-12 h-8 object-cover rounded-lg border border-[#cbd5e0] shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-sans font-medium text-[#191a1b] text-xs block truncate">
                          {req.car}
                        </span>
                        <span className="text-[10px] font-sans text-[#5e5a5a] block truncate">{req.sub}</span>
                      </div>
                    </div>
                  </td>

                  {/* Request Code */}
                  <td className="py-3 px-3 font-mono font-bold text-[#191a1b]">
                    {req.request}
                  </td>

                  {/* Client */}
                  <td className="py-3 px-3">
                    <span className="font-sans font-medium text-[#191a1b] text-xs block">
                      {req.clientName}
                    </span>
                    <span className="text-[10px] font-sans text-[#5e5a5a] block truncate">{req.clientEmail}</span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 font-mono font-bold text-[#191a1b]">
                    {req.price}
                  </td>

                  {/* Status Badge (Pill Shape) */}
                  <td className="py-3 px-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-sans font-medium bg-[#f5ddee] text-[#191a1b] border border-[#cbc2ea]">
                      {req.status}
                    </span>
                  </td>

                  {/* Assigned */}
                  <td className="py-3 px-3 font-sans font-normal text-[#191a1b]">
                    {req.assigned}
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-3 font-sans font-normal text-[#5e5a5a]">
                    {req.duration}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3 text-[10px] font-mono text-[#5e5a5a]">
                    {req.date}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-2 text-right">
                    <button className="text-[#5e5a5a] hover:text-[#191a1b] p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-sans text-[#5e5a5a]">
          <span>0 of 4 row(s) selected.</span>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#fdf1ef] font-medium text-[#191a1b]">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <span className="w-7 h-7 rounded-lg bg-[#191a1b] text-[#d4ff4c] font-sans font-bold flex items-center justify-center text-xs">
              1
            </span>

            <button className="w-7 h-7 rounded-lg hover:bg-[#fdf1ef] font-medium text-[#191a1b] flex items-center justify-center">
              2
            </button>

            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#fdf1ef] font-medium text-[#191a1b]">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
