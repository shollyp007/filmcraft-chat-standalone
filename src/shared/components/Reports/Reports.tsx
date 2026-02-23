import React, { useState } from 'react';
import { Download, BarChart2, PieChart, FileText, Users, MapPin, Camera, Calendar, Film, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { BREAKDOWN_COLORS, type BreakdownCategory } from '../../types';

function StatRow({ label, value, bar, color }: { label: string; value: string | number; bar?: number; color?: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#1e1b4b]">
      <div className="flex-1 text-gray-400 text-xs">{label}</div>
      {bar !== undefined && (
        <div className="w-32 h-1.5 bg-[#0d0d1f] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${bar}%`, backgroundColor: color ?? '#6366f1' }} />
        </div>
      )}
      <div className="text-white text-xs font-semibold w-12 text-right">{value}</div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[#13132a] border border-[#1e1b4b] rounded-xl p-4 mb-4">
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <span className="text-indigo-400">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

export default function Reports() {
  const { activeProject } = useStore();
  const project = activeProject();
  const { script, characters, locations, productionDays, shots, breakdownItems, crew, callSheets } = project;

  const totalScenes = script.scenes.length;
  const totalPages = script.pageCount;
  const totalElements = script.elements.length;

  const principals = characters.filter(c => c.type === 'Principal').length;
  const supporting = characters.filter(c => c.type === 'Supporting').length;
  const withActor = characters.filter(c => c.actor).length;

  const totalShots = shots.length;
  const completedShots = shots.filter(s => s.checked).length;
  const shotPct = totalShots > 0 ? Math.round((completedShots / totalShots) * 100) : 0;

  const scheduledScenes = new Set(productionDays.flatMap(d => d.scenes.map(s => s.sceneId)));
  const schedulePct = totalScenes > 0 ? Math.round((scheduledScenes.size / totalScenes) * 100) : 0;

  const intScenes = script.scenes.filter(s => s.interior === 'INT.').length;
  const extScenes = script.scenes.filter(s => s.interior === 'EXT.').length;
  const dayScenes = script.scenes.filter(s => s.timeOfDay?.toUpperCase().includes('DAY')).length;
  const nightScenes = script.scenes.filter(s => s.timeOfDay?.toUpperCase().includes('NIGHT')).length;

  const categoryTotals = Object.keys(BREAKDOWN_COLORS).reduce((acc, cat) => {
    acc[cat as BreakdownCategory] = breakdownItems.filter(i => i.category === cat as BreakdownCategory).length;
    return acc;
  }, {} as Record<BreakdownCategory, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0)
    .slice(0, 6);

  const depts = [...new Set(crew.map(c => c.department))];

  const exportScript = () => {
    const lines: string[] = [
      script.title.toUpperCase(),
      `Written by ${script.author}`,
      `${script.draftDate} — ${script.revisionColor} Draft`,
      '',
      'FADE IN:',
      '',
    ];
    script.elements.forEach(el => {
      switch (el.type) {
        case 'scene-heading':
          lines.push(''); lines.push(el.content.toUpperCase()); lines.push('');
          break;
        case 'action':
          lines.push(el.content); lines.push('');
          break;
        case 'character':
          lines.push(`                    ${el.content.toUpperCase()}`);
          break;
        case 'parenthetical':
          lines.push(`                  ${el.content}`);
          break;
        case 'dialogue':
          lines.push(`          ${el.content}`);
          lines.push('');
          break;
        case 'transition':
          lines.push(`                                        ${el.content.toUpperCase()}`);
          lines.push('');
          break;
        default:
          lines.push(el.content);
      }
    });
    lines.push('', 'FADE OUT.', '', 'THE END');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_')}_screenplay.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBreakdown = () => {
    const rows: string[] = [
      `SCRIPT BREAKDOWN — ${script.title}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      'Scene #,Scene Heading,Category,Element,Quantity,Notes',
    ];
    script.scenes.forEach(scene => {
      const items = breakdownItems.filter(i => i.sceneId === scene.id);
      if (items.length === 0) {
        rows.push(`${scene.number},"${scene.heading}",,,,`);
      } else {
        items.forEach(item => {
          rows.push(`${scene.number},"${scene.heading}","${BREAKDOWN_COLORS[item.category].label}","${item.name}",${item.quantity ?? 1},"${item.notes ?? ''}"`);
        });
      }
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_')}_breakdown.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportShotList = () => {
    const rows: string[] = [
      `SHOT LIST — ${script.title}`,
      '',
      'Scene,Shot #,Description,Size,Angle,Movement,Lens,Notes,Status',
    ];
    script.scenes.forEach(scene => {
      const sceneShots = shots.filter(s => s.sceneId === scene.id);
      sceneShots.forEach(shot => {
        rows.push(`"${scene.heading}","${shot.shotNumber}","${shot.description}","${shot.size}","${shot.angle}","${shot.movement}","${shot.lens ?? ''}","${shot.notes ?? ''}","${shot.checked ? 'Done' : 'Pending'}"`);
      });
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_')}_shotlist.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold">Reports & Export</h2>
          <p className="text-gray-500 text-xs mt-0.5">Analytics, stats, and data export</p>
        </div>
      </div>

      {/* Export buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button onClick={exportScript} className="flex items-center gap-2 p-4 bg-[#13132a] border border-[#1e1b4b] hover:border-indigo-500/40 rounded-xl transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            <FileText size={16} className="text-indigo-400" />
          </div>
          <div className="text-left">
            <div className="text-white text-xs font-medium">Export Script</div>
            <div className="text-gray-600 text-[10px]">.txt format</div>
          </div>
          <Download size={12} className="ml-auto text-gray-600 group-hover:text-indigo-400" />
        </button>
        <button onClick={exportBreakdown} className="flex items-center gap-2 p-4 bg-[#13132a] border border-[#1e1b4b] hover:border-indigo-500/40 rounded-xl transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <BarChart2 size={16} className="text-blue-400" />
          </div>
          <div className="text-left">
            <div className="text-white text-xs font-medium">Breakdown CSV</div>
            <div className="text-gray-600 text-[10px]">All elements</div>
          </div>
          <Download size={12} className="ml-auto text-gray-600 group-hover:text-blue-400" />
        </button>
        <button onClick={exportShotList} className="flex items-center gap-2 p-4 bg-[#13132a] border border-[#1e1b4b] hover:border-indigo-500/40 rounded-xl transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Camera size={16} className="text-amber-400" />
          </div>
          <div className="text-left">
            <div className="text-white text-xs font-medium">Shot List CSV</div>
            <div className="text-gray-600 text-[10px]">All shots</div>
          </div>
          <Download size={12} className="ml-auto text-gray-600 group-hover:text-amber-400" />
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 p-4 bg-[#13132a] border border-[#1e1b4b] hover:border-indigo-500/40 rounded-xl transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Film size={16} className="text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="text-white text-xs font-medium">Print Report</div>
            <div className="text-gray-600 text-[10px]">Full PDF</div>
          </div>
          <Download size={12} className="ml-auto text-gray-600 group-hover:text-emerald-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Script Analysis */}
        <Section title="Script Analysis" icon={<FileText size={14} />}>
          <StatRow label="Total Pages" value={totalPages} bar={(totalPages / 120) * 100} color="#6366f1" />
          <StatRow label="Total Scenes" value={totalScenes} />
          <StatRow label="INT. Scenes" value={intScenes} bar={totalScenes > 0 ? (intScenes / totalScenes) * 100 : 0} color="#3b82f6" />
          <StatRow label="EXT. Scenes" value={extScenes} bar={totalScenes > 0 ? (extScenes / totalScenes) * 100 : 0} color="#10b981" />
          <StatRow label="Day Scenes" value={dayScenes} bar={totalScenes > 0 ? (dayScenes / totalScenes) * 100 : 0} color="#f59e0b" />
          <StatRow label="Night Scenes" value={nightScenes} bar={totalScenes > 0 ? (nightScenes / totalScenes) * 100 : 0} color="#8b5cf6" />
          <StatRow label="Script Elements" value={totalElements} />
        </Section>

        {/* Production Progress */}
        <Section title="Production Progress" icon={<Calendar size={14} />}>
          <StatRow label="Shoot Days Planned" value={productionDays.length} />
          <StatRow label="Scenes Scheduled" value={`${scheduledScenes.size}/${totalScenes}`} bar={schedulePct} color="#6366f1" />
          <StatRow label="Total Shots Planned" value={totalShots} />
          <StatRow label="Shots Completed" value={`${completedShots}/${totalShots}`} bar={shotPct} color="#10b981" />
          <StatRow label="Call Sheets Generated" value={callSheets.length} />
          <StatRow label="Breakdown Items Tagged" value={breakdownItems.length} />
        </Section>

        {/* Cast Summary */}
        <Section title="Cast Summary" icon={<Users size={14} />}>
          <StatRow label="Total Characters" value={characters.length} />
          <StatRow label="Principal Cast" value={principals} bar={characters.length > 0 ? (principals / characters.length) * 100 : 0} color="#f59e0b" />
          <StatRow label="Supporting Cast" value={supporting} bar={characters.length > 0 ? (supporting / characters.length) * 100 : 0} color="#3b82f6" />
          <StatRow label="Cast with Actor Assigned" value={withActor} bar={characters.length > 0 ? (withActor / characters.length) * 100 : 0} color="#10b981" />
          {characters.map(c => c.type === 'Principal' && (
            <div key={c.id} className="flex items-center gap-2 py-1.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {c.name.charAt(0)}
              </div>
              <span className="text-white font-medium">{c.name}</span>
              {c.actor && <span className="text-gray-500">→ {c.actor}</span>}
            </div>
          ))}
        </Section>

        {/* Breakdown Summary */}
        <Section title="Breakdown Summary" icon={<BarChart2 size={14} />}>
          {topCategories.length === 0 ? (
            <div className="text-gray-600 text-xs">No breakdown items tagged yet.</div>
          ) : (
            topCategories.map(([cat, count]) => {
              const c = BREAKDOWN_COLORS[cat as BreakdownCategory];
              const max = topCategories[0][1];
              return (
                <div key={cat} className="flex items-center gap-3 py-1.5 border-b border-[#1e1b4b]">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.bg, border: `1px solid ${c.text}44` }} />
                  <div className="flex-1 text-gray-400 text-xs">{c.label}</div>
                  <div className="w-24 h-1.5 bg-[#0d0d1f] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: c.text }} />
                  </div>
                  <div className="text-white text-xs font-semibold w-6 text-right">{count}</div>
                </div>
              );
            })
          )}
        </Section>

        {/* Locations */}
        <Section title="Locations" icon={<MapPin size={14} />}>
          <StatRow label="Total Locations" value={locations.length} />
          <StatRow label="INT Locations" value={locations.filter(l => l.type === 'INT').length} bar={locations.length > 0 ? (locations.filter(l => l.type === 'INT').length / locations.length) * 100 : 0} color="#3b82f6" />
          <StatRow label="EXT Locations" value={locations.filter(l => l.type === 'EXT').length} bar={locations.length > 0 ? (locations.filter(l => l.type === 'EXT').length / locations.length) * 100 : 0} color="#10b981" />
          <StatRow label="Permits Approved" value={locations.filter(l => l.permitStatus === 'Approved').length} bar={locations.length > 0 ? (locations.filter(l => l.permitStatus === 'Approved').length / locations.length) * 100 : 0} color="#10b981" />
          <StatRow label="Permits Pending" value={locations.filter(l => l.permitStatus === 'Pending').length} bar={locations.length > 0 ? (locations.filter(l => l.permitStatus === 'Pending').length / locations.length) * 100 : 0} color="#f59e0b" />
        </Section>

        {/* Crew Departments */}
        <Section title="Crew by Department" icon={<Film size={14} />}>
          {depts.length === 0 ? (
            <div className="text-gray-600 text-xs">No crew members added yet.</div>
          ) : (
            depts.map(dept => {
              const deptCrew = crew.filter(c => c.department === dept);
              return (
                <div key={dept} className="mb-2">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-indigo-400 font-semibold">{dept}</span>
                    <span className="text-gray-500">{deptCrew.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {deptCrew.map(m => (
                      <span key={m.id} className="text-[10px] px-2 py-0.5 bg-[#0d0d1f] text-gray-400 rounded border border-[#1e1b4b]">{m.name} — {m.role}</span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </Section>
      </div>
    </div>
  );
}
