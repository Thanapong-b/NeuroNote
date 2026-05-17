import { openDB } from 'idb';

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  pinned: boolean;
  color: string | null;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  deleted: boolean;
  deletedAt: number | null;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  createdAt: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDB(): Promise<any> {
  return openDB('noted-v1', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-updated', 'updatedAt');
        notesStore.createIndex('by-folder', 'folderId');
      }
      if (!db.objectStoreNames.contains('folders')) {
        const foldersStore = db.createObjectStore('folders', { keyPath: 'id' });
        foldersStore.createIndex('by-order', 'order');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get('settings', key);
}

export async function setSetting(key: string, value: unknown) {
  const db = await getDB();
  return db.put('settings', value, key);
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const all: Note[] = await db.getAllFromIndex('notes', 'by-updated');
  return all.filter((n: Note) => !n.deleted).reverse();
}

export async function getTrashedNotes(): Promise<Note[]> {
  const db = await getDB();
  const all: Note[] = await db.getAll('notes');
  return all.filter((n: Note) => n.deleted).sort((a: Note, b: Note) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return db.get('notes', id);
}

export async function saveNote(note: Note) {
  const db = await getDB();
  return db.put('notes', note);
}

export async function deleteNote(id: string, soft = true) {
  const db = await getDB();
  if (soft) {
    const note: Note = await db.get('notes', id);
    if (note) await db.put('notes', { ...note, deleted: true, deletedAt: Date.now() });
  } else {
    await db.delete('notes', id);
  }
}

export async function restoreNote(id: string) {
  const db = await getDB();
  const note: Note = await db.get('notes', id);
  if (note) await db.put('notes', { ...note, deleted: false, deletedAt: null });
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  return db.getAllFromIndex('folders', 'by-order');
}

export async function saveFolder(folder: Folder) {
  const db = await getDB();
  return db.put('folders', folder);
}

export async function deleteFolder(id: string) {
  const db = await getDB();
  await db.delete('folders', id);
  const all: Note[] = await db.getAll('notes');
  for (const note of all) {
    if (note.folderId === id) {
      await db.put('notes', { ...note, folderId: null });
    }
  }
}

export async function searchNotes(query: string): Promise<Note[]> {
  const all = await getAllNotes();
  const q = query.toLowerCase();
  return all.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q))
  );
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function exportData(): Promise<string> {
  const db = await getDB();
  const notes: Note[] = await db.getAll('notes');
  const folders: Folder[] = await getAllFolders();
  return JSON.stringify({ version: 1, exportedAt: Date.now(), notes, folders }, null, 2);
}

export async function importData(json: string) {
  const data = JSON.parse(json);
  const db = await getDB();
  if (data.notes) for (const n of data.notes) await db.put('notes', n);
  if (data.folders) for (const f of data.folders) await db.put('folders', f);
}
