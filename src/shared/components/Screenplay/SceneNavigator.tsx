import React, { useMemo } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { ScriptElement, ElementType } from '../../types';

interface Props {
  elements: ScriptElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function SceneNavigator({ elements, selectedId, onSelect }: Props) {
  const scenes = useMemo(() => {
    const result: { id: string; number: number; heading: string; elementCount: number; chars: string[] }[] = [];
    let current: typeof result[0] | null = null;
    let sceneNum = 1;

    elements.forEach(el => {
      if (el.type === 'scene-heading') {
        if (current) result.push(current);
        current = { id: el.id, number: sceneNum++, heading: el.content || '(Untitled Scene)', elementCount: 0, chars: [] };
      } else if (current) {
        current.elementCount++;
        if (el.type === 'character' && el.content && !current.chars.includes(el.content.trim())) {
          current.chars.push(el.content.trim());
        }
      }
    });
    if (current) result.push(current);
    return result;
  }, [elements]);

  const activeScene = useMemo(() => {
    let lastScene = '';
    for (const el of elements) {
      if (el.type === 'scene-heading') lastScene = el.id;
      if (el.id === selectedId) return lastScene;
    }
    return lastScene;
  }, [elements, selectedId]);

  return (
    <div className="w-52 flex-shrink-0 bg-[#0d0d1f] border-r border-[#1e1b4b] flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1e1b4b] flex items-center gap-2">
        <BookOpen size={13} className="text-indigo-400" />
        <span className="text-xs font-medium text-gray-300">Scenes</span>
        <span className="ml-auto text-[10px] text-gray-600">{scenes.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {scenes.length === 0 ? (
          <div className="text-gray-600 text-xs text-center py-6 px-3">
            No scenes yet.<br />Add a scene heading to get started.
          </div>
        ) : (
          scenes.map(scene => (
            <button
              key={scene.id}
              onClick={() => onSelect(scene.id)}
              className={`w-full text-left px-3 py-2 border-b border-[#1e1b4b]/50 group transition-colors ${
                activeScene === scene.id
                  ? 'bg-indigo-600/15 border-l-2 border-l-indigo-400'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-start gap-1.5">
                <span className={`text-[10px] font-bold mt-0.5 flex-shrink-0 ${activeScene === scene.id ? 'text-indigo-400' : 'text-gray-600'}`}>
                  {scene.number}
                </span>
                <div className="min-w-0">
                  <div className={`text-[11px] font-medium leading-tight truncate ${activeScene === scene.id ? 'text-white' : 'text-gray-400'}`}>
                    {scene.heading.length > 35 ? scene.heading.slice(0, 35) + '…' : scene.heading}
                  </div>
                  {scene.chars.length > 0 && (
                    <div className="text-[9px] text-gray-600 truncate mt-0.5">
                      {scene.chars.slice(0, 3).join(', ')}{scene.chars.length > 3 ? '…' : ''}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      <div className="px-3 py-2 border-t border-[#1e1b4b] text-[10px] text-gray-600">
        {elements.length} elements
      </div>
    </div>
  );
}
