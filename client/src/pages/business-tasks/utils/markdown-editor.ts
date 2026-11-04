import type { Tool } from '../constants/create-task';

// execCommand (deprecated but still universally supported) keeps the browser's native
// undo stack intact and fires an input event, so react-hook-form sees the change
function insertText(el: HTMLTextAreaElement, text: string, selectFrom: number, selectTo: number) {
  const start = el.selectionStart;
  document.execCommand('insertText', false, text);
  el.setSelectionRange(start + selectFrom, start + selectTo);
}

// "word" -> "**word**", keeping the inner text selected
function wrapSelection(el: HTMLTextAreaElement, before: string, after: string, placeholder: string) {
  const selected = el.value.slice(el.selectionStart, el.selectionEnd) || placeholder;
  insertText(el, before + selected + after, before.length, before.length + selected.length);
}

// "a\nb" -> "1. a\n2. b"
function prefixLines(el: HTMLTextAreaElement, prefix: (index: number) => string) {
  // widen the selection to whole lines so each one gets its marker
  const start = el.value.lastIndexOf('\n', el.selectionStart - 1) + 1;
  el.setSelectionRange(start, el.selectionEnd);
  const lines = el.value.slice(start, el.selectionEnd).split('\n');
  const text = lines.map((line, i) => prefix(i) + line).join('\n');
  insertText(el, text, text.length, text.length);
}

export function applyTool(el: HTMLTextAreaElement | null, tool: Tool) {
  if (!el) return;
  el.focus();
  if ('wrap' in tool) wrapSelection(el, ...tool.wrap);
  else prefixLines(el, tool.prefix);
}

export function runHistory(el: HTMLTextAreaElement | null, command: 'undo' | 'redo') {
  el?.focus();
  document.execCommand(command);
}
