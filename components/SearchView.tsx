'use client';
import React, { useRef, useEffect } from 'react';
import { Search, X, Hash } from 'lucide-react';
import type { Note } from '@/lib/db';

import { useNotes } from '@/hooks/useNotes'; type Ctx = ReturnType<typeof useNotes>;

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: 'var(--accent-glow)', color: 'var(--accent-2)', borderRadius: 3, padding: '0 2px' }}>{p}</mark>
      : p
  );
}

export default function SearchView({ ctx }: { ctx: Ctx }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Search header */}
      <div style={{ padding: '52px 16px 12px', background: 'var(--bg)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            ref={inputRef}
            value={ctx.searchQuery}
            onChange={e => ctx.doSearch(e.target.value)}
            placeholder="Search notes, tags, content…"
            style={{
              width: '100%', height: 44, padding: '0 40px 0 40px',
              background: 'var(--surface)', border: '1px solid var(--border-2)',
              borderRadius: 12, color: 'var(--text)', fontSize: '0.9rem',
              outline: 'none', fontFamily: 'DM Sans, sans-serif',
            }}
          />
          {ctx.searchQuery && (
            <button onClick={() => ctx.doSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px' }}>
        {!ctx.searchQuery ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <Search size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: '0.9rem' }}>Type to search your notes</div>
          </div>
        ) : ctx.searchResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>∅</div>
            <div style={{ fontSize: '0.9rem' }}>No results for "{ctx.searchQuery}"</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '8px 0' }}>
              {ctx.searchResults.length} result{ctx.searchResults.length !== 1 ? 's' : ''}
            </div>
            {ctx.searchResults.map(note => {
              const preview = note.content.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\n/g, ' ');
              const matchIdx = preview.toLowerCase().indexOf(ctx.searchQuery.toLowerCase());
              const snippet = matchIdx >= 0
                ? preview.slice(Math.max(0, matchIdx - 40), matchIdx + 100)
                : preview.slice(0, 120);

              return (
                <div key={note.id} onClick={() => ctx.openNote(note)} className="animate-fade-up"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 8, cursor: 'pointer', borderLeft: note.color ? `3px solid ${note.color}` : '3px solid transparent' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
                    {highlight(note.title || 'Untitled', ctx.searchQuery)}
                  </h3>
                  {snippet && <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 6px' }}>
                    {matchIdx > 40 ? '…' : ''}{highlight(snippet, ctx.searchQuery)}{snippet.length < preview.length ? '…' : ''}
                  </p>}
                  {note.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {note.tags.map(t => <span key={t} className="tag"><Hash size={8} />{highlight(t, ctx.searchQuery)}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
