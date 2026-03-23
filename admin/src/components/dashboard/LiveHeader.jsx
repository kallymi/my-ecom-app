import { memo } from "react";
import { Activity } from "lucide-react";

const ActivityBadge = memo(function ActivityBadge({ users }) {

  const count = users ?? 0;

  return (
    <div className="flex items-center gap-3 bg-white p-1.5 pr-5 rounded-full shadow-sm border border-gray-100">

      {/* Icon */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50">
        <Activity size={16} className="text-indigo-600 animate-pulse" />
      </div>

      {/* Users */}
      <p className="font-black text-sm text-gray-900">
        {count} actifs
      </p>

    </div>
  );
});


export const LiveHeader = memo(function LiveHeader({ onlineUsers }) {

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">

      {/* Title */}
      <div>

        <h1 className="text-3xl md:text-5xl font-[1000] italic tracking-tighter uppercase leading-none">
          Dashboard
          <span className="text-indigo-600">.</span>
        </h1>

        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-2">
          Vue en temps réel
        </p>

      </div>

      {/* Activity */}
      <ActivityBadge users={onlineUsers} />

    </div>
  );
});