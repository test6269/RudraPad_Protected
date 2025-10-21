import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Note } from '../types';
import MenuIcon from './icons/MenuIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import UndoIcon from './icons/UndoIcon';
import RedoIcon from './icons/RedoIcon';
import BoldIcon from './icons/BoldIcon';
import ItalicIcon from './icons/ItalicIcon';
import DownloadIcon from './icons/DownloadIcon';
import LockIcon from './icons/LockIcon';

interface NoteEditorProps {
  activeNote: Note | null;
  onUpdateNote: (updatedNote: Partial<Note> & { id: string }) => void;
  onToggleSidebar: () => void;
  theme: string;
  onToggleTheme: () => void;
  onLock: () => void;
}

const FONT_SIZES = [
    { name: 'Small', value: '2' },
    { name: 'Normal', value: '3' },
    { name: 'Large', value: '5' },
    { name: 'Extra Large', value: '7' },
]

const NoteEditor: React.FC<NoteEditorProps> = ({ activeNote, onUpdateNote, onToggleSidebar, theme, onToggleTheme, onLock }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      if (editorRef.current) {
        editorRef.current.innerHTML = activeNote.content;
      }
      setIsDirty(false);
    } else {
      setTitle('');
      setContent('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setIsDirty(false);
    }
  }, [activeNote]);
  
  const handleFormat = (command: string, value: string | null = null) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleContentInput(); // Mark as dirty after formatting
  }
  
  const handleDownload = () => {
      if(!activeNote) return;
      const textContent = editorRef.current?.innerText || '';
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/ /g, '_') || 'note'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleContentInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setIsDirty(true);
    }
  };

  const handleSave = () => {
    if (activeNote && editorRef.current) {
      onUpdateNote({ id: activeNote.id, title, content: editorRef.current.innerHTML });
      setIsDirty(false);
    }
  };
  
  const wordCount = useMemo(() => {
      const text = editorRef.current?.innerText || '';
      if (!text.trim()) return 0;
      return text.trim().split(/\s+/).length;
  }, [content]);

  const charCount = useMemo(() => {
    return editorRef.current?.innerText.length || 0;
  }, [content]);

  if (!activeNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
         <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 absolute top-4 left-4"
            aria-label="Toggle sidebar"
        >
            <MenuIcon />
        </button>
        <p className="text-xl">Select a note to view or create a new one.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center gap-2 flex-shrink-0 flex-wrap">
        <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle sidebar"
        >
            <MenuIcon />
        </button>
        
        {/* Toolbar */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
            <button onClick={() => handleFormat('undo')} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Undo"><UndoIcon /></button>
            <button onClick={() => handleFormat('redo')} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Redo"><RedoIcon /></button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button onClick={() => handleFormat('bold')} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Bold"><BoldIcon /></button>
            <button onClick={() => handleFormat('italic')} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Italic"><ItalicIcon /></button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <select 
                defaultValue="3" 
                onChange={e => handleFormat('fontSize', e.target.value)} 
                className="p-2 rounded-md bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none appearance-none text-center"
            >
                {FONT_SIZES.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
            </select>
             <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            <button onClick={handleDownload} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Download"><DownloadIcon /></button>
        </div>
        
        <div className="flex items-center gap-4">
          {isDirty && <span className="text-sm text-yellow-500 hidden md:inline">Unsaved</span>}
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
          >
            Save
          </button>
          <button onClick={onToggleTheme} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <button
            onClick={onLock}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Lock RudraPad"
          >
            <LockIcon />
          </button>
        </div>
      </div>
      <div className="p-6 md:p-8 flex-1 flex flex-col min-h-0">
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setIsDirty(true); }}
          placeholder="Note Title"
          className="w-full bg-transparent text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none mb-4"
        />
        <div
          ref={editorRef}
          onInput={handleContentInput}
          contentEditable={true}
          suppressContentEditableWarning={true}
          data-placeholder="Start writing..."
          className={`w-full flex-1 bg-transparent text-base text-gray-800 dark:text-gray-200 resize-none focus:outline-none prose dark:prose-invert max-w-none relative empty:before:content-[attr(data-placeholder)] empty:before:absolute empty:before:top-0 empty:before:left-0 empty:before:text-gray-400 dark:empty:before:text-gray-500 empty:before:pointer-events-none`}
        />
      </div>
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-right">
        <span>Words: {wordCount}</span>
        <span className="mx-2">|</span>
        <span>Characters: {charCount}</span>
      </div>
    </div>
  );
};

export default NoteEditor;
