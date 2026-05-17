'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Note, Folder, getAllNotes, getAllFolders, saveNote, deleteNote, restoreNote, saveFolder, deleteFolder, searchNotes, countWords, getTrashedNotes } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export type View = 'list' | 'editor' | 'search' | 'trash' | 'settings' | 'folders';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [view, setView] = useState<View>('list');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAll = useCallback(async () => {
    const [n, f, t] = await Promise.all([getAllNotes(), getAllFolders(), getTrashedNotes()]);
    setNotes(n);
    setFolders(f);
    setTrashedNotes(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
    const saved = localStorage.getItem('noted-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, [loadAll]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('noted-theme', theme);
  }, [theme]);

  const createNote = useCallback(async (folderId: string | null = activeFolderId) => {
    const note: Note = {
      id: uuidv4(), title: '', content: '', folderId, tags: [],
      pinned: false, color: null, createdAt: Date.now(), updatedAt: Date.now(),
      wordCount: 0, deleted: false, deletedAt: null,
    };
    await saveNote(note);
    await loadAll();
    setActiveNote(note);
    setView('editor');
    return note;
  }, [activeFolderId, loadAll]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>, debounce = true) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    if (activeNote?.id === id) setActiveNote(prev => prev ? { ...prev, ...updates } : prev);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const doSave = async () => {
      const current = await import('@/lib/db').then(m => m.getNote(id));
      if (!current) return;
      const updated = { ...current, ...updates, updatedAt: Date.now() };
      if (updates.content !== undefined) updated.wordCount = countWords(updates.content);
      await saveNote(updated);
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      if (activeNote?.id === id) setActiveNote(updated);
    };
    if (debounce) {
      saveTimerRef.current = setTimeout(doSave, 600);
    } else {
      await doSave();
    }
  }, [activeNote]);

  const trashNote = useCallback(async (id: string) => {
    await deleteNote(id, true);
    if (activeNote?.id === id) { setActiveNote(null); setView('list'); }
    await loadAll();
  }, [activeNote, loadAll]);

  const restoreNoteById = useCallback(async (id: string) => {
    await restoreNote(id);
    await loadAll();
  }, [loadAll]);

  const permanentlyDelete = useCallback(async (id: string) => {
    await deleteNote(id, false);
    await loadAll();
  }, [loadAll]);

  const openNote = useCallback((note: Note) => {
    setActiveNote(note);
    setView('editor');
  }, []);

  const createFolder = useCallback(async (name: string, icon = '📁', color = '#7c6aff') => {
    const folder: Folder = { id: uuidv4(), name, icon, color, order: folders.length, createdAt: Date.now() };
    await saveFolder(folder);
    await loadAll();
    return folder;
  }, [folders.length, loadAll]);

  const removeFolder = useCallback(async (id: string) => {
    await deleteFolder(id);
    if (activeFolderId === id) setActiveFolderId(null);
    await loadAll();
  }, [activeFolderId, loadAll]);

  const doSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    const results = await searchNotes(query);
    setSearchResults(results);
  }, []);

  const filteredNotes = activeFolderId
    ? notes.filter(n => n.folderId === activeFolderId)
    : notes;

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  return {
    notes, folders, trashedNotes, activeNote, view, activeFolderId,
    searchResults, searchQuery, theme, loading,
    filteredNotes, pinnedNotes, unpinnedNotes,
    setView, setActiveNote, setActiveFolderId,
    createNote, updateNote, trashNote, restoreNoteById, permanentlyDelete,
    openNote, createFolder, removeFolder, doSearch,
    setTheme, loadAll,
  };
}
