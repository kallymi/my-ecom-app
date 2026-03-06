// components/dashboard/LiveHeader.jsx
export const LiveHeader = ({ onlineUsers }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
    <div>
      <h1 className="text-3xl md:text-5xl font-[1000] italic tracking-tighter uppercase leading-none">
        Dashboard<span className="text-indigo-600">.</span>
      </h1>
    </div>
    <div className="flex items-center gap-4 bg-white p-1.5 pr-5 rounded-full shadow-sm border border-gray-100">
       {/* Ton code du badge Activity */}
       <p className="font-black text-sm">{onlineUsers} actifs</p>
    </div>
  </div>
);