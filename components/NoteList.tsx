import React from 'react';
import type { Note } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import SearchIcon from './icons/SearchIcon';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onNewNote: () => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeNoteId,
  onNewNote,
  onSelectNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
}) => {

  const getTextContent = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <aside className="w-64 md:w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">RudraPad</h1>
        <button
          onClick={onNewNote}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="New Note"
        >
          <PlusIcon />
        </button>
      </div>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {notes.length > 0 ? (
          <ul>
            {notes.map(note => (
              <li
                key={note.id}
                className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${
                  note.id === activeNoteId ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div
                  onClick={() => onSelectNote(note.id)}
                  className="flex-grow p-4 cursor-pointer min-w-0"
                >
                  <h2 className={`font-semibold truncate ${note.id === activeNoteId ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{note.title || 'Untitled'}</h2>
                  <p className={`text-sm truncate mt-1 ${note.id === activeNoteId ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                    {getTextContent(note.content).substring(0, 40) || 'No content'}
                  </p>
                  <time className={`text-xs mt-2 block ${note.id === activeNoteId ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {new Date(note.lastModified).toLocaleString()}
                  </time>
                </div>
                 <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className={`p-2 mr-4 rounded-full transition-colors flex-shrink-0 ${note.id === activeNoteId ? 'text-blue-100 hover:bg-blue-600 hover:text-white' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-500'}`}
                    aria-label="Delete Note"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">
            <p>No notes found.</p>
             {searchQuery ? <p>Try a different search.</p> : <p>Click '+' to create one!</p>}
          </div>
        )}
      </div>
    </aside>
  );
};

export default NoteList;