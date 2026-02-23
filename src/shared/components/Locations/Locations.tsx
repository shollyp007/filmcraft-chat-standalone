import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Phone, CheckCircle, AlertCircle, XCircle, Clock, Search, Check, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Location } from '../../types';

const PERMIT_STATUS = ['Pending', 'Approved', 'Denied', 'Not Required'] as const;

const permitBadge: Record<string, { icon: React.ReactNode; cls: string }> = {
  Approved:     { icon: <CheckCircle size={11} />, cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  Pending:      { icon: <Clock size={11} />, cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  Denied:       { icon: <XCircle size={11} />, cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  'Not Required': { icon: <CheckCircle size={11} />, cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

function LocationCard({ loc, onUpdate, onDelete }: {
  loc: Location;
  onUpdate: (updates: Partial<Location>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(loc);

  const save = () => { onUpdate(form); setEditing(false); };
  const cancel = () => { setForm(loc); setEditing(false); };

  const badge = permitBadge[loc.permitStatus ?? 'Not Required'];

  if (editing) {
    return (
      <div className="bg-[#1a1a3a] border border-indigo-500/40 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Location Name *</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Type</label>
            <select className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Location['type'] }))}>
              <option value="INT">INT — Interior</option>
              <option value="EXT">EXT — Exterior</option>
              <option value="INT/EXT">INT/EXT — Both</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-gray-500 block mb-1">Address</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Contact Name</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.contactName || ''} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="Location contact" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Contact Phone</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.contactPhone || ''} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Phone number" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Permit Status</label>
            <select className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.permitStatus || 'Not Required'} onChange={e => setForm(f => ({ ...f, permitStatus: e.target.value as Location['permitStatus'] }))}>
              {PERMIT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Nearest Hospital</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.nearestHospital || ''} onChange={e => setForm(f => ({ ...f, nearestHospital: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-gray-500 block mb-1">Notes</label>
            <textarea className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 resize-none"
              rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Parking, access, restrictions..." />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors">
            <Check size={12} /> Save
          </button>
          <button onClick={cancel} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-xs rounded-lg transition-colors">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] hover:border-indigo-500/30 rounded-xl p-4 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <div className={`px-2 py-1 rounded text-[10px] font-bold flex-shrink-0 ${
            loc.type === 'INT' ? 'bg-blue-500/20 text-blue-400' :
            loc.type === 'EXT' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>
            {loc.type}
          </div>
          <div>
            <div className="text-white font-semibold text-sm">{loc.name}</div>
            {loc.address && (
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                <MapPin size={10} /> {loc.address}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loc.permitStatus && (
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${badge.cls}`}>
              {badge.icon} {loc.permitStatus}
            </span>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1 text-gray-500 hover:text-indigo-400"><Edit2 size={12} /></button>
            <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 mt-2">
        {loc.contactName && (
          <span className="flex items-center gap-1"><Phone size={10} /> {loc.contactName} {loc.contactPhone && `· ${loc.contactPhone}`}</span>
        )}
        {loc.nearestHospital && (
          <span className="flex items-center gap-1 text-red-400/80"><AlertCircle size={10} /> {loc.nearestHospital}</span>
        )}
      </div>

      {loc.notes && (
        <div className="mt-2 text-[11px] text-gray-600 italic border-t border-[#1e1b4b] pt-2">{loc.notes}</div>
      )}

      {loc.parkingNotes && (
        <div className="mt-1 text-[11px] text-gray-600">Parking: {loc.parkingNotes}</div>
      )}
    </div>
  );
}

export default function Locations() {
  const { activeProject, addLocation, updateLocation, deleteLocation } = useStore();
  const project = activeProject();
  const { locations } = project;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPermit, setFilterPermit] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLoc, setNewLoc] = useState<Omit<Location, 'id'>>({
    name: '', type: 'INT', address: '', contactName: '', contactPhone: '',
    permitRequired: false, permitStatus: 'Not Required', notes: '',
  });

  const filtered = locations.filter(l => {
    if (filterType !== 'all' && l.type !== filterType) return false;
    if (filterPermit !== 'all' && l.permitStatus !== filterPermit) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pending = locations.filter(l => l.permitStatus === 'Pending').length;
  const approved = locations.filter(l => l.permitStatus === 'Approved').length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold">Locations</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            {locations.length} locations · {approved} permitted · {pending > 0 ? <span className="text-amber-400">{pending} pending</span> : '0 pending'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
        >
          <Plus size={14} /> Add Location
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search locations..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-[#1a1a2e] border border-[#2d2b5b] text-gray-300 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-44" />
        </div>
        {(['all', 'INT', 'EXT', 'INT/EXT'] as const).map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterType === t ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white border border-[#2d2b5b]'}`}>
            {t === 'all' ? 'All' : t}
          </button>
        ))}
        <div className="h-4 w-px bg-gray-700" />
        {(['all', ...PERMIT_STATUS] as const).map(s => (
          <button key={s} onClick={() => setFilterPermit(s)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterPermit === s ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white border border-[#2d2b5b]'}`}>
            {s === 'all' ? 'All Permits' : s}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-[#1a1a3a] border border-indigo-500/40 rounded-xl p-4 mb-4">
          <h3 className="text-white font-medium text-sm mb-3">New Location</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Location Name *</label>
              <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                placeholder="Location name" value={newLoc.name} onChange={e => setNewLoc(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Type</label>
              <select className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                value={newLoc.type} onChange={e => setNewLoc(f => ({ ...f, type: e.target.value as Location['type'] }))}>
                <option value="INT">INT</option>
                <option value="EXT">EXT</option>
                <option value="INT/EXT">INT/EXT</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-gray-500 block mb-1">Address</label>
              <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                placeholder="Full address" value={newLoc.address || ''} onChange={e => setNewLoc(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Permit Status</label>
              <select className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                value={newLoc.permitStatus || 'Not Required'} onChange={e => setNewLoc(f => ({ ...f, permitStatus: e.target.value as Location['permitStatus'] }))}>
                {PERMIT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Contact</label>
              <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                placeholder="Contact name & phone" value={newLoc.contactName || ''} onChange={e => setNewLoc(f => ({ ...f, contactName: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-gray-500 block mb-1">Notes</label>
              <textarea className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 resize-none"
                rows={2} placeholder="Access, parking, restrictions..." value={newLoc.notes || ''}
                onChange={e => setNewLoc(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { if (!newLoc.name.trim()) return; addLocation(newLoc); setNewLoc({ name: '', type: 'INT', address: '', contactName: '', contactPhone: '', permitRequired: false, permitStatus: 'Not Required', notes: '' }); setShowAddForm(false); }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
            >
              Add Location
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <MapPin size={40} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm">{locations.length === 0 ? 'No locations yet.' : 'No locations match your filter.'}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(loc => (
            <LocationCard key={loc.id} loc={loc} onUpdate={updates => updateLocation(loc.id, updates)} onDelete={() => deleteLocation(loc.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
