"use client";
import { Bell, Search } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="חיפוש..."
          className="w-full pr-9 pl-4 py-2 text-sm border border-gray-200 rounded-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#B08D57] focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-[#0F2747] hover:bg-gray-100 rounded-sm transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#B08D57] rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 bg-[#0F2747] rounded-full flex items-center justify-center text-white text-sm font-semibold">
          מ
        </div>
      </div>
    </header>
  );
}
