import React from 'react';
import {
  FileText, Users, MapPin, Calendar, Camera, Phone,
  TrendingUp, Clock, Target, Film, ChevronRight, Star,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { AppView } from '../../types';

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400 font-medium">{label}</div>
        {sub && <div className="text-[10px] text-gray-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function QuickAction({ label, description, view, icon, gradient }: {
  label: string; description: string; view: AppView; icon: React.ReactNode; gradient: string;
}) {
  const { setView } = useStore();
  return (
    <button
      onClick={() => setView(view)}
      className="group bg-[#13132a] hover:bg-[#1a1a3a] border border-[#1e1b4b] hover:border-indigo-500/40 rounded-xl p-4 text-left transition-all duration-200"
    >
      <div className={`w-10 h-10 rounded-lg ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="font-semibold text-white text-sm">{label}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{description}</div>
      <div className="flex items-center gap-1 mt-2 text-indigo-400 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ChevronRight size={11} />
      </div>
    </button>
  );
}

export default function Dashboard() {
  const { activeProject, setView } = useStore();
  const project = activeProject();
  const { script, characters, locations, productionDays, shots, callSheets, crew, breakdownItems } = project;

  const principalCount = characters.filter(c => c.type === 'Principal').length;
  const shootDays = productionDays.length;
  const totalShots = shots.length;
  const completedShots = shots.filter(s => s.checked).length;
  const scenes = script.scenes.length;
  const pageCount = script.pageCount;

  const permitsPending = locations.filter(l => l.permitStatus === 'Pending').length;
  const permitsApproved = locations.filter(l => l.permitStatus === 'Approved').length;

  // Schedule progress
  const scheduledScenes = new Set(productionDays.flatMap(d => d.scenes.map(s => s.sceneId)));
  const schedulePct = scenes > 0 ? Math.round((scheduledScenes.size / scenes) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Project header */}
      <div className="bg-gradient-to-r from-[#13132a] to-[#1a1045] border border-[#2d2b5b] rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film size={20} className="text-indigo-400" />
              <span className="text-indigo-400 text-xs font-medium uppercase tracking-widest">{project.format} · {project.genre}</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">{project.name}</h2>
            <p className="text-gray-400 text-sm max-w-2xl">{project.logline}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              {project.director && <span><span className="text-gray-400">Dir:</span> {project.director}</span>}
              {project.producer && <span><span className="text-gray-400">Prod:</span> {project.producer}</span>}
              {project.dp && <span><span className="text-gray-400">DP:</span> {project.dp}</span>}
              {project.startDate && <span><span className="text-gray-400">Start:</span> {new Date(project.startDate).toLocaleDateString()}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Draft</div>
            <div className="text-white font-bold text-lg">{script.revisionColor ?? 'White'}</div>
            <div className="text-gray-500 text-xs">{script.draftDate}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Schedule Progress</span>
            <span className="text-xs font-bold text-indigo-400">{schedulePct}%</span>
          </div>
          <div className="h-1.5 bg-[#0d0d1f] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${schedulePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Script Pages" value={pageCount} sub={`${scenes} scenes`} color="bg-indigo-500/10 text-indigo-400" icon={<FileText size={16} />} />
        <StatCard label="Characters" value={characters.length} sub={`${principalCount} principals`} color="bg-purple-500/10 text-purple-400" icon={<Users size={16} />} />
        <StatCard label="Shoot Days" value={shootDays} sub={`${scheduledScenes.size}/${scenes} scenes scheduled`} color="bg-blue-500/10 text-blue-400" icon={<Calendar size={16} />} />
        <StatCard label="Locations" value={locations.length} sub={`${permitsApproved} permitted`} color="bg-emerald-500/10 text-emerald-400" icon={<MapPin size={16} />} />
        <StatCard label="Shots" value={totalShots} sub={totalShots > 0 ? `${completedShots} completed` : 'None created yet'} color="bg-amber-500/10 text-amber-400" icon={<Camera size={16} />} />
        <StatCard label="Call Sheets" value={callSheets.length} sub="Generated" color="bg-rose-500/10 text-rose-400" icon={<Phone size={16} />} />
        <StatCard label="Breakdown Items" value={breakdownItems.length} sub="Tagged elements" color="bg-cyan-500/10 text-cyan-400" icon={<Target size={16} />} />
        <StatCard label="Crew Members" value={crew.length} sub="Across all departments" color="bg-orange-500/10 text-orange-400" icon={<Star size={16} />} />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-indigo-400" /> Quick Access
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction view="screenplay" label="Write Script" description="Open screenplay editor" icon={<FileText size={18} className="text-white" />} gradient="bg-gradient-to-br from-indigo-600 to-purple-600" />
          <QuickAction view="breakdown" label="Breakdown" description="Tag scene elements" icon={<Target size={18} className="text-white" />} gradient="bg-gradient-to-br from-blue-600 to-cyan-600" />
          <QuickAction view="schedule" label="Schedule" description="Build strip board" icon={<Calendar size={18} className="text-white" />} gradient="bg-gradient-to-br from-emerald-600 to-teal-600" />
          <QuickAction view="shotlist" label="Shot List" description="Plan your shots" icon={<Camera size={18} className="text-white" />} gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
          <QuickAction view="callsheet" label="Call Sheet" description="Generate daily sheets" icon={<Phone size={18} className="text-white" />} gradient="bg-gradient-to-br from-rose-500 to-pink-500" />
          <QuickAction view="characters" label="Cast" description="Manage characters" icon={<Users size={18} className="text-white" />} gradient="bg-gradient-to-br from-violet-600 to-purple-600" />
          <QuickAction view="locations" label="Locations" description="Manage & permits" icon={<MapPin size={18} className="text-white" />} gradient="bg-gradient-to-br from-green-600 to-emerald-600" />
          <QuickAction view="reports" label="Reports" description="Export & analytics" icon={<TrendingUp size={18} className="text-white" />} gradient="bg-gradient-to-br from-slate-600 to-gray-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scene list */}
        <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Scenes</h3>
            <button onClick={() => setView('screenplay')} className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
              View All <ChevronRight size={11} />
            </button>
          </div>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {scenes === 0 ? (
              <div className="text-gray-600 text-xs text-center py-4">No scenes yet. Start writing your screenplay!</div>
            ) : (
              script.scenes.slice(0, 10).map(scene => (
                <div key={scene.id} className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer group" onClick={() => setView('screenplay')}>
                  <span className="text-indigo-500 text-[10px] font-bold mt-0.5 w-5 flex-shrink-0">#{scene.number}</span>
                  <span className="text-gray-300 text-xs leading-tight">{scene.heading}</span>
                </div>
              ))
            )}
            {scenes > 10 && (
              <div className="text-gray-600 text-xs text-center pt-1">+{scenes - 10} more scenes</div>
            )}
          </div>
        </div>

        {/* Alerts & Notices */}
        <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-400" /> Production Alerts
          </h3>
          <div className="space-y-2">
            {permitsPending > 0 && (
              <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertCircle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-amber-300 text-xs font-medium">{permitsPending} permit(s) pending</div>
                  <div className="text-gray-500 text-[11px]">Review location permits</div>
                </div>
              </div>
            )}
            {schedulePct < 100 && scenes > 0 && (
              <div className="flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Clock size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-blue-300 text-xs font-medium">{scenes - scheduledScenes.size} unscheduled scene(s)</div>
                  <div className="text-gray-500 text-[11px]">Add to production schedule</div>
                </div>
              </div>
            )}
            {totalShots === 0 && (
              <div className="flex items-start gap-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <Camera size={13} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-purple-300 text-xs font-medium">No shot list yet</div>
                  <div className="text-gray-500 text-[11px]">Create your shot list for each scene</div>
                </div>
              </div>
            )}
            {breakdownItems.length === 0 && (
              <div className="flex items-start gap-2 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <Target size={13} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-cyan-300 text-xs font-medium">Script not broken down</div>
                  <div className="text-gray-500 text-[11px]">Tag props, cast, wardrobe, and more</div>
                </div>
              </div>
            )}
            {permitsPending === 0 && schedulePct === 100 && totalShots > 0 && (
              <div className="flex items-start gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-emerald-300 text-xs font-medium">All systems go!</div>
                  <div className="text-gray-500 text-[11px]">Production is fully prepared</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming shoot days */}
      {productionDays.length > 0 && (
        <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Calendar size={14} className="text-indigo-400" /> Upcoming Shoot Days
            </h3>
            <button onClick={() => setView('schedule')} className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
              Full Schedule <ChevronRight size={11} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {productionDays.slice(0, 3).map(day => {
              const loc = day.locationId ? locations.find(l => l.id === day.locationId) : null;
              return (
                <div key={day.id} className="bg-[#0d0d1f] rounded-lg p-3 border border-[#1e1b4b]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-indigo-400 text-xs font-bold">{day.label}</span>
                    <span className="text-gray-500 text-[10px]">{new Date(day.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-white text-xs font-medium">Call: {day.generalCall}</div>
                  <div className="text-gray-500 text-[11px] mt-1">{day.scenes.length} scene(s)</div>
                  {loc && <div className="text-gray-600 text-[10px] truncate">{loc.name}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
