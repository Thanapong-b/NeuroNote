'use client';
import React, { useState } from 'react';
import { Plus, FolderOpen, ChevronRight, Hash, Pin } from 'lucide-react';
import { Note } from '@/lib/db';


import { useNotes } from '@/hooks/useNotes'; type Ctx = ReturnType<typeof useNotes>;

const NOTE_COLORS = ['#7c6aff', '#ff5a6a', '#f0a030', '#3ecf8e', '#60a5fa', '#f472b6'];

function NoteCard({ note, onOpen, onPin }: { note: Note; onOpen: () => void; onPin: () => void }) {
  const preview = note.content.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\n/g, ' ').slice(0, 120);
  const date = new Date(note.updatedAt);
  const dateStr = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${note.color ? note.color + '33' : 'var(--border)'}`,
        borderLeft: note.color ? `3px solid ${note.color}` : '3px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: 8,
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
      className="animate-fade-up"
    >
      {note.pinned && (
        <div style={{ position: 'absolute', top: 10, right: 12, color: 'var(--amber)', opacity: 0.7 }}>
          <Pin size={12} fill="currentColor" />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <h3 style={{
          fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          flex: 1, lineHeight: 1.3,
        }}>
          {note.title || <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>Untitled</span>}
        </h3>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', flexShrink: 0, fontFamily: 'DM Mono, monospace' }}>
          {dateStr}
        </span>
      </div>
      {preview && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>
          {preview}
        </p>
      )}
      {note.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {note.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">
              <Hash size={8} />{tag}
            </span>
          ))}
        </div>
      )}
      <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
          {note.wordCount} words
        </span>
      </div>
    </div>
  );
}

function FolderChip({ id, name, icon, color, active, onClick, count }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 99,
        background: active ? color + '22' : 'var(--surface)',
        border: `1px solid ${active ? color + '55' : 'var(--border)'}`,
        color: active ? color : 'var(--text-2)',
        fontSize: '0.8rem', fontWeight: active ? 600 : 400,
        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span>{icon}</span>
      <span>{name}</span>
      {count > 0 && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{count}</span>}
    </button>
  );
}

export default function NoteList({ ctx }: { ctx: Ctx }) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  const handleNewFolder = async () => {
    if (!newFolderName.trim()) return;
    await ctx.createFolder(newFolderName.trim(), newFolderIcon);
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const folderNoteCounts = ctx.folders.reduce((acc, f) => {
    acc[f.id] = ctx.notes.filter(n => n.folderId === f.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 16px', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 2 }}>
              MY NOTES
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'DM Serif Display, serif', color: 'var(--text)', lineHeight: 1.1, margin: 0 }}>
              {ctx.activeFolderId ? ctx.folders.find(f => f.id === ctx.activeFolderId)?.name ?? 'Notes' : 'All Notes'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
              {ctx.filteredNotes.length} notes
            </span>
            <button
              onClick={() => ctx.createNote()}
              style={{
                width: 40, height: 40, borderRadius: 12, background: 'var(--accent)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px var(--accent-glow)', transition: 'all 0.15s', color: 'white',
              }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Folder chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          <FolderChip
            id={null} name="All" icon="✦" color="var(--accent)"
            active={ctx.activeFolderId === null}
            onClick={() => ctx.setActiveFolderId(null)}
            count={ctx.notes.length}
          />
          {ctx.folders.map(f => (
            <FolderChip
              key={f.id} {...f}
              active={ctx.activeFolderId === f.id}
              onClick={() => ctx.setActiveFolderId(f.id)}
              count={folderNoteCounts[f.id] ?? 0}
            />
          ))}
          <button
            onClick={() => setShowNewFolder(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
              borderRadius: 99, background: 'transparent', border: '1px dashed var(--border-2)',
              color: 'var(--text-3)', fontSize: '0.8rem', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Plus size={12} /> Folder
          </button>
        </div>

        {/* New folder form */}
        {showNewFolder && (
          <div className="animate-scale-in" style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={newFolderIcon}
              onChange={e => setNewFolderIcon(e.target.value)}
              style={{
                width: 44, height: 38, textAlign: 'center', fontSize: '1.2rem',
                background: 'var(--surface)', border: '1px solid var(--border-2)',
                borderRadius: 10, color: 'var(--text)', outline: 'none',
              }}
            />
            <input
              autoFocus
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNewFolder()}
              style={{
                flex: 1, height: 38, padding: '0 12px', background: 'var(--surface)',
                border: '1px solid var(--border-2)', borderRadius: 10,
                color: 'var(--text)', outline: 'none', fontSize: '0.9rem',
              }}
            />
            <button onClick={handleNewFolder} style={{
              height: 38, padding: '0 16px', borderRadius: 10,
              background: 'var(--accent)', border: 'none', color: 'white',
              fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500,
            }}>Add</button>
            <button onClick={() => setShowNewFolder(false)} style={{
              height: 38, padding: '0 12px', borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-2)', fontSize: '0.85rem', cursor: 'pointer',
            }}>✕</button>
          </div>
        )}
      </div>

      {/* Notes list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 8px' }}>
        {ctx.loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{ height: 90, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : ctx.filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✦</div>
            <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>No notes yet</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Tap + to create your first note</div>
          </div>
        ) : (
          <>
            {ctx.pinnedNotes.length > 0 && (
              <>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '8px 0 6px' }}>
                  PINNED
                </div>
                {ctx.pinnedNotes.map(n => (
                  <NoteCard key={n.id} note={n}
                    onOpen={() => ctx.openNote(n)}
                    onPin={() => ctx.updateNote(n.id, { pinned: !n.pinned })}
                  />
                ))}
              </>
            )}
            {ctx.unpinnedNotes.length > 0 && (
              <>
                {ctx.pinnedNotes.length > 0 && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '8px 0 6px' }}>
                    NOTES
                  </div>
                )}
                {ctx.unpinnedNotes.map(n => (
                  <NoteCard key={n.id} note={n}
                    onOpen={() => ctx.openNote(n)}
                    onPin={() => ctx.updateNote(n.id, { pinned: !n.pinned })}
                  />
                ))}
              </>
            )}
          </>
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
