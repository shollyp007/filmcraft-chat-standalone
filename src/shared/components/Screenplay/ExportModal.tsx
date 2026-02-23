import { X, FileText, Download, Printer, FileJson } from 'lucide-react';
import type { Script, Project } from '../../types';
import {
  exportToFountain,
  exportToFDX,
  exportProjectJSON,
  printScript,
  downloadFile,
  sanitizeFilename,
} from '../../utils/exportUtils';

interface Props {
  project: Project;
  onClose: () => void;
}

export default function ExportModal({ project, onClose }: Props) {
  const { script } = project;
  const filename = sanitizeFilename(script.title || 'screenplay');

  function handleFountain() {
    const content = exportToFountain(script);
    downloadFile(content, `${filename}.fountain`, 'text/plain;charset=utf-8');
    onClose();
  }

  function handleFDX() {
    const content = exportToFDX(script);
    downloadFile(content, `${filename}.fdx`, 'application/xml;charset=utf-8');
    onClose();
  }

  function handlePDF() {
    printScript(script);
    onClose();
  }

  function handleJSON() {
    const content = exportProjectJSON(project);
    downloadFile(content, `${filename}-backup.json`, 'application/json;charset=utf-8');
    onClose();
  }

  const options = [
    {
      icon: <Printer size={22} className="text-indigo-400" />,
      label: 'PDF / Print',
      description: 'Opens the browser print dialog. Save as PDF for a print-ready screenplay.',
      action: handlePDF,
      badge: 'Recommended',
    },
    {
      icon: <FileText size={22} className="text-emerald-400" />,
      label: 'Fountain (.fountain)',
      description: 'Open plain-text format compatible with Highland, Fade In, Writer Duet, and more.',
      action: handleFountain,
      badge: null,
    },
    {
      icon: <Download size={22} className="text-blue-400" />,
      label: 'Final Draft (.fdx)',
      description: 'Industry-standard Final Draft XML format for import into Final Draft.',
      action: handleFDX,
      badge: null,
    },
    {
      icon: <FileJson size={22} className="text-amber-400" />,
      label: 'JSON Backup',
      description: 'Full project backup including characters, locations, and production data.',
      action: handleJSON,
      badge: null,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#13132a] border border-[#2d2b5b] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1b4b]">
          <div>
            <h2 className="text-white font-semibold text-base">Export Screenplay</h2>
            <p className="text-gray-500 text-xs mt-0.5">{script.title || 'Untitled'} · {script.pageCount} pages</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 flex flex-col gap-2">
          {options.map(opt => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="flex items-start gap-4 p-4 rounded-xl bg-[#1a1a2e] hover:bg-[#2d2b5b] border border-[#2d2b5b] hover:border-indigo-500/40 transition-all text-left group"
            >
              <div className="flex-shrink-0 mt-0.5">{opt.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{opt.label}</span>
                  {opt.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-600/30 text-indigo-300 rounded-full font-medium">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{opt.description}</p>
              </div>
              <Download size={14} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-1 transition-colors" />
            </button>
          ))}
        </div>

        <div className="px-5 pb-4 text-[11px] text-gray-600 text-center">
          Script auto-saves continuously. Export captures the current state.
        </div>
      </div>
    </div>
  );
}
