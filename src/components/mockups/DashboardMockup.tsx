// Dashboard mockup — realistic dashboard UI preview. Presentational (Server Component).
export function DashboardMockup() {
  const checkIns = [
    { name: "Ion Popescu", phone: "0722***456", truck: "B-123-ABC", type: "Unloading", ref: "REF-2024-001", status: "completed", ramp: "Ramp 3", time: "09:15" },
    { name: "Gheorghe Ionescu", phone: "0745***789", truck: "CJ-456-DEF", type: "Unloading", ref: "REF-2024-002", status: "in_progress", ramp: "Ramp 1", time: "09:42" },
    { name: "Andrei Marin", phone: "0733***123", truck: "TM-789-GHI", type: "Loading", ref: "REF-2024-003", status: "waiting", ramp: "-", time: "10:05" },
  ];

  return (
    <div className="bg-slate-900 rounded-b-xl p-4 min-h-[380px] text-white overflow-hidden">
      {/* Live Statistics Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">Live Statistics</h3>
        <div className="flex items-center gap-1 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2">
          <p className="text-[10px] text-amber-300 mb-0.5">Waiting</p>
          <p className="text-xl font-bold text-amber-400">3</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2">
          <p className="text-[10px] text-blue-300 mb-0.5">Confirmed</p>
          <p className="text-xl font-bold text-blue-400">5</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-2">
          <p className="text-[10px] text-purple-300 mb-0.5">Assigned</p>
          <p className="text-xl font-bold text-purple-400">2</p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-2">
          <p className="text-[10px] text-emerald-300 mb-0.5">In Progress</p>
          <p className="text-xl font-bold text-emerald-400">4</p>
        </div>
      </div>

      {/* Period Statistics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Completed</p>
          <p className="text-lg font-bold text-emerald-400">127</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Cancelled</p>
          <p className="text-lg font-bold text-red-400">8</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Avg Wait</p>
          <p className="text-lg font-bold text-white">12m</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Avg Complete</p>
          <p className="text-lg font-bold text-white">45m</p>
        </div>
      </div>

      {/* Check-ins Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 gap-1 px-2 py-1.5 bg-slate-700/50 text-[9px] text-slate-400 font-medium">
          <span>Driver</span>
          <span>Truck</span>
          <span>Type</span>
          <span>Reference</span>
          <span>Status</span>
          <span>Ramp</span>
        </div>
        {checkIns.map((item, i) => (
          <div key={i} className="grid grid-cols-6 gap-1 px-2 py-1.5 text-[9px] border-t border-slate-700/50 items-center">
            <div className="truncate">
              <p className="text-white font-medium truncate">{item.name}</p>
              <p className="text-slate-500 text-[8px]">{item.phone}</p>
            </div>
            <span className="text-slate-300 truncate">{item.truck}</span>
            <span className="text-slate-300">{item.type}</span>
            <span className="text-slate-400 truncate">{item.ref}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium w-fit ${
              item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
              item.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {item.status === 'completed' ? 'Completed' : item.status === 'in_progress' ? 'In Progress' : 'Waiting'}
            </span>
            <span className="text-slate-300">{item.ramp}</span>
          </div>
        ))}
      </div>

      {/* Ramps Section */}
      <div className="mt-3">
        <p className="text-[10px] text-slate-400 mb-1.5">Ramps & Docks</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((ramp) => (
            <div
              key={ramp}
              className={`flex-1 rounded py-1 text-center text-[9px] font-medium ${
                ramp === 1 || ramp === 3 ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' :
                ramp === 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              R{ramp}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-1.5 text-[8px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/30 border border-emerald-500/50" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500/30 border border-blue-500/50" /> Occupied</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/20 border border-red-500/30" /> Maintenance</span>
        </div>
      </div>
    </div>
  );
}
