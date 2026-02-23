import { useState, useRef } from 'react';
import { X, UserPlus, Trash2, Upload, Download, Crown, Pencil, Eye, Users } from 'lucide-react';
import type { Collaborator, CollaboratorRole, Project } from '../../types';
import { useStore } from '../../store/useStore';
import {
  exportCollabPackage,
  readFileAsText,
  downloadFile,
  sanitizeFilename,
} from '../../utils/exportUtils';
import type { CollabPackage } from '../../utils/exportUtils';

interface Props {
  project: Project;
  onClose: () => void;
}

const ROLE_META: Record<CollaboratorRole, { label: string; icon: React.ReactNode; color: string }> = {
  Owner:  { label: 'Owner',  icon: <Crown  size={12} />, color: 'text-amber-400 bg-amber-400/10' },
  Writer: { label: 'Writer', icon: <Pencil size={12} />, color: 'text-indigo-400 bg-indigo-400/10' },
  Editor: { label: 'Editor', icon: <Pencil size={12} />, color: 'text-emerald-400 bg-emerald-400/10' },
  Viewer: { label: 'Viewer', icon: <Eye    size={12} />, color: 'text-gray-400 bg-gray-400/10' },
};

export default function CollaborationModal({ project, onClose }: Props) {
  const { addCollaborator, removeCollaborator, updateCollaborator, updateElements } = useStore();
  const collaborators = project.collaborators ?? [];

  const [tab, setTab] = useState<'people' | 'share'>('people');
  const [form, setForm] = useState({ name: '', email: '', role: 'Writer' as CollaboratorRole });
  const [adding, setAdding] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    if (!form.name.trim() || !form.email.trim()) return;
    addCollaborator({ name: form.name.trim(), email: form.email.trim(), role: form.role });
    setForm({ name: '', email: '', role: 'Writer' });
    setAdding(false);
  }

  function handleExportPackage(collab: Collaborator) {
    const pkg = exportCollabPackage(project, { name: collab.name, email: collab.email });
    const filename = `${sanitizeFilename(project.name)}_for_${sanitizeFilename(collab.name)}.filmcraft`;
    downloadFile(pkg, filename, 'application/json;charset=utf-8');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('Reading file...');
    try {
      const text = await readFileAsText(file);
      const pkg = JSON.parse(text) as CollabPackage;

      if (pkg.type !== 'filmcraft-collaboration-package') {
        setImportStatus('Error: Not a valid collaboration package.');
        return;
      }
      if (pkg.projectId !== project.id) {
        setImportStatus(`Warning: This package is for a different project ("${pkg.projectName}"). Proceed?`);
        // For simplicity we still offer to import
      }

      const confirmed = window.confirm(
        `Import script changes from ${pkg.contributor.name} (${pkg.contributor.email})?\n\n` +
        `Exported: ${new Date(pkg.exportedAt).toLocaleString()}\n\n` +
        `This will replace the current script elements with the contributor's version.`
      );

      if (confirmed) {
        updateElements(pkg.script.elements);
        setImportStatus(`Imported successfully from ${pkg.contributor.name}.`);
        // Update last seen for this collaborator if they're in the list
        const existing = collaborators.find(c => c.email === pkg.contributor.email);
        if (existing) {
          updateCollaborator(existing.id, { lastSeen: new Date().toISOString() });
        }
      } else {
        setImportStatus('Import cancelled.');
      }
    } catch {
      setImportStatus('Error: Could not read file. Make sure it is a valid .filmcraft package.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function formatDate(iso: string) {
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[#13132a] border border-[#2d2b5b] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1b4b] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-400" />
            <div>
              <h2 className="text-white font-semibold text-base">Collaboration</h2>
              <p className="text-gray-500 text-xs">{project.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e1b4b] flex-shrink-0">
          {(['people', 'share'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${
                tab === t
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'people' ? 'Collaborators' : 'Share Package'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── People Tab ── */}
          {tab === 'people' && (
            <div className="p-4 flex flex-col gap-3">
              {/* Collaborator list */}
              {collaborators.length === 0 && !adding && (
                <div className="text-center py-8 text-gray-600 text-sm">
                  <Users size={28} className="mx-auto mb-2 opacity-40" />
                  No collaborators yet.<br />Invite writers and editors to work with you.
                </div>
              )}

              {collaborators.map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 bg-[#1a1a2e] border border-[#2d2b5b] rounded-xl"
                >
                  {/* Avatar initial */}
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-semibold text-sm flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">{c.name}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_META[c.role].color}`}>
                        {ROLE_META[c.role].icon} {c.role}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs truncate">{c.email}</div>
                    {c.lastSeen && (
                      <div className="text-gray-600 text-[10px]">Last seen {formatDate(c.lastSeen)}</div>
                    )}
                  </div>

                  {/* Role selector */}
                  <select
                    value={c.role}
                    onChange={e => updateCollaborator(c.id, { role: e.target.value as CollaboratorRole })}
                    className="text-xs bg-[#0d0d1f] border border-[#2d2b5b] text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                  >
                    {(['Owner', 'Writer', 'Editor', 'Viewer'] as CollaboratorRole[]).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>

                  {/* Export package for this person */}
                  <button
                    onClick={() => handleExportPackage(c)}
                    title="Export script package for this collaborator"
                    className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors"
                  >
                    <Download size={14} />
                  </button>

                  <button
                    onClick={() => removeCollaborator(c.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove collaborator"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* Add form */}
              {adding ? (
                <div className="p-4 bg-[#1a1a2e] border border-indigo-500/30 rounded-xl flex flex-col gap-3">
                  <p className="text-xs text-gray-400 font-medium">Add collaborator</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="flex-1 bg-[#0d0d1f] border border-[#2d2b5b] text-gray-200 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                    />
                    <select
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value as CollaboratorRole }))}
                      className="bg-[#0d0d1f] border border-[#2d2b5b] text-gray-300 text-sm px-2 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      {(['Writer', 'Editor', 'Viewer'] as CollaboratorRole[]).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    className="w-full bg-[#0d0d1f] border border-[#2d2b5b] text-gray-200 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-gray-600"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdd}
                      disabled={!form.name.trim() || !form.email.trim()}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAdding(false)}
                      className="flex-1 py-1.5 bg-[#0d0d1f] hover:bg-[#2d2b5b] text-gray-400 text-sm rounded-lg border border-[#2d2b5b] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-[#2d2b5b] hover:border-indigo-500/50 text-gray-500 hover:text-indigo-400 text-sm rounded-xl transition-colors"
                >
                  <UserPlus size={14} /> Add Collaborator
                </button>
              )}
            </div>
          )}

          {/* ── Share Tab ── */}
          {tab === 'share' && (
            <div className="p-4 flex flex-col gap-4">
              {/* How it works */}
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 text-xs text-gray-400 leading-relaxed">
                <p className="text-indigo-300 font-medium mb-1.5">How offline collaboration works</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Add your collaborators in the People tab</li>
                  <li>Export a script package and send it to them</li>
                  <li>They open it in FilmCraft Pro and make edits</li>
                  <li>They export their version and send it back</li>
                  <li>Import their package here to merge changes</li>
                </ol>
              </div>

              {/* Export package */}
              <div className="bg-[#1a1a2e] border border-[#2d2b5b] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download size={14} className="text-indigo-400" />
                  <span className="text-white text-sm font-medium">Export Script Package</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">
                  Export the current script as a package file (.filmcraft) to share with collaborators.
                </p>
                {collaborators.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {collaborators.filter(c => c.role !== 'Viewer').map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleExportPackage(c)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#0d0d1f] hover:bg-[#2d2b5b] border border-[#2d2b5b] rounded-lg text-sm text-gray-300 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="flex-1">Export for {c.name}</span>
                        <Download size={12} className="text-gray-600" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-600 text-xs">
                    Add collaborators first to export personalized packages.
                  </div>
                )}
              </div>

              {/* Import changes */}
              <div className="bg-[#1a1a2e] border border-[#2d2b5b] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Upload size={14} className="text-emerald-400" />
                  <span className="text-white text-sm font-medium">Import Collaborator Changes</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">
                  Import a .filmcraft package from a collaborator to merge their edits.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".filmcraft,.json"
                  className="hidden"
                  onChange={handleImport}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#0d0d1f] hover:bg-[#2d2b5b] border border-dashed border-[#2d2b5b] hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 text-sm rounded-lg transition-colors"
                >
                  <Upload size={13} /> Choose .filmcraft file
                </button>

                {importStatus && (
                  <p className={`mt-2 text-xs px-3 py-2 rounded-lg ${
                    importStatus.startsWith('Error') ? 'bg-red-500/10 text-red-400' :
                    importStatus.startsWith('Imported') ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1e1b4b] flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-gray-600">
            {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1a1a2e] hover:bg-[#2d2b5b] text-gray-400 text-sm rounded-lg border border-[#2d2b5b] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
