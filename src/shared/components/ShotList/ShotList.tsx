import React, { useState } from 'react';
import { Plus, Trash2, Camera, CheckSquare, Square, ChevronDown, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Shot, ShotSize, CameraAngle, CameraMovement } from '../../types';
import { v4 as uuid } from '../../utils/uuid';

const SHOT_SIZES: ShotSize[] = ['ECU', 'CU', 'MCU', 'MS', 'MLS', 'FS', 'LS', 'ELS', 'OTS', 'POV', 'INSERT'];
const ANGLES: CameraAngle[] = ['Eye Level', 'High Angle', 'Low Angle', 'Dutch/Canted', 'Overhead', 'Worms Eye'];
const MOVEMENTS: CameraMovement[] = ['Static', 'Pan', 'Tilt', 'Dolly In', 'Dolly Out', 'Track/Follow', 'Crane', 'Handheld', 'Steadicam', 'Zoom In', 'Zoom Out', 'Arc'];

const SIZE_COLORS: Record<ShotSize, string> = {
  ECU: '#ef4444', CU: '#f97316', MCU: '#f59e0b', MS: '#10b981',
  MLS: '#06b6d4', FS: '#3b82f6', LS: '#8b5cf6', ELS: '#a855f7',
  OTS: '#6366f1', POV: '#ec4899', INSERT: '#84cc16',
};

const SIZE_LABELS: Record<ShotSize, string> = {
  ECU: 'Extreme Close Up', CU: 'Close Up', MCU: 'Med. Close Up',
  MS: 'Medium Shot', MLS: 'Med. Long Shot', FS: 'Full Shot',
  LS: 'Long Shot', ELS: 'Extreme Long Shot', OTS: 'Over the Shoulder',
  POV: 'Point of View', INSERT: 'Insert',
};

function ShotRow({ shot, onUpdate, onDelete }: {
  shot: Shot; onUpdate: (updates: Partial<Shot>) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(shot);

  const save = () => { onUpdate(form); setEditing(false); };
  const cancel = () => { setForm(shot); setEditing(false); };

  const color = SIZE_COLORS[shot.size] ?? '#6366f1';

  if (editing) {
    return (
      <tr className="bg-indigo-900/10 border-l-2 border-indigo-400">
        <td className="px-3 py-2">
          <input className="w-16 bg-[#0d0d1f] border border-indigo-500 text-white text-xs rounded px-1.5 py-1 focus:outline-none"
            value={form.shotNumber} onChange={e => setForm(f => ({ ...f, shotNumber: e.target.value }))} />
        </td>
        <td className="px-3 py-2">
          <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </td>
        <td className="px-3 py-2">
          <select className="bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
            value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value as ShotSize }))}>
            {SHOT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
        <td className="px-3 py-2">
          <select className="bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
            value={form.angle} onChange={e => setForm(f => ({ ...f, angle: e.target.value as CameraAngle }))}>
            {ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </td>
        <td className="px-3 py-2">
          <select className="bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
            value={form.movement} onChange={e => setForm(f => ({ ...f, movement: e.target.value as CameraMovement }))}>
            {MOVEMENTS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </td>
        <td className="px-3 py-2">
          <input className="w-20 bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
            value={form.lens ?? ''} onChange={e => setForm(f => ({ ...f, lens: e.target.value }))} placeholder="e.g. 35mm" />
        </td>
        <td className="px-3 py-2">
          <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
            value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes..." />
        </td>
        <td className="px-3 py-2">
          <div className="flex gap-1">
            <button onClick={save} className="p-1 text-green-400 hover:text-green-300"><Check size={12} /></button>
            <button onClick={cancel} className="p-1 text-gray-500 hover:text-gray-300"><X size={12} /></button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[#1e1b4b] hover:bg-white/5 group transition-colors">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => onUpdate({ checked: !shot.checked })} className="text-gray-500 hover:text-indigo-400">
            {shot.checked ? <CheckSquare size={14} className="text-indigo-400" /> : <Square size={14} />}
          </button>
          <span className={`text-xs font-bold ${shot.checked ? 'text-gray-600 line-through' : 'text-white'}`}>{shot.shotNumber}</span>
        </div>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs ${shot.checked ? 'text-gray-600 line-through' : 'text-gray-200'}`}>{shot.description}</span>
      </td>
      <td className="px-3 py-2">
        <span className="shot-type px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: `${color}22`, color }}>
          {shot.size}
        </span>
        <div className="text-[10px] text-gray-600 mt-0.5">{SIZE_LABELS[shot.size]}</div>
      </td>
      <td className="px-3 py-2 text-xs text-gray-400">{shot.angle}</td>
      <td className="px-3 py-2 text-xs text-gray-400">{shot.movement}</td>
      <td className="px-3 py-2 text-xs text-gray-500">{shot.lens || '—'}</td>
      <td className="px-3 py-2 text-xs text-gray-500">{shot.notes || '—'}</td>
      <td className="px-3 py-2">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1 text-gray-500 hover:text-indigo-400"><Edit2 size={12} /></button>
          <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={12} /></button>
        </div>
      </td>
    </tr>
  );
}

function AddShotForm({ sceneId, sceneNumber, onAdd, onCancel }: {
  sceneId: string; sceneNumber: number;
  onAdd: (shot: Omit<Shot, 'id'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Shot, 'id'>>({
    sceneId, shotNumber: `${sceneNumber}A`, description: '',
    size: 'MS', angle: 'Eye Level', movement: 'Static',
    lens: '', notes: '', checked: false,
  });

  return (
    <tr className="bg-indigo-900/10 border-l-2 border-indigo-400">
      <td className="px-3 py-2">
        <input className="w-16 bg-[#0d0d1f] border border-indigo-500 text-white text-xs rounded px-1.5 py-1 focus:outline-none"
          value={form.shotNumber} onChange={e => setForm(f => ({ ...f, shotNumber: e.target.value }))} placeholder="1A" />
      </td>
      <td className="px-3 py-2">
        <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Shot description *" autoFocus />
      </td>
      <td className="px-3 py-2">
        <select className="bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
          value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value as ShotSize }))}>
          {SHOT_SIZES.map(s => <option key={s} value={s}>{s} — {SIZE_LABELS[s]}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <select className="bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
          value={form.angle} onChange={e => setForm(f => ({ ...f, angle: e.target.value as CameraAngle }))}>
          {ANGLES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <select className="bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
          value={form.movement} onChange={e => setForm(f => ({ ...f, movement: e.target.value as CameraMovement }))}>
          {MOVEMENTS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <input className="w-20 bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
          value={form.lens ?? ''} onChange={e => setForm(f => ({ ...f, lens: e.target.value }))} placeholder="35mm" />
      </td>
      <td className="px-3 py-2">
        <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
          value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes..." />
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <button
            onClick={() => { if (!form.description.trim()) return; onAdd(form); }}
            className="p-1 text-green-400 hover:text-green-300"
          ><Check size={12} /></button>
          <button onClick={onCancel} className="p-1 text-gray-500 hover:text-gray-300"><X size={12} /></button>
        </div>
      </td>
    </tr>
  );
}

function SceneShotSection({ scene, shots, onAdd, onUpdate, onDelete }: {
  scene: { id: string; number: number; heading: string };
  shots: Shot[];
  onAdd: (shot: Omit<Shot, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Shot>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const completed = shots.filter(s => s.checked).length;

  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl overflow-hidden mb-4">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-indigo-500 text-xs font-bold w-6 flex-shrink-0">#{scene.number}</span>
        <span className="text-white text-sm font-medium flex-1 uppercase truncate">{scene.heading}</span>
        <div className="flex items-center gap-3">
          {shots.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-[#0d0d1f] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(completed / shots.length) * 100}%` }} />
              </div>
              <span className="text-gray-500 text-[10px]">{completed}/{shots.length}</span>
            </div>
          )}
          <span className="text-gray-500 text-xs">{shots.length} shot{shots.length !== 1 ? 's' : ''}</span>
        </div>
        {expanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
      </div>

      {expanded && (
        <div className="border-t border-[#1e1b4b]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1e1b4b] bg-[#0d0d1f]">
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wide w-20">Shot #</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wide w-28">Size</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wide w-28">Angle</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wide w-28">Movement</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wide w-20">Lens</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase tracking-wide">Notes</th>
                  <th className="px-3 py-2 w-16" />
                </tr>
              </thead>
              <tbody>
                {shots.map(shot => (
                  <ShotRow
                    key={shot.id}
                    shot={shot}
                    onUpdate={updates => onUpdate(shot.id, updates)}
                    onDelete={() => onDelete(shot.id)}
                  />
                ))}
                {adding && (
                  <AddShotForm
                    sceneId={scene.id}
                    sceneNumber={scene.number}
                    onAdd={s => { onAdd(s); setAdding(false); }}
                    onCancel={() => setAdding(false)}
                  />
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2">
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 py-1 transition-colors"
            >
              <Plus size={12} /> Add shot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShotList() {
  const { activeProject, addShot, updateShot, deleteShot } = useStore();
  const project = activeProject();
  const { script, shots } = project;

  const [filterScene, setFilterScene] = useState<string>('all');

  const totalShots = shots.length;
  const completed = shots.filter(s => s.checked).length;

  const filteredScenes = filterScene === 'all'
    ? script.scenes
    : script.scenes.filter(s => s.id === filterScene);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 bg-[#0d0d1f] border-r border-[#1e1b4b] overflow-y-auto">
        <div className="px-3 py-3 border-b border-[#1e1b4b]">
          <div className="text-xs font-semibold text-gray-300">Filter by Scene</div>
          <div className="text-[10px] text-gray-600">{totalShots} total shots</div>
        </div>
        <div className="py-1">
          <button
            onClick={() => setFilterScene('all')}
            className={`w-full text-left px-3 py-2 text-xs ${filterScene === 'all' ? 'text-indigo-400 bg-indigo-600/10' : 'text-gray-400 hover:bg-white/5'}`}
          >
            All Scenes <span className="text-gray-600">({shots.length})</span>
          </button>
          {script.scenes.map(scene => {
            const count = shots.filter(s => s.sceneId === scene.id).length;
            return (
              <button
                key={scene.id}
                onClick={() => setFilterScene(scene.id)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs transition-colors ${filterScene === scene.id ? 'text-indigo-400 bg-indigo-600/10' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <span className="text-indigo-600 font-bold text-[10px] w-4 flex-shrink-0">#{scene.number}</span>
                <span className="truncate">{scene.heading.slice(0, 28)}</span>
                {count > 0 && <span className="ml-auto text-gray-600 flex-shrink-0">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Shot size legend */}
        <div className="p-3 border-t border-[#1e1b4b]">
          <div className="text-[10px] text-gray-500 mb-1.5 font-medium">Shot Sizes</div>
          <div className="grid grid-cols-2 gap-1">
            {SHOT_SIZES.slice(0, 8).map(size => (
              <div key={size} className="flex items-center gap-1">
                <div className="w-6 h-3 rounded-sm text-[8px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: `${SIZE_COLORS[size]}33`, color: SIZE_COLORS[size] }}>
                  {size}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Shot List</h2>
            <p className="text-gray-500 text-xs mt-0.5">{totalShots} shots · {completed} completed · {totalShots - completed} remaining</p>
          </div>
          {totalShots > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${(completed / totalShots) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-400">{Math.round((completed / totalShots) * 100)}%</span>
            </div>
          )}
        </div>

        {script.scenes.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <Camera size={40} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">No scenes yet.</div>
            <div className="text-xs mt-1">Write your screenplay first, then build your shot list here.</div>
          </div>
        ) : (
          filteredScenes.map(scene => (
            <SceneShotSection
              key={scene.id}
              scene={{ id: scene.id, number: scene.number, heading: scene.heading }}
              shots={shots.filter(s => s.sceneId === scene.id)}
              onAdd={addShot}
              onUpdate={updateShot}
              onDelete={deleteShot}
            />
          ))
        )}
      </div>
    </div>
  );
}
