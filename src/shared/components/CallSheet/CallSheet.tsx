import React, { useState } from 'react';
import { Plus, Trash2, Phone, Printer, Sun, User, Users, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { CallSheet, CastCall, CrewMember } from '../../types';
import { v4 as uuid } from '../../utils/uuid';

function CallSheetView({ sheet, characters, locations, onDelete }: {
  sheet: CallSheet;
  characters: { id: string; name: string; actor?: string }[];
  locations: { id: string; name: string; address?: string }[];
  onDelete: () => void;
}) {
  const loc = locations.find(l => l.id === sheet.locationId);

  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl overflow-hidden mb-4">
      {/* Call Sheet Header */}
      <div className="p-6 border-b border-[#1e1b4b] bg-gradient-to-r from-[#1a1045] to-[#13132a]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-indigo-400 font-medium uppercase tracking-wide mb-1">Call Sheet</div>
            <h3 className="text-2xl font-bold text-white">{sheet.productionName}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span>Shoot Day {sheet.shootDay}</span>
              <span>·</span>
              <span>{new Date(sheet.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
            >
              <Printer size={12} /> Print
            </button>
            <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">Director</div>
            <div className="text-white text-sm font-medium">{sheet.director || '—'}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">General Call</div>
            <div className="text-white text-sm font-bold text-indigo-400">{sheet.generalCall}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">Crew Call</div>
            <div className="text-white text-sm font-bold">{sheet.crewCall}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase mb-0.5">Location</div>
            <div className="text-white text-sm">{loc?.name || sheet.locationAddress || '—'}</div>
          </div>
        </div>

        {sheet.weather && (
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span><Sun size={11} className="inline text-amber-400" /> {sheet.weather}</span>
            {sheet.sunrise && <span>Sunrise: {sheet.sunrise}</span>}
            {sheet.sunset && <span>Sunset: {sheet.sunset}</span>}
          </div>
        )}

        {sheet.nearestHospital && (
          <div className="flex items-center gap-2 mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-1.5">
            <AlertTriangle size={11} /> Nearest Hospital: {sheet.nearestHospital}
            {sheet.emergencyNumber && <span className="ml-2 font-bold">{sheet.emergencyNumber}</span>}
          </div>
        )}
      </div>

      {/* Cast Calls */}
      {sheet.castCalls.length > 0 && (
        <div className="p-4 border-b border-[#1e1b4b]">
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <User size={14} className="text-indigo-400" /> Cast Calls
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase border-b border-[#1e1b4b]">
                  <th className="pb-2 pr-4">Character</th>
                  <th className="pb-2 pr-4">Actor</th>
                  <th className="pb-2 pr-4">Makeup</th>
                  <th className="pb-2 pr-4">Wardrobe</th>
                  <th className="pb-2 pr-4">On Set</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sheet.castCalls.map((call, i) => (
                  <tr key={i} className="border-b border-[#1e1b4b]/50 hover:bg-white/5">
                    <td className="py-2 pr-4 text-white text-xs font-medium">{call.characterName}</td>
                    <td className="py-2 pr-4 text-gray-400 text-xs">{call.actorName || '—'}</td>
                    <td className="py-2 pr-4 text-gray-400 text-xs">{call.makeupCall || '—'}</td>
                    <td className="py-2 pr-4 text-gray-400 text-xs">{call.wardrobeCall || '—'}</td>
                    <td className="py-2 pr-4 text-indigo-400 text-xs font-bold">{call.setCall || '—'}</td>
                    <td className="py-2 text-gray-500 text-xs">{call.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Crew */}
      {sheet.crew.length > 0 && (
        <div className="p-4 border-b border-[#1e1b4b]">
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Users size={14} className="text-indigo-400" /> Crew
          </h4>
          {/* Group by department */}
          {Array.from(new Set(sheet.crew.map(c => c.department))).map(dept => (
            <div key={dept} className="mb-3">
              <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide mb-1">{dept}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {sheet.crew.filter(c => c.department === dept).map(member => (
                  <div key={member.id} className="flex items-start gap-2 p-2 bg-[#0d0d1f] rounded-lg">
                    <div>
                      <div className="text-white text-xs font-medium">{member.name}</div>
                      <div className="text-gray-500 text-[10px]">{member.role}</div>
                      {member.call && <div className="text-indigo-400 text-[10px] font-bold">Call: {member.call}</div>}
                      {member.phone && <div className="text-gray-600 text-[10px]">{member.phone}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {sheet.notes && (
        <div className="p-4">
          <h4 className="text-white font-semibold text-sm mb-2">Notes</h4>
          <div className="text-gray-400 text-xs whitespace-pre-wrap">{sheet.notes}</div>
        </div>
      )}
    </div>
  );
}

function NewCallSheetForm({ onClose, onSave }: { onClose: () => void; onSave: (sheet: Omit<CallSheet, 'id'>) => void }) {
  const { activeProject } = useStore();
  const project = activeProject();
  const { characters, locations, crew, callSheets } = project;

  const [form, setForm] = useState<Omit<CallSheet, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    shootDay: callSheets.length + 1,
    productionName: project.name,
    director: project.director || '',
    producer: project.producer || '',
    productionCompany: project.productionCompany || '',
    generalCall: '07:00',
    crewCall: '07:30',
    scenes: [],
    castCalls: characters.filter(c => c.type === 'Principal').map(c => ({
      characterId: c.id, characterName: c.name, actorName: c.actor || '',
      reportTime: '', makeupCall: '', wardrobeCall: '', setCall: '07:30', notes: '',
    })),
    crew: crew.map(m => ({ ...m, call: '07:00' })),
    nearestHospital: '',
    emergencyNumber: '911',
    weather: '',
    sunrise: '',
    sunset: '',
    notes: '',
  });

  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">New Call Sheet</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm">✕</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Date *</label>
          <input type="date" className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
            value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Shoot Day #</label>
          <input type="number" className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
            value={form.shootDay} onChange={e => setForm(f => ({ ...f, shootDay: parseInt(e.target.value) }))} />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">General Call</label>
          <input type="time" className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
            value={form.generalCall} onChange={e => setForm(f => ({ ...f, generalCall: e.target.value }))} />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Crew Call</label>
          <input type="time" className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
            value={form.crewCall} onChange={e => setForm(f => ({ ...f, crewCall: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Location</label>
          <select className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
            value={form.locationId || ''} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}>
            <option value="">Select location...</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Nearest Hospital</label>
          <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
            value={form.nearestHospital || ''} onChange={e => setForm(f => ({ ...f, nearestHospital: e.target.value }))} placeholder="Hospital name & address" />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Weather</label>
          <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
            value={form.weather || ''} onChange={e => setForm(f => ({ ...f, weather: e.target.value }))} placeholder="e.g. Partly cloudy, 72°F" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Sunrise</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.sunrise || ''} onChange={e => setForm(f => ({ ...f, sunrise: e.target.value }))} placeholder="6:23 AM" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 block mb-1">Sunset</label>
            <input className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              value={form.sunset || ''} onChange={e => setForm(f => ({ ...f, sunset: e.target.value }))} placeholder="7:45 PM" />
          </div>
        </div>
      </div>

      {/* Cast calls */}
      {form.castCalls.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-300 mb-2">Cast Call Times</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase border-b border-[#1e1b4b]">
                  <th className="pb-1.5 pr-3">Character</th>
                  <th className="pb-1.5 pr-3">Actor</th>
                  <th className="pb-1.5 pr-3">Makeup</th>
                  <th className="pb-1.5 pr-3">Wardrobe</th>
                  <th className="pb-1.5 pr-3">On Set</th>
                </tr>
              </thead>
              <tbody>
                {form.castCalls.map((call, i) => (
                  <tr key={i}>
                    <td className="pr-3 py-1 text-white text-xs font-medium">{call.characterName}</td>
                    <td className="pr-3 py-1">
                      <input className="w-24 bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-0.5 focus:outline-none"
                        value={call.actorName || ''} onChange={e => { const c = [...form.castCalls]; c[i] = { ...c[i], actorName: e.target.value }; setForm(f => ({ ...f, castCalls: c })); }} />
                    </td>
                    <td className="pr-3 py-1">
                      <input type="time" className="w-24 bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-0.5 focus:outline-none"
                        value={call.makeupCall || ''} onChange={e => { const c = [...form.castCalls]; c[i] = { ...c[i], makeupCall: e.target.value }; setForm(f => ({ ...f, castCalls: c })); }} />
                    </td>
                    <td className="pr-3 py-1">
                      <input type="time" className="w-24 bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-0.5 focus:outline-none"
                        value={call.wardrobeCall || ''} onChange={e => { const c = [...form.castCalls]; c[i] = { ...c[i], wardrobeCall: e.target.value }; setForm(f => ({ ...f, castCalls: c })); }} />
                    </td>
                    <td className="py-1">
                      <input type="time" className="w-24 bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-1.5 py-0.5 focus:outline-none"
                        value={call.setCall || ''} onChange={e => { const c = [...form.castCalls]; c[i] = { ...c[i], setCall: e.target.value }; setForm(f => ({ ...f, castCalls: c })); }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="text-[10px] text-gray-500 block mb-1">Notes</label>
        <textarea className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 resize-none"
          rows={3} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes, advance schedule, special instructions..." />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
        >
          Generate Call Sheet
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CallSheetManager() {
  const { activeProject, createCallSheet, deleteCallSheet } = useStore();
  const project = activeProject();
  const { callSheets, characters, locations } = project;
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold">Call Sheets</h2>
          <p className="text-gray-500 text-xs mt-0.5">Generate daily production call sheets</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
        >
          <Plus size={14} /> New Call Sheet
        </button>
      </div>

      {showNew && (
        <NewCallSheetForm
          onClose={() => setShowNew(false)}
          onSave={sheet => { createCallSheet(sheet); setShowNew(false); }}
        />
      )}

      {callSheets.length === 0 && !showNew ? (
        <div className="text-center py-20 text-gray-600">
          <Phone size={40} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm">No call sheets yet.</div>
          <div className="text-xs mt-1 mb-4">Generate your first call sheet to share with cast and crew.</div>
          <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
            <Plus size={14} className="inline mr-1" /> New Call Sheet
          </button>
        </div>
      ) : (
        callSheets.map(sheet => (
          <CallSheetView
            key={sheet.id}
            sheet={sheet}
            characters={characters}
            locations={locations}
            onDelete={() => deleteCallSheet(sheet.id)}
          />
        ))
      )}
    </div>
  );
}
