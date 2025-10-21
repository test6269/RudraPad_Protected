import React, { useState, useEffect, useMemo } from 'react';
import type { Note } from './types';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import Login from './components/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes = localStorage.getItem('rudrapad-notes');
      return savedNotes ? JSON.parse(savedNotes) : [];
    } catch (error)
    {
      console.error("Failed to parse notes from localStorage", error);
      return [];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('rudrapad-theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('rudrapad-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    // This effect syncs notes across tabs in real-time.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'rudrapad-notes') {
        try {
          const newNotes = event.newValue ? JSON.parse(event.newValue) : [];
          setNotes(newNotes);
        } catch (error) {
          console.error("Failed to parse notes from storage event", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rudrapad-theme', theme);
  }, [theme]);
  
  // Set active note to the first note if it exists and no note is active
  useEffect(() => {
      if (!activeNoteId && notes.length > 0) {
          setActiveNoteId(notes[0].id);
      }
      if (activeNoteId && !notes.some(note => note.id === activeNoteId)) {
        setActiveNoteId(notes.length > 0 ? notes[0].id : null);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);


  const handleNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: "",
      lastModified: Date.now(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
    if (!isSidebarVisible) {
      setIsSidebarVisible(true);
    }
  };

  const handleUpdateNote = (updatedNote: Partial<Note> & { id: string }) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === updatedNote.id 
          ? { ...note, ...updatedNote, lastModified: Date.now() } 
          : note
      )
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    if (activeNoteId === id) {
        const remainingNotes = notes.filter(note => note.id !== id);
        setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }
  };

  const filteredNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => b.lastModified - a.lastModified)
      .filter(note => {
        // Create a temporary div to strip HTML for searching content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        
        return note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               textContent.toLowerCase().includes(searchQuery.toLowerCase())
      });
  }, [notes, searchQuery]);

  const activeNote = useMemo(() => {
    return notes.find(note => note.id === activeNoteId) || null;
  }, [notes, activeNoteId]);
  
  const handleToggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen font-sans text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
      {isSidebarVisible && (
        <NoteList
          notes={filteredNotes}
          activeNoteId={activeNoteId}
          onNewNote={handleNewNote}
          onSelectNote={setActiveNoteId}
          onDeleteNote={handleDeleteNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}
      <main className="flex-1 min-w-0">
        <NoteEditor
          key={activeNote?.id || 'empty'}
          activeNote={activeNote}
          onUpdateNote={handleUpdateNote}
          onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLock={handleLock}
        />
      </main>
    </div>
  );
};

export default App;