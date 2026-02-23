import { Save, Download, Share2, Bell, HelpCircle, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Dashboard',          subtitle: 'Project overview & stats' },
  screenplay: { title: 'Screenplay',         subtitle: 'Professional script editor' },
  breakdown:  { title: 'Script Breakdown',   subtitle: 'Scene element tagging & categorization' },
  schedule:   { title: 'Production Schedule',subtitle: 'Strip board & shooting days' },
  shotlist:   { title: 'Shot List',          subtitle: 'Shot-by-shot production plan' },
  callsheet:  { title: 'Call Sheets',        subtitle: 'Daily production call sheets' },
  characters: { title: 'Characters',         subtitle: 'Cast management & roles' },
  locations:  { title: 'Locations',          subtitle: 'Location management & permits' },
  reports:    { title: 'Reports',            subtitle: 'Analytics & export' },
};

function dispatch(action: 'save' | 'export' | 'share') {
  window.dispatchEvent(new CustomEvent('screenplay:action', { detail: action }));
}

export default function Header() {
  const { activeView, activeProject } = useStore();
  const project = activeProject();
  const info = viewTitles[activeView] ?? { title: activeView, subtitle: '' };
  const isScreenplay = activeView === 'screenplay';

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#0d0d1f] border-b border-[#1e1b4b] flex-shrink-0">
      <div>
        <h1 className="text-white font-semibold text-lg leading-tight">{info.title}</h1>
        <p className="text-gray-500 text-xs">{project.name} · {info.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search project..."
            className="bg-[#1a1a2e] border border-[#2d2b5b] text-gray-300 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-44"
          />
        </div>

        {/* Draft revision badge */}
        {project.script.revisionColor && (
          <span className="text-xs px-2 py-1 rounded font-medium border" style={{
            backgroundColor: project.script.revisionColor === 'White' ? '#f8fafc' : `${project.script.revisionColor}22`,
            color: '#6366f1',
            borderColor: '#4338ca33',
          }}>
            {project.script.revisionColor} Draft
          </span>
        )}

        {/* Action buttons — active only on screenplay view */}
        <button
          onClick={() => isScreenplay && dispatch('save')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            isScreenplay
              ? 'bg-[#1a1a2e] hover:bg-[#2d2b5b] text-gray-400 hover:text-white border-[#2d2b5b]'
              : 'bg-[#1a1a2e] text-gray-600 border-[#2d2b5b] cursor-default opacity-50'
          }`}
          title={isScreenplay ? 'Save now' : 'Open the Screenplay to save'}
        >
          <Save size={13} />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={() => isScreenplay && dispatch('export')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            isScreenplay
              ? 'bg-[#1a1a2e] hover:bg-[#2d2b5b] text-gray-400 hover:text-white border-[#2d2b5b]'
              : 'bg-[#1a1a2e] text-gray-600 border-[#2d2b5b] cursor-default opacity-50'
          }`}
          title={isScreenplay ? 'Export screenplay' : 'Open the Screenplay to export'}
        >
          <Download size={13} />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={() => dispatch('share')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs rounded-lg transition-all shadow-lg shadow-indigo-500/20"
          title="Manage collaborators"
        >
          <Share2 size={13} />
          <span className="hidden sm:inline">Share</span>
          {(project.collaborators?.length ?? 0) > 0 && (
            <span className="ml-0.5 bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
              {project.collaborators.length}
            </span>
          )}
        </button>

        <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
          <Bell size={16} />
        </button>
        <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
}
