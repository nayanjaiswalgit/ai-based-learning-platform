'use client';

import { useRef, useState, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Settings } from 'lucide-react';

interface CodeEditorWithVimProps {
  initialCode?: string;
  language?: string;
  onRun?: (code: string) => void;
  readOnly?: boolean;
  height?: string;
}

const KEYBINDING_MODES = [
  { value: 'standard', label: 'Standard' },
  { value: 'vim', label: 'Vim' },
  { value: 'emacs', label: 'Emacs' },
];

export default function CodeEditorWithVim({
  initialCode = '# Write your code here\n',
  language = 'python',
  onRun,
  readOnly = false,
  height = '500px',
}: CodeEditorWithVimProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [keybindingMode, setKeybindingMode] = useState('standard');
  const [vimStatusLine, setVimStatusLine] = useState('');

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor;

    // Initialize keybinding mode
    applyKeybindingMode(editor, monaco, keybindingMode);
  }

  function applyKeybindingMode(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
    mode: string
  ) {
    if (mode === 'vim') {
      // Vim mode implementation (basic)
      // In production, use monaco-vim package
      let vimMode: 'normal' | 'insert' | 'visual' = 'normal';
      setVimStatusLine('-- NORMAL --');

      editor.addCommand(monaco.KeyCode.Escape, () => {
        vimMode = 'normal';
        setVimStatusLine('-- NORMAL --');
      });

      editor.addCommand(monaco.KeyCode.KeyI, () => {
        if (vimMode === 'normal') {
          vimMode = 'insert';
          setVimStatusLine('-- INSERT --');
        }
      });

      editor.addCommand(monaco.KeyCode.KeyV, () => {
        if (vimMode === 'normal') {
          vimMode = 'visual';
          setVimStatusLine('-- VISUAL --');
        }
      });

      // Vim navigation in normal mode
      editor.addCommand(monaco.KeyCode.KeyH, () => {
        if (vimMode === 'normal') {
          editor.trigger('keyboard', 'cursorLeft', {});
        }
      });

      editor.addCommand(monaco.KeyCode.KeyJ, () => {
        if (vimMode === 'normal') {
          editor.trigger('keyboard', 'cursorDown', {});
        }
      });

      editor.addCommand(monaco.KeyCode.KeyK, () => {
        if (vimMode === 'normal') {
          editor.trigger('keyboard', 'cursorUp', {});
        }
      });

      editor.addCommand(monaco.KeyCode.KeyL, () => {
        if (vimMode === 'normal') {
          editor.trigger('keyboard', 'cursorRight', {});
        }
      });

      // dd - delete line
      editor.addCommand(
        monaco.KeyMod.chord(monaco.KeyCode.KeyD, monaco.KeyCode.KeyD),
        () => {
          if (vimMode === 'normal') {
            editor.trigger('keyboard', 'editor.action.deleteLines', {});
          }
        }
      );

      // yy - copy line
      editor.addCommand(
        monaco.KeyMod.chord(monaco.KeyCode.KeyY, monaco.KeyCode.KeyY),
        () => {
          if (vimMode === 'normal') {
            editor.trigger('keyboard', 'editor.action.copyLinesDownAction', {});
          }
        }
      );
    } else if (mode === 'emacs') {
      // Emacs keybindings
      setVimStatusLine('-- EMACS --');

      // Ctrl+A - beginning of line
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => {
        editor.trigger('keyboard', 'cursorHome', {});
      });

      // Ctrl+E - end of line
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => {
        editor.trigger('keyboard', 'cursorEnd', {});
      });

      // Ctrl+K - kill line
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
        editor.trigger('keyboard', 'deleteAllRight', {});
      });

      // Ctrl+N - next line
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN, () => {
        editor.trigger('keyboard', 'cursorDown', {});
      });

      // Ctrl+P - previous line
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
        editor.trigger('keyboard', 'cursorUp', {});
      });
    } else {
      setVimStatusLine('');
    }
  }

  function handleKeybindingChange(newMode: string) {
    setKeybindingMode(newMode);
    if (editorRef.current) {
      // Re-initialize editor with new keybindings
      // In production, you'd properly dispose and recreate keybindings
      const monaco = (window as any).monaco;
      if (monaco) {
        applyKeybindingMode(editorRef.current, monaco, newMode);
      }
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted border-b border-border p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={keybindingMode} onValueChange={handleKeybindingChange}>
            <SelectTrigger className="w-[120px] bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYBINDING_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {vimStatusLine && (
            <div className="text-sm text-muted-foreground ml-4">{vimStatusLine}</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRun && !readOnly && (
            <Button
              onClick={() => onRun(editorRef.current?.getValue() || '')}
              size="sm"
              className="bg-success hover:bg-success/90 btn-modern"
            >
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <Editor
        height={height}
        language={language}
        defaultValue={initialCode}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          wordWrap: 'on',
          automaticLayout: true,
        }}
        theme="vs-dark"
      />
    </div>
  );
}
