import React from 'react';
import {
  LayoutDashboard, FileText, List, Calendar, Camera, Phone,
  Users, MapPin, BarChart2, ChevronLeft, ChevronRight,
  Film, Plus, Folder, MessageSquare
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { AppView } from '../../types';

const navItems: { view: AppView; label: string; icon: React.ReactNode; description: string }[] = [
  { view: 'dashboard',   label: 'Dashboard',     icon: <LayoutDashboard size={18} />, description: 'Project overview' },
  { view: 'screenplay',  label: 'Screenplay',    icon: <FileText size={18} />,        description: 'Write & format script' },
  { view: 'breakdown',   label: 'Breakdown',     icon: <List size={18} />,            description: 'Scene element tagging' },
  { view: 'schedule',    label: 'Schedule',      icon: <Calendar size={18} />,        description: 'Strip board & days' },
  { view: 'shotlist',    label: 'Shot List',     icon: <Camera size={18} />,          description: 'Shots per scene' },
  { view: 'callsheet',   label: 'Call Sheets',   icon: <Phone size={18} />,           description: 'Daily call sheets' },
  { view: 'characters',  label: 'Characters',    icon: <Users size={18} />,           description: 'Cast & roles' },
  { view: 'locations',   label: 'Locations',     icon: <MapPin size={18} />,          description: 'Locations & permits' },
  { view: 'reports',     label: 'Reports',       icon: <BarChart2 size={18} />,       description: 'Export & analytics' },
  { view: 'chat',        label: 'Chat',          icon: <MessageSquare size={18} />,   description: 'Team messaging' },
];

export default function Sidebar() {
  const { activeView, setView, sidebarCollapsed, toggleSidebar, projects, activeProjectId, setActiveProject, createProject, activeProject } = useStore();
  const project = activeProject();

  return (
    <aside className={`flex flex-col bg-[#0d0d1f] border-r border-[#1e1b4b] transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
      {/* Brand */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-[#1e1b4b]">
        <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Film size={16} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="text-white font-bold text-sm leading-tight">FilmCraft Pro</div>
              <div className="text-[#6366f1] text-[10px] font-medium tracking-wide">FILMMAKER SUITE</div>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Project Selector */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2 border-b border-[#1e1b4b]">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Folder size={10} /> Project
          </div>
          <div className="flex items-center gap-1">
            <select
              value={activeProjectId}
              onChange={e => setActiveProject(e.target.value)}
              className="flex-1 bg-[#1a1a2e] text-white text-xs rounded px-2 py-1.5 border border-[#2d2b5b] focus:outline-none focus:border-indigo-500 truncate"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const name = window.prompt('New project name:');
                if (name?.trim()) createProject(name.trim());
              }}
              className="p-1.5 bg-[#1a1a2e] hover:bg-[#2d2b5b] rounded border border-[#2d2b5b] text-gray-400 hover:text-white transition-colors"
              title="New project"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="mt-1 text-[10px] text-[#6366f1] truncate">{project.genre} · {project.format}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(item => {
          const active = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 group relative
                ${active
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border-r-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${active ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <div>
                  <div className={`text-sm font-medium leading-tight ${active ? 'text-white' : ''}`}>{item.label}</div>
                  <div className="text-[10px] text-gray-600">{item.description}</div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 border border-gray-700">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse btn (collapsed state) */}
      {sidebarCollapsed && (
        <div className="py-2 flex justify-center border-t border-[#1e1b4b]">
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-300 p-2">
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-[#1e1b4b]">
          <div className="text-[10px] text-gray-600 text-center">FilmCraft Pro v1.0</div>
          <div className="text-[10px] text-gray-700 text-center">Professional Filmmaker Suite</div>
        </div>
      )}
    </aside>
  );
}
