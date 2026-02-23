import React, { useState } from 'react';
import { Film, Plus } from 'lucide-react';
import Chat from '@shared/components/Chat/Chat';
import { useStore } from '@shared/store/useStore';

// ── Project setup screen (shown when no projects exist or user wants a new one) ──
function ProjectSetup() {
  const { createProject, projects, setActiveProject } = useStore();
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    createProject(name.trim());
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] border border-[#2d2b5b] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Film size={22} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-xl">FilmCraft Chat</div>
            <div className="text-gray-400 text-sm">Team communication for productions</div>
          </div>
        </div>

        {projects.length > 0 && (
          <>
            <p className="text-gray-400 text-sm mb-3">Continue with an existing production:</p>
            <div className="space-y-2 mb-5">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveProject(p.id)}
                  className="w-full flex items-center gap-3 p-3 bg-[#0d0d1f] hover:bg-[#2d2b5b] border border-[#2d2b5b] rounded-xl text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center flex-shrink-0">
                    <Film size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{p.name}</div>
                    <div className="text-gray-500 text-xs">{p.format ?? 'Feature'} · {p.crew.length} crew</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#2d2b5b]" />
              <span className="text-gray-600 text-xs">or start new</span>
              <div className="flex-1 h-px bg-[#2d2b5b]" />
            </div>
          </>
        )}

        <p className="text-gray-400 text-sm mb-3">
          {projects.length === 0 ? 'Create your first production to get started.' : 'Start a new production:'}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Production name (e.g. Neon Shadows)"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="flex-1 bg-[#0d0d1f] border border-[#2d2b5b] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-600"
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <Plus size={14} />
            Create
          </button>
        </div>
        <p className="text-[11px] text-gray-600 mt-3 text-center">
          Add crew members via FilmCraft Pro · or enter manually when joining chat
        </p>
      </div>
    </div>
  );
}

// ── Root app ──────────────────────────────────────────────────
export default function App() {
  const { projects, activeProjectId } = useStore();
  const hasActiveProject = projects.some(p => p.id === activeProjectId);

  if (!hasActiveProject && projects.length === 0) {
    return <ProjectSetup />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f0f1a]">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#1e1b4b] bg-[#0d0d1f] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Film size={13} className="text-white" />
          </div>
          <span className="text-white text-sm font-semibold">FilmCraft Chat</span>
          <span className="text-gray-600 text-xs">· standalone</span>
        </div>
        <ProjectSetupTrigger />
      </header>

      {/* Chat fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </div>
  );
}

function ProjectSetupTrigger() {
  const { projects, activeProjectId, setActiveProject, createProject } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        <Film size={12} />
        {activeProject?.name ?? 'No project'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#1a1a2e] border border-[#2d2b5b] rounded-xl p-3 w-64 shadow-2xl z-50">
          <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => { setActiveProject(p.id); setOpen(false); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors
                  ${p.id === activeProjectId ? 'bg-indigo-600/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 border-t border-[#2d2b5b] pt-2">
            <input
              type="text"
              placeholder="New production..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) {
                  createProject(name.trim());
                  setName('');
                  setOpen(false);
                }
              }}
              className="flex-1 bg-[#0d0d1f] border border-[#2d2b5b] text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-600"
            />
            <button
              onClick={() => {
                if (name.trim()) {
                  createProject(name.trim());
                  setName('');
                  setOpen(false);
                }
              }}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
