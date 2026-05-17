'use client';
import React from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';

import { useNotes } from '@/hooks/useNotes'; type Ctx = ReturnType<typeof useNotes>;

export default function TrashView({ ctx }: { ctx: Ctx }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ padding: '56px 20px 16px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
          TRASH
        </div>
        <h1 style={{ fontSize: '1.6rem', fontFamily: 'DM Serif Display, serif', color: 'var(--text)', margin: 0 }}>
          Deleted Notes
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px' }}>
        {ctx.trashedNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <Trash2 size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: '0.9rem' }}>Trash is empty</div>
          </div>
        ) : (
          ctx.trashedNotes.map(note => {
            const deletedDate = note.deletedAt ? new Date(note.deletedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '';
            return (
              <div key={note.id} className="animate-fade-up"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 8, opacity: 0.75 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                    {note.title || <span style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>Untitled</span>}
                  </h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => ctx.restoreNoteById(note.id)}
                      title="Restore"
                      style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--green)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RotateCcw size={13} />
                    </button>
                    <button onClick={() => ctx.permanentlyDelete(note.id)}
                      title="Delete permanently"
                      style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: 0 }}>
                  Deleted {deletedDate} · {note.wordCount} words
                </p>
              </div>
            );
          })
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
