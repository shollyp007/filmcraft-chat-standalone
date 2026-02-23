import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ChevronDown, Plus, Type, List, ZoomIn, ZoomOut, Check,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { ElementType, ScriptElement } from '../../types';
import { v4 as uuid } from '../../utils/uuid';
import SceneNavigator from './SceneNavigator';
import ExportModal from './ExportModal';
import CollaborationModal from './CollaborationModal';

// ─── Element Cycle Order ───────────────────────────────────────
const ELEMENT_CYCLE: ElementType[] = [
  'action', 'scene-heading', 'character', 'dialogue',
  'parenthetical', 'transition', 'shot', 'centered',
];

const ELEMENT_LABELS: Record<ElementType, string> = {
  'scene-heading':  'Scene Heading',
  'action':         'Action',
  'character':      'Character',
  'parenthetical':  'Parenthetical',
  'dialogue':       'Dialogue',
  'transition':     'Transition',
  'shot':           'Shot',
  'centered':       'Centered',
  'note':           'Note',
};

const NEXT_ELEMENT: Record<ElementType, ElementType> = {
  'scene-heading':  'action',
  'action':         'action',
  'character':      'dialogue',
  'parenthetical':  'dialogue',
  'dialogue':       'character',
  'transition':     'scene-heading',
  'shot':           'action',
  'centered':       'action',
  'note':           'action',
};

function getElementStyle(type: ElementType): React.CSSProperties {
  switch (type) {
    case 'scene-heading':
      return { fontWeight: 700, textTransform: 'uppercase', borderTop: '1px solid #ccc', paddingTop: 8, marginTop: 16 };
    case 'action':
      return { paddingTop: 4, paddingBottom: 4 };
    case 'character':
      return { textTransform: 'uppercase', paddingLeft: '2.2in', paddingTop: 8 };
    case 'parenthetical':
      return { paddingLeft: '1.7in', paddingRight: '2.4in', fontStyle: 'italic', color: '#333' };
    case 'dialogue':
      return { paddingLeft: '1.1in', paddingRight: '1.5in' };
    case 'transition':
      return { textTransform: 'uppercase', textAlign: 'right', fontWeight: 700, paddingTop: 4, paddingBottom: 4 };
    case 'shot':
      return { textTransform: 'uppercase', fontWeight: 700, textDecoration: 'underline', paddingTop: 4 };
    case 'centered':
      return { textAlign: 'center', fontWeight: 700, textTransform: 'uppercase' };
    case 'note':
      return { color: '#888', fontStyle: 'italic', backgroundColor: '#fffbcc', padding: '4px 8px', borderLeft: '3px solid #f59e0b' };
    default:
      return {};
  }
}

function getElementClass(_type: ElementType, selected: boolean): string {
  let base = 'relative w-full outline-none font-courier text-base leading-relaxed resize-none overflow-hidden ';
  if (selected) base += 'ring-1 ring-inset ring-indigo-300/30 bg-indigo-50/30 rounded ';
  return base;
}

// ─── Improved Page Break Algorithm ────────────────────────────
// Standard screenplay: ~56 lines per page
// Dialogue column: ~32 chars wide; Action column: ~58 chars wide

function countElementLines(el: ScriptElement): number {
  const content = el.content || '';
  switch (el.type) {
    case 'scene-heading':
      // Heading text + 2 blank lines (top border / spacing) + 1 for action below
      return Math.max(1, Math.ceil(content.length / 58)) + 3;
    case 'action':
      return Math.max(1, Math.ceil(content.length / 58)) + 1;
    case 'character':
      // Character name — narrow centered, 1 line, no trailing blank (dialogue follows)
      return 1;
    case 'parenthetical':
      return Math.max(1, Math.ceil(content.length / 32));
    case 'dialogue':
      // Dialogue column + 1 blank line after speaker group
      return Math.max(1, Math.ceil(content.length / 32)) + 1;
    case 'transition':
      return 2;
    case 'shot':
      return 2;
    case 'centered':
      return 2;
    case 'note':
      return Math.max(1, Math.ceil(content.length / 58)) + 1;
    default:
      return 2;
  }
}

// Returns a Map<elementIndex, pageNumber> for every element that should have
// a page break marker BEFORE it.
function computePageBreaks(elements: ScriptElement[]): Map<number, number> {
  const breaks = new Map<number, number>();
  const PAGE_LINES = 56;
  // Seed with a few lines for the title block + FADE IN:
  let lines = 8;
  let page = 1;

  for (let i = 0; i < elements.length; i++) {
    const elLines = countElementLines(elements[i]);
    if (lines + elLines > PAGE_LINES) {
      page++;
      breaks.set(i, page);
      lines = elLines;
    } else {
      lines += elLines;
    }
  }
  return breaks;
}

// Auto-resize textarea
function AutoTextarea({ value, onChange, onKeyDown, style, className, placeholder, readOnly }: {
  value: string;
  onChange?: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      readOnly={readOnly}
      onChange={e => onChange?.(e.target.value)}
      onKeyDown={onKeyDown}
      style={{ ...style, minHeight: 24 }}
      className={`${className} bg-transparent border-none outline-none font-courier text-base leading-relaxed resize-none overflow-hidden w-full`}
      placeholder={placeholder}
      rows={1}
    />
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function ScreenplayEditor() {
  const { activeProject, updateElements, updateScriptMeta } = useStore();
  const project = activeProject();
  const { script } = project;

  const [elements, setElements] = useState<ScriptElement[]>(
    script.elements.length > 0 ? script.elements : [
      { id: uuid(), type: 'scene-heading', content: 'INT. LOCATION - DAY' },
      { id: uuid(), type: 'action', content: '' },
    ]
  );
  const [selectedId, setSelectedId] = useState<string | null>(elements[0]?.id ?? null);
  const [showNavigator, setShowNavigator] = useState(true);
  const [showTypeMenu, setShowTypeMenu] = useState<string | null>(null);
  const [zoom, setZoom] = useState(90);
  const [editingMeta, setEditingMeta] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Sync from store on project change
  useEffect(() => {
    if (script.elements.length > 0) {
      setElements(script.elements);
    }
  }, [script.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced auto-save ────────────────────────────────────
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const save = useCallback((els: ScriptElement[]) => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => updateElements(els), 800);
  }, [updateElements]);

  // ── Listen for header button events ───────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const action = (e as CustomEvent<string>).detail;
      if (action === 'save') {
        clearTimeout(saveTimeout.current);
        updateElements(elements);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
      } else if (action === 'export') {
        setShowExportModal(true);
      } else if (action === 'share') {
        setShowShareModal(true);
      }
    };
    window.addEventListener('screenplay:action', handler);
    return () => window.removeEventListener('screenplay:action', handler);
  }, [elements, updateElements]);

  // ── Element mutations ──────────────────────────────────────
  const updateEl = useCallback((id: string, content: string) => {
    setElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, content } : el);
      save(next);
      return next;
    });
  }, [save]);

  const updateSceneNumber = useCallback((id: string, sceneNumber: string) => {
    setElements(prev => {
      const next = prev.map(el =>
        el.id === id ? { ...el, sceneNumber: sceneNumber.trim() || undefined } : el
      );
      save(next);
      return next;
    });
  }, [save]);

  const changeType = useCallback((id: string, type: ElementType) => {
    setElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, type } : el);
      save(next);
      return next;
    });
    setShowTypeMenu(null);
  }, [save]);

  const insertAfter = useCallback((afterId: string, type: ElementType = 'action') => {
    const newEl: ScriptElement = { id: uuid(), type, content: '' };
    setElements(prev => {
      const idx = prev.findIndex(e => e.id === afterId);
      const next = [...prev.slice(0, idx + 1), newEl, ...prev.slice(idx + 1)];
      save(next);
      return next;
    });
    setTimeout(() => setSelectedId(newEl.id), 0);
  }, [save]);

  const deleteEl = useCallback((id: string) => {
    setElements(prev => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex(e => e.id === id);
      const next = prev.filter(e => e.id !== id);
      save(next);
      const newIdx = Math.min(idx, next.length - 1);
      setSelectedId(next[newIdx]?.id ?? null);
      return next;
    });
  }, [save]);

  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    el: ScriptElement,
    idx: number
  ) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const current = ELEMENT_CYCLE.indexOf(el.type);
      const next = ELEMENT_CYCLE[(current + 1) % ELEMENT_CYCLE.length];
      changeType(el.id, next);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const nextType = NEXT_ELEMENT[el.type] ?? 'action';
      insertAfter(el.id, nextType);
      return;
    }
    if (e.key === 'Backspace' && el.content === '' && elements.length > 1) {
      e.preventDefault();
      const prevEl = elements[idx - 1];
      if (prevEl) {
        setSelectedId(prevEl.id);
        deleteEl(el.id);
      }
      return;
    }
    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      setSelectedId(elements[idx - 1].id);
    }
    if (e.key === 'ArrowDown' && idx < elements.length - 1) {
      e.preventDefault();
      setSelectedId(elements[idx + 1].id);
    }
  }, [elements, changeType, insertAfter, deleteEl]);

  // ── Derived data ───────────────────────────────────────────
  const pageBreaks = useMemo(() => computePageBreaks(elements), [elements]);

  // Auto-number scenes, respecting custom overrides
  const sceneNumMap = useMemo(() => {
    const map = new Map<string, string>();
    let count = 0;
    elements.forEach(el => {
      if (el.type === 'scene-heading') {
        count++;
        map.set(el.id, el.sceneNumber ?? String(count));
      }
    });
    return map;
  }, [elements]);

  const totalPages = pageBreaks.size + 1;
  const selectedEl = elements.find(e => e.id === selectedId);

  // Scroll selected into view
  const elRefs = useRef<Record<string, HTMLDivElement>>({});
  useEffect(() => {
    if (selectedId && elRefs.current[selectedId]) {
      elRefs.current[selectedId].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedId]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Scene Navigator */}
      {showNavigator && (
        <SceneNavigator
          elements={elements}
          selectedId={selectedId}
          onSelect={id => setSelectedId(id)}
        />
      )}

      {/* Editor Column */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#1a1a2e]">

        {/* Toolbar */}
        <div className="screenplay-toolbar flex items-center gap-2 px-4 py-2 bg-[#13132a] border-b border-[#1e1b4b] flex-shrink-0 flex-wrap">
          {/* Navigator toggle */}
          <button
            onClick={() => setShowNavigator(!showNavigator)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${showNavigator ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
          >
            <List size={13} /> Navigator
          </button>

          <div className="h-4 w-px bg-gray-700" />

          {/* Element type selector */}
          {selectedEl && (
            <div className="relative">
              <button
                onClick={() => setShowTypeMenu(showTypeMenu ? null : selectedEl.id)}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1a2e] hover:bg-[#2d2b5b] text-white text-xs rounded border border-[#2d2b5b] transition-colors"
              >
                <Type size={12} className="text-indigo-400" />
                {ELEMENT_LABELS[selectedEl.type]}
                <ChevronDown size={11} className="text-gray-500" />
              </button>
              {showTypeMenu === selectedEl.id && (
                <div className="absolute top-full left-0 mt-1 bg-[#13132a] border border-[#2d2b5b] rounded-lg shadow-xl z-50 min-w-40 py-1">
                  {ELEMENT_CYCLE.map(type => (
                    <button
                      key={type}
                      onClick={() => changeType(selectedEl.id, type)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2d2b5b] transition-colors ${selectedEl.type === type ? 'text-indigo-400 font-semibold' : 'text-gray-300'}`}
                    >
                      {ELEMENT_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="h-4 w-px bg-gray-700" />

          {/* Quick type buttons */}
          {[
            { type: 'scene-heading' as ElementType, label: 'SH', title: 'Scene Heading' },
            { type: 'action' as ElementType, label: 'A', title: 'Action' },
            { type: 'character' as ElementType, label: 'C', title: 'Character' },
            { type: 'dialogue' as ElementType, label: 'D', title: 'Dialogue' },
            { type: 'parenthetical' as ElementType, label: 'P', title: 'Parenthetical' },
            { type: 'transition' as ElementType, label: 'T', title: 'Transition' },
          ].map(btn => (
            <button
              key={btn.type}
              onClick={() => selectedEl && changeType(selectedEl.id, btn.type)}
              title={btn.title}
              className={`w-7 h-6 text-[10px] font-bold rounded transition-colors ${selectedEl?.type === btn.type ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#2d2b5b]'}`}
            >
              {btn.label}
            </button>
          ))}

          <div className="flex-1" />

          {/* Saved toast */}
          {savedToast && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 animate-pulse">
              <Check size={12} /> Saved
            </span>
          )}

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 text-gray-500 hover:text-gray-300">
              <ZoomOut size={13} />
            </button>
            <span className="text-gray-500 text-xs w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1 text-gray-500 hover:text-gray-300">
              <ZoomIn size={13} />
            </button>
          </div>

          <button
            onClick={() => insertAfter(selectedId ?? elements[elements.length - 1]?.id, 'action')}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="keyboard-hints flex items-center gap-4 px-4 py-1.5 bg-[#0f0f1a] border-b border-[#1e1b4b] text-[10px] text-gray-600">
          <span><kbd className="bg-gray-800 text-gray-400 px-1 rounded text-[9px]">Tab</kbd> cycle type</span>
          <span><kbd className="bg-gray-800 text-gray-400 px-1 rounded text-[9px]">Enter</kbd> new element</span>
          <span><kbd className="bg-gray-800 text-gray-400 px-1 rounded text-[9px]">↑↓</kbd> navigate</span>
          <span><kbd className="bg-gray-800 text-gray-400 px-1 rounded text-[9px]">Backspace</kbd> on empty = delete</span>
          <div className="flex-1" />
          <span className="text-gray-700">
            {totalPages} pages · {elements.length} elements · {script.scenes.length} scenes
          </span>
        </div>

        {/* Script page area */}
        <div className="flex-1 overflow-y-auto bg-gray-300 py-8 px-4" onClick={() => setShowTypeMenu(null)}>

          {/* Title Page (editing) */}
          {editingMeta ? (
            <div className="screenplay-page mb-4 max-w-none" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
              <div className="text-center mb-8 pt-16 pb-16 border-b border-gray-200">
                <input
                  className="text-center font-courier font-bold text-2xl w-full uppercase bg-transparent outline-none border-b border-gray-300 mb-2"
                  value={script.title}
                  onChange={e => updateScriptMeta({ title: e.target.value })}
                  placeholder="SCREENPLAY TITLE"
                />
                <div className="text-sm text-gray-500 mt-1">Written by</div>
                <input
                  className="text-center font-courier text-lg w-full bg-transparent outline-none border-b border-gray-300 mt-1"
                  value={script.author}
                  onChange={e => updateScriptMeta({ author: e.target.value })}
                  placeholder="Author Name"
                />
                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
                  <input className="bg-transparent outline-none border-b border-gray-200 text-center w-32" value={script.draftDate ?? ''} onChange={e => updateScriptMeta({ draftDate: e.target.value })} placeholder="Draft Date" />
                  <input className="bg-transparent outline-none border-b border-gray-200 text-center w-32" value={script.revisionColor ?? ''} onChange={e => updateScriptMeta({ revisionColor: e.target.value })} placeholder="Revision Color" />
                </div>
              </div>
              <button onClick={() => setEditingMeta(false)} className="text-indigo-600 text-sm mt-4">← Back to Script</button>
            </div>
          ) : (
            <div
              className="screenplay-page mb-8 relative"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                marginBottom: zoom < 90 ? `${(zoom - 100) * 5}px` : '2rem',
              }}
            >
              {/* Title Header */}
              <div className="text-center mb-8 pb-4 border-b border-gray-200">
                <div className="text-2xl font-bold uppercase font-courier">{script.title || 'UNTITLED SCREENPLAY'}</div>
                <div className="text-sm font-courier mt-1">Written by</div>
                <div className="font-courier text-base">{script.author || 'Author Name'}</div>
                {script.draftDate && (
                  <div className="text-xs text-gray-500 mt-1">{script.draftDate} · {script.revisionColor} Draft</div>
                )}
                <button onClick={() => setEditingMeta(true)} className="mt-2 text-xs text-indigo-500 hover:text-indigo-600">
                  Edit title page
                </button>
              </div>

              {/* FADE IN: */}
              <div className="font-courier font-bold uppercase mb-2">FADE IN:</div>

              {/* Elements */}
              {elements.map((el, idx) => {
                const isSelected = el.id === selectedId;
                const pageNum = pageBreaks.get(idx);
                const sceneNum = el.type === 'scene-heading' ? sceneNumMap.get(el.id) : undefined;

                return (
                  <React.Fragment key={el.id}>
                    {/* Page break marker */}
                    {pageNum !== undefined && (
                      <div className="page-break-marker" data-page={`— ${pageNum} —`} />
                    )}

                    <div
                      ref={r => { if (r) elRefs.current[el.id] = r; }}
                      className={`screenplay-line-wrapper relative group ${isSelected ? 'is-selected' : ''}`}
                      onClick={e => { e.stopPropagation(); setSelectedId(el.id); }}
                    >
                      {/* Type badge (shown on hover/focus) */}
                      <span className="el-type-badge">{ELEMENT_LABELS[el.type]}</span>

                      {/* ── Scene number inputs (left + right margins) ── */}
                      {el.type === 'scene-heading' && (
                        <>
                          {/* Left margin — editable */}
                          <input
                            type="text"
                            value={el.sceneNumber ?? (sceneNum ?? '')}
                            onChange={e => updateSceneNumber(el.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            title="Scene number (click to edit)"
                            placeholder={sceneNum}
                            className="scene-number-left font-courier font-bold text-xs bg-transparent border-none outline-none text-gray-500 hover:text-gray-800 focus:text-gray-900 text-right"
                          />
                          {/* Right margin — read-only mirror */}
                          <span className="scene-number-right font-courier font-bold text-xs text-gray-500">
                            {sceneNum}
                          </span>
                        </>
                      )}

                      <AutoTextarea
                        value={el.content}
                        onChange={v => updateEl(el.id, v)}
                        onKeyDown={e => handleKeyDown(e, el, idx)}
                        style={getElementStyle(el.type)}
                        className={getElementClass(el.type, isSelected)}
                        placeholder={getPlaceholder(el.type)}
                      />
                    </div>
                  </React.Fragment>
                );
              })}

              {/* FADE OUT */}
              <div className="font-courier font-bold uppercase text-right mt-4">FADE OUT.</div>
              <div className="font-courier uppercase text-center mt-4 font-bold">THE END</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showExportModal && (
        <ExportModal project={project} onClose={() => setShowExportModal(false)} />
      )}
      {showShareModal && (
        <CollaborationModal project={project} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}

function getPlaceholder(type: ElementType): string {
  switch (type) {
    case 'scene-heading':  return 'INT./EXT. LOCATION - DAY/NIGHT';
    case 'action':         return 'Action description...';
    case 'character':      return 'CHARACTER NAME';
    case 'parenthetical':  return '(action)';
    case 'dialogue':       return 'Dialogue...';
    case 'transition':     return 'CUT TO:';
    case 'shot':           return 'ANGLE ON:';
    case 'centered':       return 'CENTERED TEXT';
    case 'note':           return 'Note...';
    default:               return '';
  }
}
