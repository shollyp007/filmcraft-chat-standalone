import React, { useState } from 'react';
import { Plus, GripVertical, Trash2, Calendar, Clock, ChevronDown, Film } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { ProductionDay, ScheduleScene } from '../../types';
import { v4 as uuid } from '../../utils/uuid';

// Strip color based on interior/exterior and time
function getStripColor(heading: string): string {
  const h = heading.toUpperCase();
  if (h.includes('INT.') && (h.includes('DAY') || h.includes('MORNING'))) return '#3b82f6';
  if (h.includes('INT.') && (h.includes('NIGHT') || h.includes('DUSK'))) return '#6366f1';
  if (h.includes('EXT.') && (h.includes('DAY') || h.includes('MORNING'))) return '#10b981';
  if (h.includes('EXT.') && (h.includes('NIGHT') || h.includes('DUSK'))) return '#8b5cf6';
  if (h.includes('INT./EXT.') || h.includes('I/E.')) return '#f59e0b';
  return '#6b7280';
}

function StripBar({ scene, heading, pages, onRemove }: {
  scene: ScheduleScene; heading: string; pages: number; onRemove: () => void;
}) {
  const color = getStripColor(heading);
  const width = Math.max(60, Math.min(300, pages * 60));

  return (
    <div
      className="strip rounded group relative"
      style={{ backgroundColor: `${color}22`, borderLeft: `3px solid ${color}` }}
      title={heading}
    >
      <div className="flex items-center gap-1 px-2 w-full overflow-hidden">
        <GripVertical size={10} className="text-gray-600 flex-shrink-0 cursor-grab" />
        <span className="text-white text-[11px] font-medium truncate flex-1">{heading}</span>
        <span className="text-gray-500 text-[10px] flex-shrink-0">{pages}p</span>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-1 flex-shrink-0"
        >
          <Trash2 size={9} />
        </button>
      </div>
    </div>
  );
}

function DayCard({ day, scenes, locations, allScenes, onUpdate, onDelete }: {
  day: ProductionDay;
  scenes: { id: string; number: number; heading: string }[];
  locations: { id: string; name: string }[];
  allScenes: { id: string; number: number; heading: string }[];
  onUpdate: (updates: Partial<ProductionDay>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showAddScene, setShowAddScene] = useState(false);
  const [newSceneId, setNewSceneId] = useState('');

  const scheduledSceneIds = day.scenes.map(s => s.sceneId);
  const availableScenes = allScenes.filter(s => !scheduledSceneIds.includes(s.id));

  const totalPages = day.scenes.reduce((sum, s) => sum + s.estPages, 0);
  const totalHours = day.scenes.reduce((sum, s) => sum + s.estHours, 0);

  const addScene = () => {
    if (!newSceneId) return;
    const scene: ScheduleScene = {
      id: uuid(), sceneId: newSceneId, order: day.scenes.length + 1,
      estPages: 2, estHours: 3,
    };
    onUpdate({ scenes: [...day.scenes, scene] });
    setNewSceneId('');
    setShowAddScene(false);
  };

  const removeScene = (sceneId: string) => {
    onUpdate({ scenes: day.scenes.filter(s => s.sceneId !== sceneId) });
  };

  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl overflow-hidden mb-3">
      {/* Day Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{day.label.replace('Day ', '')}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">{day.label}</span>
            <span className="text-gray-500 text-xs">·</span>
            <span className="text-gray-400 text-xs">{new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500">
            <span><Clock size={9} className="inline mr-0.5" />Call: {day.generalCall || '—'}</span>
            <span><Film size={9} className="inline mr-0.5" />{day.scenes.length} scenes</span>
            <span>≈{totalPages.toFixed(1)} pages · ~{totalHours}h</span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${expanded ? '' : '-rotate-90'}`} />
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#1e1b4b]">
          {/* Day settings */}
          <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Date</label>
              <input
                type="date"
                className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                value={day.date}
                onChange={e => onUpdate({ date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">General Call</label>
              <input
                type="time"
                className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                value={day.generalCall || ''}
                onChange={e => onUpdate({ generalCall: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Crew Call</label>
              <input
                type="time"
                className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                value={day.crewCall || ''}
                onChange={e => onUpdate({ crewCall: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-3">
            <label className="text-[10px] text-gray-500 block mb-1">Location</label>
            <select
              className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={day.locationId || ''}
              onChange={e => onUpdate({ locationId: e.target.value })}
            >
              <option value="">— Select Location —</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {/* Strip board */}
          <div className="mb-3">
            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
              <Film size={9} /> Scene Strips
            </div>
            <div className="space-y-0.5 min-h-8">
              {day.scenes.length === 0 ? (
                <div className="text-gray-600 text-xs py-2">No scenes scheduled for this day.</div>
              ) : (
                day.scenes.map(ss => {
                  const sceneData = scenes.find(s => s.id === ss.sceneId) ?? allScenes.find(s => s.id === ss.sceneId);
                  if (!sceneData) return null;
                  return (
                    <StripBar
                      key={ss.id}
                      scene={ss}
                      heading={`#${sceneData.number} ${sceneData.heading}`}
                      pages={ss.estPages}
                      onRemove={() => removeScene(ss.sceneId)}
                    />
                  );
                })
              )}
            </div>

            {showAddScene ? (
              <div className="flex gap-2 mt-2">
                <select
                  className="flex-1 bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                  value={newSceneId}
                  onChange={e => setNewSceneId(e.target.value)}
                >
                  <option value="">Select scene...</option>
                  {availableScenes.map(s => (
                    <option key={s.id} value={s.id}>#{s.number} — {s.heading.slice(0, 50)}</option>
                  ))}
                </select>
                <button onClick={addScene} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors">Add</button>
                <button onClick={() => setShowAddScene(false)} className="px-3 py-1 bg-gray-700 text-white text-xs rounded transition-colors">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddScene(true)}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-2 py-1"
              >
                <Plus size={12} /> Add scene to day
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Day Notes</label>
            <textarea
              className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 resize-none"
              rows={2}
              placeholder="Special equipment, weather notes, special instructions..."
              value={day.notes || ''}
              onChange={e => onUpdate({ notes: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductionBoard() {
  const { activeProject, addProductionDay, updateProductionDay, deleteProductionDay } = useStore();
  const project = activeProject();
  const { productionDays, script, locations } = project;

  const allScenes = script.scenes.map(s => ({ id: s.id, number: s.number, heading: s.heading }));
  const locationList = locations.map(l => ({ id: l.id, name: l.name }));

  const scheduledSceneIds = new Set(productionDays.flatMap(d => d.scenes.map(s => s.sceneId)));
  const unscheduledScenes = allScenes.filter(s => !scheduledSceneIds.has(s.id));

  const addDay = () => {
    const dayNum = productionDays.length + 1;
    const date = new Date();
    date.setDate(date.getDate() + dayNum);
    addProductionDay({
      date: date.toISOString().split('T')[0],
      label: `Day ${dayNum}`,
      scenes: [],
      generalCall: '07:00',
      crewCall: '07:30',
      notes: '',
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left panel - unscheduled */}
      <div className="w-56 flex-shrink-0 bg-[#0d0d1f] border-r border-[#1e1b4b] flex flex-col overflow-hidden">
        <div className="px-3 py-3 border-b border-[#1e1b4b]">
          <div className="text-xs font-semibold text-gray-300">Unscheduled</div>
          <div className="text-[10px] text-gray-600">{unscheduledScenes.length} scenes</div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {unscheduledScenes.length === 0 ? (
            <div className="text-gray-600 text-xs text-center py-6 px-3">All scenes scheduled!</div>
          ) : (
            unscheduledScenes.map(scene => (
              <div
                key={scene.id}
                className="mx-2 my-1 px-2 py-1.5 rounded text-xs border border-[#1e1b4b] bg-[#13132a] cursor-default"
                style={{ borderLeft: `3px solid ${getStripColor(scene.heading)}` }}
              >
                <div className="flex items-center gap-1">
                  <span className="text-indigo-500 font-bold text-[10px]">#{scene.number}</span>
                  <span className="text-gray-400 truncate leading-tight">{scene.heading.slice(0, 35)}</span>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Strip color legend */}
        <div className="p-3 border-t border-[#1e1b4b]">
          <div className="text-[10px] text-gray-500 mb-1.5 font-medium">Strip Colors</div>
          <div className="space-y-1 text-[10px] text-gray-600">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm" style={{ background: '#3b82f6' }} /> INT. Day</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm" style={{ background: '#6366f1' }} /> INT. Night</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm" style={{ background: '#10b981' }} /> EXT. Day</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm" style={{ background: '#8b5cf6' }} /> EXT. Night</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded-sm" style={{ background: '#f59e0b' }} /> INT./EXT.</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Production Schedule</h2>
            <p className="text-gray-500 text-xs mt-0.5">Strip board · {productionDays.length} shoot days · {scheduledSceneIds.size}/{allScenes.length} scenes scheduled</p>
          </div>
          <button
            onClick={addDay}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
          >
            <Plus size={14} /> Add Shoot Day
          </button>
        </div>

        {productionDays.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">No shoot days yet.</div>
            <div className="text-xs mt-1 mb-4">Add your first production day to start scheduling.</div>
            <button onClick={addDay} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
              <Plus size={14} className="inline mr-1" /> Add First Shoot Day
            </button>
          </div>
        ) : (
          productionDays.map(day => (
            <DayCard
              key={day.id}
              day={day}
              scenes={allScenes}
              locations={locationList}
              allScenes={allScenes}
              onUpdate={updates => updateProductionDay(day.id, updates)}
              onDelete={() => deleteProductionDay(day.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
