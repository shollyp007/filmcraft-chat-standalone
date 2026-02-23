import React, { useState } from 'react';
import { Plus, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { BREAKDOWN_COLORS, type BreakdownCategory, type BreakdownItem } from '../../types';
import { v4 as uuid } from '../../utils/uuid';

const CATEGORIES = Object.keys(BREAKDOWN_COLORS) as BreakdownCategory[];

function CategoryBadge({ category }: { category: BreakdownCategory }) {
  const c = BREAKDOWN_COLORS[category];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

function AddItemRow({ sceneId, onAdd }: { sceneId: string; onAdd: (item: Omit<BreakdownItem, 'id'>) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<BreakdownItem, 'id'>>({
    sceneId, category: 'props', name: '', description: '', quantity: 1, notes: '',
  });

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 py-1.5 px-2 rounded hover:bg-indigo-500/10 transition-colors"
    >
      <Plus size={12} /> Add element
    </button>
  );

  return (
    <div className="border border-indigo-500/30 rounded-lg p-3 bg-indigo-500/5 mt-2">
      <div className="grid grid-cols-4 gap-2 mb-2">
        <select
          className="col-span-1 bg-[#1a1a2e] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value as BreakdownCategory }))}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{BREAKDOWN_COLORS[c].label}</option>)}
        </select>
        <input
          className="col-span-2 bg-[#1a1a2e] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
          placeholder="Name *"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <input
          className="col-span-1 bg-[#1a1a2e] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
          placeholder="Qty"
          type="number"
          min={1}
          value={form.quantity ?? 1}
          onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
        />
      </div>
      <input
        className="w-full bg-[#1a1a2e] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 mb-2"
        placeholder="Notes (optional)"
        value={form.notes ?? ''}
        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!form.name.trim()) return;
            onAdd({ ...form, sceneId });
            setForm(f => ({ ...f, name: '', description: '', notes: '' }));
            setOpen(false);
          }}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors"
        >
          Add
        </button>
        <button onClick={() => setOpen(false)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function SceneBreakdownCard({
  scene, items, onAdd, onDelete
}: {
  scene: { id: string; number: number; heading: string };
  items: BreakdownItem[];
  onAdd: (item: Omit<BreakdownItem, 'id'>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<BreakdownCategory, BreakdownItem[]>);

  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl overflow-hidden mb-3">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-indigo-500 text-xs font-bold w-6 flex-shrink-0">#{scene.number}</span>
        <span className="text-white text-sm font-medium flex-1 uppercase">{scene.heading}</span>
        <div className="flex items-center gap-1">
          {Object.keys(grouped).slice(0, 4).map(cat => (
            <div
              key={cat}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: BREAKDOWN_COLORS[cat as BreakdownCategory].bg }}
              title={BREAKDOWN_COLORS[cat as BreakdownCategory].label}
            />
          ))}
          <span className="text-gray-500 text-xs ml-2">{items.length} items</span>
        </div>
        {expanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#1e1b4b]">
          {/* Category rows */}
          {CATEGORIES.map(cat => {
            const catItems = grouped[cat];
            if (!catItems) return null;
            const c = BREAKDOWN_COLORS[cat];
            return (
              <div key={cat} className="mt-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.bg }} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{c.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: c.bg, color: c.text }}>
                      {item.quantity && item.quantity > 1 && <span className="font-bold">×{item.quantity}</span>}
                      <span>{item.name}</span>
                      {item.notes && <span className="opacity-60">— {item.notes}</span>}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="ml-1 opacity-50 hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-gray-600 text-xs py-2">No elements tagged for this scene yet.</div>
          )}

          <AddItemRow sceneId={scene.id} onAdd={onAdd} />
        </div>
      )}
    </div>
  );
}

export default function BreakdownSheet() {
  const { activeProject, addBreakdownItem, deleteBreakdownItem } = useStore();
  const project = activeProject();
  const { script, breakdownItems } = project;

  const [filterCat, setFilterCat] = useState<BreakdownCategory | 'all'>('all');
  const [searchQ, setSearchQ] = useState('');

  const filteredItems = breakdownItems.filter(item => {
    if (filterCat !== 'all' && item.category !== filterCat) return false;
    if (searchQ && !item.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar - category summary */}
      <div className="w-52 flex-shrink-0 bg-[#0d0d1f] border-r border-[#1e1b4b] overflow-y-auto">
        <div className="px-3 py-3 border-b border-[#1e1b4b]">
          <div className="text-xs font-semibold text-gray-300">Category Filter</div>
        </div>
        <div className="py-1">
          <button
            onClick={() => setFilterCat('all')}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${filterCat === 'all' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:bg-white/5'}`}
          >
            All Categories <span className="text-gray-600">({breakdownItems.length})</span>
          </button>
          {CATEGORIES.map(cat => {
            const count = breakdownItems.filter(i => i.category === cat).length;
            const c = BREAKDOWN_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs transition-colors ${filterCat === cat ? 'bg-indigo-600/20' : 'hover:bg-white/5'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.bg, border: `1px solid ${c.text}44` }} />
                <span className={filterCat === cat ? 'text-white' : 'text-gray-400'}>{c.label}</span>
                {count > 0 && <span className="ml-auto text-gray-600">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Script Breakdown</h2>
            <p className="text-gray-500 text-xs mt-0.5">Tag and categorize every element in your script — industry-standard color coding</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search elements..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="bg-[#1a1a2e] border border-[#2d2b5b] text-gray-300 text-xs pl-3 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-40"
              />
            </div>
          </div>
        </div>

        {/* Color legend */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#13132a] rounded-lg border border-[#1e1b4b]">
          <span className="text-xs text-gray-500 font-medium mr-1">Color Code:</span>
          {CATEGORIES.slice(0, 8).map(cat => {
            const c = BREAKDOWN_COLORS[cat];
            return (
              <span key={cat} className="px-2 py-0.5 rounded text-[10px] font-medium"
                style={{ backgroundColor: c.bg, color: c.text }}>
                {c.label}
              </span>
            );
          })}
        </div>

        {/* Scene cards */}
        {script.scenes.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <Tag size={32} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">No scenes in your screenplay yet.</div>
            <div className="text-xs mt-1">Write your screenplay first, then come back to tag elements.</div>
          </div>
        ) : (
          script.scenes.map(scene => {
            const sceneItems = (filterCat === 'all' ? filteredItems : filteredItems)
              .filter(i => i.sceneId === scene.id)
              .filter(i => filterCat === 'all' || i.category === filterCat)
              .filter(i => !searchQ || i.name.toLowerCase().includes(searchQ.toLowerCase()));

            const allSceneItems = breakdownItems.filter(i => i.sceneId === scene.id);

            return (
              <SceneBreakdownCard
                key={scene.id}
                scene={{ id: scene.id, number: scene.number, heading: scene.heading }}
                items={filterCat !== 'all' || searchQ ? sceneItems : allSceneItems}
                onAdd={addBreakdownItem}
                onDelete={deleteBreakdownItem}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
