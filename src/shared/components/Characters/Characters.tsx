import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Search, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Character, Gender } from '../../types';

const TYPES = ['Principal', 'Supporting', 'Day Player', 'Extra'] as const;
const GENDERS: Gender[] = ['Male', 'Female', 'Non-binary', 'Other', 'Unspecified'];

function CharacterCard({ char, onUpdate, onDelete, scenes }: {
  char: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onDelete: () => void;
  scenes: { id: string; number: number; heading: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(char);

  const typeBadge: Record<string, string> = {
    Principal:  'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Supporting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Day Player': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Extra:      'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const save = () => { onUpdate(form); setEditing(false); };
  const cancel = () => { setForm(char); setEditing(false); };

  if (editing) {
    return (
      <div className="bg-[#1a1a3a] border border-indigo-500/40 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Character Name *</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 uppercase"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Type</label>
            <select className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Character['type'] }))}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Actor / Talent</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.actor || ''} onChange={e => setForm(f => ({ ...f, actor: e.target.value }))} placeholder="Actor name" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Age Range</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.ageRange || ''} onChange={e => setForm(f => ({ ...f, ageRange: e.target.value }))} placeholder="e.g. 30-40" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Gender</label>
            <select className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.gender || 'Unspecified'} onChange={e => setForm(f => ({ ...f, gender: e.target.value as Gender }))}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Contact / Agency Phone</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.contactInfo || ''} onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))} placeholder="Phone / email" />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-[10px] text-gray-500 block mb-1">Character Description</label>
          <textarea className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 resize-none"
            rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Character description, arc, motivation..." />
        </div>
        <div className="mb-3">
          <label className="text-[10px] text-gray-500 block mb-1">Notes</label>
          <textarea className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 resize-none"
            rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Casting notes, special requirements..." />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors">
            <Check size={12} /> Save
          </button>
          <button onClick={cancel} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] hover:border-indigo-500/30 rounded-xl p-4 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {char.name.charAt(0)}
          </div>
          <div>
            <div className="text-white font-bold uppercase tracking-wide text-sm">{char.name}</div>
            {char.actor && <div className="text-indigo-300 text-xs">Played by: {char.actor}</div>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeBadge[char.type] ?? 'bg-gray-500/20 text-gray-400'}`}>
            {char.type}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1 text-gray-500 hover:text-indigo-400"><Edit2 size={12} /></button>
            <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
        </div>
      </div>

      {char.description && (
        <p className="text-gray-400 text-xs leading-relaxed mb-2">{char.description}</p>
      )}

      <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
        {char.gender && char.gender !== 'Unspecified' && <span>Gender: {char.gender}</span>}
        {char.ageRange && <span>Age: {char.ageRange}</span>}
        {char.contactInfo && <span className="text-indigo-400">{char.contactInfo}</span>}
      </div>

      {char.notes && (
        <div className="mt-2 text-[10px] text-gray-600 italic border-t border-[#1e1b4b] pt-2">{char.notes}</div>
      )}
    </div>
  );
}

export default function Characters() {
  const { activeProject, addCharacter, updateCharacter, deleteCharacter } = useStore();
  const project = activeProject();
  const { characters, script } = project;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChar, setNewChar] = useState<Omit<Character, 'id'>>({
    name: '', type: 'Principal', description: '', gender: 'Unspecified', ageRange: '', notes: '',
  });

  const filtered = characters.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const principals = characters.filter(c => c.type === 'Principal').length;
  const supporting = characters.filter(c => c.type === 'Supporting').length;
  const scenes = script.scenes.map(s => ({ id: s.id, number: s.number, heading: s.heading }));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold">Characters & Cast</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            {characters.length} characters · {principals} principals · {supporting} supporting
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
        >
          <Plus size={14} /> Add Character
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search characters..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#1a1a2e] border border-[#2d2b5b] text-gray-300 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-44"
          />
        </div>
        {['all', ...TYPES].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterType === type ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white border border-[#2d2b5b]'}`}
          >
            {type === 'all' ? 'All' : type}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-[#1a1a3a] border border-indigo-500/40 rounded-xl p-4 mb-4">
          <h3 className="text-white font-medium text-sm mb-3">New Character</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Character Name *</label>
              <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 uppercase"
                placeholder="CHARACTER NAME"
                value={newChar.name}
                onChange={e => setNewChar(f => ({ ...f, name: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Type</label>
              <select className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                value={newChar.type} onChange={e => setNewChar(f => ({ ...f, type: e.target.value as Character['type'] }))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Actor</label>
              <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                placeholder="Actor name"
                value={newChar.actor || ''}
                onChange={e => setNewChar(f => ({ ...f, actor: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Age Range</label>
              <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                placeholder="30-40"
                value={newChar.ageRange || ''}
                onChange={e => setNewChar(f => ({ ...f, ageRange: e.target.value }))} />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-[10px] text-gray-500 block mb-1">Description</label>
            <textarea className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 resize-none"
              rows={2} placeholder="Character description..."
              value={newChar.description || ''} onChange={e => setNewChar(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!newChar.name.trim()) return;
                addCharacter(newChar);
                setNewChar({ name: '', type: 'Principal', description: '', gender: 'Unspecified', ageRange: '', notes: '' });
                setShowAddForm(false);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
            >
              Add Character
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm">{characters.length === 0 ? 'No characters yet.' : 'No characters match your filter.'}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(char => (
            <CharacterCard
              key={char.id}
              char={char}
              onUpdate={updates => updateCharacter(char.id, updates)}
              onDelete={() => deleteCharacter(char.id)}
              scenes={scenes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
