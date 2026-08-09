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

  // Exact data rows matching reference image screenshot
  const requests = [
    {
      id: '1',
      car: 'Volkswagen Golf',
      sub: 'Sportback 1.4 TFS...',
      img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=200&q=80',
      request: '#12434',
      clientName: 'Peter Bishop',
      clientEmail: 'abe45@gmail...',
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
      clientEmail: 'abe45@gmail...',
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
      clientEmail: 'abe45@gmail...',
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
      clientEmail: 'abe45@gmail...',
      price: '$430.00',
      status: 'Accepted',
      assigned: 'Kate Willton',
      duration: '1 year',
      date: '18:04:32 15/05/2025',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top 3 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Card 1: Leasing Requests / Wave Line Chart (Col 5) */}
        <div className="md:col-span-5 p-5 sm:p-6 rounded-[24px] bg-white dark:bg-card border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-foreground">
              Leasing Requests
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-foreground tracking-tight">
              $45,231.89
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">
              <span className="text-emerald-600 font-extrabold">+20.1%</span> from last month
            </div>
          </div>

          {/* SVG Wave Line Chart */}
          <div className="pt-2">
            <svg viewBox="0 0 300 80" className="w-full h-16 overflow-visible">
              <path
                d="M 0,55 C 30,65 50,45 70,55 C 90,65 110,35 130,40 C 150,45 170,25 190,45 C 210,50 230,35 250,45 C 270,55 285,45 300,50"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 px-1">
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
        <div className="md:col-span-4 p-5 sm:p-6 rounded-[24px] bg-white dark:bg-card border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-foreground">
              Website Requests
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-foreground tracking-tight">
              1,087
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-0.5">
              <span className="text-emerald-600 font-extrabold">+12.4%</span> from last month
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            {/* SVG Donut Chart */}
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2563eb" strokeWidth="5" strokeDasharray="35.8 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="19.2 100" strokeDashoffset="-35.8" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#eab308" strokeWidth="5" strokeDasharray="15.3 100" strokeDashoffset="-55" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="5" strokeDasharray="11.4 100" strokeDashoffset="-70.3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="5" strokeDasharray="9.7 100" strokeDashoffset="-81.7" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" strokeWidth="5" strokeDasharray="8.6 100" strokeDashoffset="-91.4" />
              </svg>
            </div>

            {/* Donut Legend List */}
            <div className="space-y-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Leasing
                </span>
                <span className="text-slate-400">35.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Look for me
                </span>
                <span className="text-slate-400">19.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Purchase
                </span>
                <span className="text-slate-400">15.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Sale
                </span>
                <span className="text-slate-400">11.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Maintance
                </span>
                <span className="text-slate-400">9.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" /> Bussiness
                </span>
                <span className="text-slate-400">8.6%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Status of Requests List (Col 3) */}
        <div className="md:col-span-3 p-5 sm:p-6 rounded-[24px] bg-white dark:bg-card border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-foreground">
              Status of requests
            </span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 block">Approved</span>
                <span className="text-xl font-black text-slate-900 dark:text-foreground">134</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-600">+15.11%</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 block">In progress</span>
                <span className="text-xl font-black text-slate-900 dark:text-foreground">56</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-600">+25.66%</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 block">Documents</span>
                <span className="text-xl font-black text-slate-900 dark:text-foreground">17</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-600">+11.23%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Large Bottom Requests Data Table Card */}
      <div className="p-5 sm:p-6 rounded-[24px] bg-white dark:bg-card border border-slate-200/80 shadow-xs space-y-5">
        {/* Title */}
        <h2 className="text-xl font-black text-slate-900 dark:text-foreground">Requests</h2>

        {/* Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Pill Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-accent border border-slate-200/60 text-xs font-bold text-slate-700 dark:text-foreground cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Jan 20, 2022 - Jun 09, 2022</span>
            </div>

            {/* Status Select Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-accent border border-slate-200/60 text-xs font-bold text-slate-700 dark:text-foreground cursor-pointer">
              <span>Status: All</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Assigned Select Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-accent border border-slate-200/60 text-xs font-bold text-slate-700 dark:text-foreground cursor-pointer">
              <span>Assigned to</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Right Search & Add CTA */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by #, client or car"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-accent border-none text-xs font-medium text-slate-800 dark:text-foreground outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={onNavigateProducts}
              className="px-4 py-2 bg-slate-900 dark:bg-foreground hover:bg-slate-800 text-white dark:text-background font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add new request</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              activeTab === 'delivered'
                ? 'bg-slate-200/80 dark:bg-accent text-slate-900 dark:text-foreground border border-slate-300/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Need to be delivered (59)
          </button>

          <button
            onClick={() => setActiveTab('buy')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeTab === 'buy'
                ? 'bg-slate-200/80 dark:bg-accent text-slate-900 dark:text-foreground border border-slate-300/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Request to buy (40)
          </button>

          <button
            onClick={() => setActiveTab('sale')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeTab === 'sale'
                ? 'bg-slate-200/80 dark:bg-accent text-slate-900 dark:text-foreground border border-slate-300/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sale (11)
          </button>

          <button
            onClick={() => setActiveTab('look')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeTab === 'look'
                ? 'bg-slate-200/80 dark:bg-accent text-slate-900 dark:text-foreground border border-slate-300/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Look for me (3)
          </button>

          <button
            onClick={() => setActiveTab('maintance')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              activeTab === 'maintance'
                ? 'bg-slate-200/80 dark:bg-accent text-slate-900 dark:text-foreground border border-slate-300/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Maintance (8)
          </button>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-2 w-8">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-3 px-3">Car</th>
                <th className="py-3 px-3">Request</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Price ⇡⇣</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned</th>
                <th className="py-3 px-3">Leasing</th>
                <th className="py-3 px-3">Date ⇡⇣</th>
                <th className="py-3 px-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-2">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>

                  {/* Car / Product */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.img}
                        alt={req.car}
                        className="w-12 h-8 object-cover rounded-md bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-900 dark:text-foreground text-xs block truncate">
                          {req.car}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">{req.sub}</span>
                      </div>
                    </div>
                  </td>

                  {/* Request Code */}
                  <td className="py-3 px-3 font-extrabold text-slate-700 dark:text-foreground">
                    {req.request}
                  </td>

                  {/* Client */}
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-slate-900 dark:text-foreground text-xs block">
                      {req.clientName}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">{req.clientEmail}</span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 font-black text-slate-900 dark:text-foreground">
                    {req.price}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {req.status}
                    </span>
                  </td>

                  {/* Assigned */}
                  <td className="py-3 px-3 font-bold text-slate-700 dark:text-foreground">
                    {req.assigned}
                  </td>

                  {/* Leasing */}
                  <td className="py-3 px-3 font-semibold text-slate-600 dark:text-slate-300">
                    {req.duration}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3 text-[10px] font-semibold text-slate-400">
                    {req.date}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-2 text-right">
                    <button className="text-slate-400 hover:text-slate-700 p-1">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
          <span>0 of 5 row(s) selected.</span>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 font-extrabold text-slate-700 dark:text-foreground">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs">
              1
            </span>

            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 font-extrabold text-slate-700 dark:text-foreground flex items-center justify-center">
              2
            </button>

            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 font-extrabold text-slate-700 dark:text-foreground flex items-center justify-center">
              3
            </button>

            <span>...</span>

            <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 font-extrabold text-slate-700 dark:text-foreground">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
