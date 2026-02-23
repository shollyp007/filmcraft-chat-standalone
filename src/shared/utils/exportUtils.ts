import type { Script, ScriptElement, Project } from '../types';

// ─── Helpers ──────────────────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeTitle(title: string): string {
  return title.replace(/[^a-zA-Z0-9_\-. ]/g, '').trim().replace(/\s+/g, '_') || 'screenplay';
}

// ─── Fountain Export ──────────────────────────────────────────
// Fountain is the open screenplay plain-text format (fountain.io)

const FOUNTAIN_TYPE_MAP: Record<ScriptElement['type'], 'heading' | 'action' | 'character' | 'parenthetical' | 'dialogue' | 'transition' | 'shot' | 'centered' | 'note'> = {
  'scene-heading': 'heading',
  'action': 'action',
  'character': 'character',
  'parenthetical': 'parenthetical',
  'dialogue': 'dialogue',
  'transition': 'transition',
  'shot': 'shot',
  'centered': 'centered',
  'note': 'note',
};

export function exportToFountain(script: Script): string {
  const lines: string[] = [];

  // Title page
  lines.push(`Title: ${script.title || 'Untitled'}`);
  lines.push(`Author: ${script.author || ''}`);
  if (script.draftDate) lines.push(`Draft date: ${script.draftDate}`);
  if (script.revisionColor) lines.push(`Revision: ${script.revisionColor}`);
  if (script.contact) lines.push(`Contact: ${script.contact}`);
  if (script.copyright) lines.push(`Copyright: ${script.copyright}`);
  lines.push('');
  lines.push('');

  // FADE IN
  lines.push('FADE IN:');
  lines.push('');

  let sceneCount = 0;
  script.elements.forEach(el => {
    const content = el.content.trim();
    if (!content) return;

    switch (FOUNTAIN_TYPE_MAP[el.type]) {
      case 'heading': {
        sceneCount++;
        const num = el.sceneNumber ?? String(sceneCount);
        lines.push('');
        lines.push(`${num} ${content.toUpperCase()} ${num}`);
        lines.push('');
        break;
      }
      case 'action':
        lines.push(content);
        lines.push('');
        break;
      case 'character':
        lines.push('');
        lines.push(content.toUpperCase());
        break;
      case 'parenthetical':
        lines.push(content.startsWith('(') ? content : `(${content})`);
        break;
      case 'dialogue':
        lines.push(content);
        lines.push('');
        break;
      case 'transition':
        lines.push('');
        lines.push(`> ${content.toUpperCase()}`);
        lines.push('');
        break;
      case 'shot':
        lines.push('');
        lines.push(`.${content.toUpperCase()}`);
        lines.push('');
        break;
      case 'centered':
        lines.push('');
        lines.push(`> ${content} <`);
        lines.push('');
        break;
      case 'note':
        lines.push(`/* ${content} */`);
        lines.push('');
        break;
    }
  });

  lines.push('');
  lines.push('FADE OUT.');
  lines.push('');
  lines.push('THE END');

  return lines.join('\n');
}

// ─── Final Draft (FDX) Export ─────────────────────────────────

const FDX_TYPE_MAP: Record<ScriptElement['type'], string> = {
  'scene-heading': 'Scene Heading',
  'action': 'Action',
  'character': 'Character',
  'parenthetical': 'Parenthetical',
  'dialogue': 'Dialogue',
  'transition': 'Transition',
  'shot': 'Shot',
  'centered': 'General',
  'note': 'Action',
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportToFDX(script: Script): string {
  const paragraphs: string[] = [];

  let sceneCount = 0;
  script.elements.forEach(el => {
    const type = FDX_TYPE_MAP[el.type] ?? 'Action';
    const content = escapeXml(el.content || '');

    if (el.type === 'scene-heading') {
      sceneCount++;
      const num = escapeXml(el.sceneNumber ?? String(sceneCount));
      paragraphs.push(
        `    <Paragraph Type="${type}" Number="${num}">` +
        `\n      <Text>${content}</Text>` +
        `\n    </Paragraph>`
      );
    } else {
      paragraphs.push(
        `    <Paragraph Type="${type}">` +
        `\n      <Text>${content}</Text>` +
        `\n    </Paragraph>`
      );
    }
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
    <Paragraph Type="Action">
      <Text>FADE IN:</Text>
    </Paragraph>
${paragraphs.join('\n')}
    <Paragraph Type="Transition">
      <Text>FADE OUT.</Text>
    </Paragraph>
  </Content>
  <TitlePage>
    <Content>
      <Paragraph Alignment="Center">
        <Text>${escapeXml(script.title || 'Untitled')}</Text>
      </Paragraph>
      <Paragraph Alignment="Center">
        <Text>Written by</Text>
      </Paragraph>
      <Paragraph Alignment="Center">
        <Text>${escapeXml(script.author || '')}</Text>
      </Paragraph>
    </Content>
  </TitlePage>
</FinalDraft>`;
}

// ─── Print / PDF (via browser print dialog) ──────────────────

export function printScript(script: Script): void {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Please allow popups to use the PDF export.');
    return;
  }

  let sceneCount = 0;
  const bodyLines: string[] = [];

  // Title block
  bodyLines.push(`<div class="title-block">`);
  bodyLines.push(`<p class="title">${escapeXml(script.title || 'UNTITLED')}</p>`);
  bodyLines.push(`<p class="written-by">Written by</p>`);
  bodyLines.push(`<p class="author">${escapeXml(script.author || '')}</p>`);
  if (script.draftDate) {
    bodyLines.push(`<p class="draft-date">${escapeXml(script.draftDate)} · ${escapeXml(script.revisionColor ?? '')} Draft</p>`);
  }
  bodyLines.push(`</div>`);
  bodyLines.push(`<p class="fade-in">FADE IN:</p>`);

  script.elements.forEach((el, idx) => {
    const content = escapeXml(el.content || '').replace(/\n/g, '<br>');
    if (!content) return;

    if (el.type === 'scene-heading') {
      sceneCount++;
      const num = escapeXml(el.sceneNumber ?? String(sceneCount));
      bodyLines.push(`<p class="scene-heading" data-num="${num}">${content}</p>`);
    } else {
      bodyLines.push(`<p class="${el.type}">${content}</p>`);
    }

    // Page break marker: insert after roughly every 56 lines
    // (handled by CSS orphan/widow and page-break rules)
    void idx;
  });

  bodyLines.push(`<p class="fade-out">FADE OUT.</p>`);
  bodyLines.push(`<p class="the-end">THE END</p>`);

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeXml(script.title || 'Screenplay')}</title>
  <style>
    @page { size: letter; margin: 1in 1in 1in 1.5in; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
    }
    .title-block {
      text-align: center;
      margin-bottom: 4in;
      padding-top: 3in;
    }
    .title { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1em; }
    .written-by { font-size: 12pt; margin-bottom: 0.3em; }
    .author { font-size: 12pt; margin-bottom: 0.5em; }
    .draft-date { font-size: 10pt; color: #555; }
    .fade-in { font-weight: bold; text-transform: uppercase; margin-bottom: 1em; }
    .fade-out { text-align: right; font-weight: bold; text-transform: uppercase; margin-top: 2em; }
    .the-end { text-align: center; font-weight: bold; text-transform: uppercase; margin-top: 1em; }
    p { margin-bottom: 0; }
    .scene-heading {
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      border-top: 1px solid #ccc;
      padding-top: 0.5em;
    }
    .scene-heading::before { content: attr(data-num) "  "; }
    .scene-heading::after { content: "  " attr(data-num); float: right; }
    .action { margin-bottom: 0.8em; page-break-inside: avoid; }
    .character { margin-left: 2.2in; text-transform: uppercase; margin-top: 0.8em; page-break-after: avoid; }
    .parenthetical { margin-left: 1.7in; margin-right: 2.4in; font-style: italic; page-break-after: avoid; }
    .dialogue { margin-left: 1.1in; margin-right: 1.5in; margin-bottom: 0.8em; }
    .transition { text-align: right; text-transform: uppercase; font-weight: bold; margin: 0.8em 0; }
    .shot { text-transform: uppercase; font-weight: bold; text-decoration: underline; margin: 0.8em 0; }
    .centered { text-align: center; font-weight: bold; text-transform: uppercase; margin: 0.8em 0; }
    .note { font-style: italic; color: #555; margin: 0.5em 0; }
  </style>
</head>
<body>
${bodyLines.join('\n')}
</body>
</html>`);

  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
}

// ─── JSON Backup ──────────────────────────────────────────────

export function exportProjectJSON(project: Project): string {
  return JSON.stringify({
    type: 'filmcraft-pro-backup',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    project,
  }, null, 2);
}

// ─── Collaboration Package ────────────────────────────────────

export interface CollabPackage {
  type: 'filmcraft-collaboration-package';
  version: '1.0';
  projectId: string;
  projectName: string;
  script: Script;
  contributor: { name: string; email: string };
  exportedAt: string;
}

export function exportCollabPackage(project: Project, contributor: { name: string; email: string }): string {
  const pkg: CollabPackage = {
    type: 'filmcraft-collaboration-package',
    version: '1.0',
    projectId: project.id,
    projectName: project.name,
    script: project.script,
    contributor,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(pkg, null, 2);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function sanitizeFilename(title: string): string {
  return safeTitle(title);
}
