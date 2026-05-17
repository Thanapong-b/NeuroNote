'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, MoreHorizontal, Pin, Trash2, Tag, FolderOpen,
  Bold, Italic, Hash, List, ListOrdered, Quote, Code, CheckSquare,
  Sparkles, X, Check, Palette
} from 'lucide-react';


import { useNotes } from '@/hooks/useNotes'; type Ctx = ReturnType<typeof useNotes>;

const COLORS = ['', '#7c6aff', '#ff5a6a', '#f0a030', '#3ecf8e', '#60a5fa', '#f472b6', '#a78bfa'];
const ICONS_LIST = ['📁', '🏠', '💼', '❤️', '⭐', '📚', '🎵', '🌿', '💡', '🚀', '🎯', '✨'];

function ToolbarBtn({ icon, onPress, active = false }: { icon: React.ReactNode; onPress: () => void; active?: boolean }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onPress(); }}
      style={{
        width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: active ? 'var(--accent-glow)' : 'transparent',
        color: active ? 'var(--accent-2)' : 'var(--text-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s', flexShrink: 0,
      }}
    >
      {icon}
    </button>
  );
}

export default function NoteEditor({ ctx }: { ctx: Ctx }) {
  const note = ctx.activeNote;
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [showMenu, setShowMenu] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) { setTitle(note.title); setContent(note.content); }
  }, [note?.id]);

  const handleTitleChange = useCallback((val: string) => {
    setTitle(val);
    if (note) ctx.updateNote(note.id, { title: val });
  }, [note, ctx]);

  const handleContentChange = useCallback((val: string) => {
    setContent(val);
    if (note) ctx.updateNote(note.id, { content: val });
  }, [note, ctx]);

  const insertAtCursor = useCallback((before: string, after = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end);
    handleContentChange(newContent);
    setTimeout(() => {
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
      ta.focus();
    }, 0);
  }, [content, handleContentChange]);

  const insertLinePrefix = useCallback((prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const newContent = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    handleContentChange(newContent);
    setTimeout(() => {
      ta.selectionStart = start + prefix.length;
      ta.selectionEnd = start + prefix.length;
      ta.focus();
    }, 0);
  }, [content, handleContentChange]);

  const addTag = () => {
    if (!tagInput.trim() || !note) return;
    const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!note.tags.includes(newTag)) {
      ctx.updateNote(note.id, { tags: [...note.tags, newTag] }, false);
    }
    setTagInput('');
    setShowTagInput(false);
  };

  const removeTag = (tag: string) => {
    if (!note) return;
    ctx.updateNote(note.id, { tags: note.tags.filter(t => t !== tag) }, false);
  };

  const handleAISummary = async () => {
    if (!content.trim()) return;
    setAiLoading(true);
    setShowAI(true);
    setAiResult('');
    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.slice(0, 3000) }),
      });
      const data = await response.json();
      setAiResult(data.summary || 'Could not generate summary.');
    } catch {
      setAiResult('AI summary unavailable. Check connection.');
    }
    setAiLoading(false);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (!note) return null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '52px 16px 12px',
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        position: 'relative',
      }}>
        <button
          onClick={() => { ctx.setView('list'); ctx.setActiveNote(null); }}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <ArrowLeft size={18} />
        </button>

        <input
          ref={titleRef}
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Note title…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: '1rem', fontWeight: 600, color: 'var(--text)',
            fontFamily: 'DM Sans, sans-serif',
          }}
        />

        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            onClick={handleAISummary}
            title="AI Summary"
            style={{ width: 36, height: 36, borderRadius: 10, background: aiLoading ? 'var(--accent-glow)' : 'transparent', border: `1px solid ${aiLoading ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--accent-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Sparkles size={16} />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <>
            <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
            <div className="animate-scale-in glass-strong" style={{
              position: 'absolute', top: '100%', right: 16, zIndex: 20,
              borderRadius: 14, minWidth: 180, overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}>
              {[
                { icon: <Pin size={15} />, label: note.pinned ? 'Unpin' : 'Pin note', action: () => { ctx.updateNote(note.id, { pinned: !note.pinned }, false); setShowMenu(false); } },
                { icon: <Palette size={15} />, label: 'Note color', action: () => { setShowColorPicker(true); setShowMenu(false); } },
                { icon: <Tag size={15} />, label: 'Add tag', action: () => { setShowTagInput(true); setShowMenu(false); } },
                { icon: <FolderOpen size={15} />, label: 'Move to folder', action: () => { setShowFolderPicker(true); setShowMenu(false); } },
                { icon: <Trash2 size={15} />, label: 'Move to trash', action: () => { ctx.trashNote(note.id); setShowMenu(false); }, danger: true },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '12px 16px', background: 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: (item as any).danger ? 'var(--red)' : 'var(--text)',
                  fontSize: '0.875rem', transition: 'background 0.1s',
                }}>
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tags row */}
      {(note.tags.length > 0 || showTagInput) && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 16px', flexWrap: 'wrap', background: 'var(--bg)', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          {note.tags.map(tag => (
            <span key={tag} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)}>
              <span>#{tag}</span>
              <X size={8} />
            </span>
          ))}
          {showTagInput && (
            <input
              autoFocus value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setShowTagInput(false); }}
              placeholder="tag name"
              style={{
                height: 24, padding: '0 8px', borderRadius: 99, fontSize: '0.75rem',
                background: 'var(--surface)', border: '1px solid var(--accent)',
                color: 'var(--text)', outline: 'none', width: 100,
              }}
            />
          )}
        </div>
      )}

      {/* AI Panel */}
      {showAI && (
        <div className="animate-scale-in" style={{
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-2)', fontSize: '0.8rem', fontWeight: 600 }}>
              <Sparkles size={14} /> AI Summary
            </div>
            <button onClick={() => setShowAI(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          {aiLoading ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
              <div className="skeleton" style={{ width: '100%', height: 60 }} />
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{aiResult}</p>
          )}
        </div>
      )}

      {/* Formatting toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, padding: '4px 12px',
        background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        <ToolbarBtn icon={<Bold size={14} />} onPress={() => insertAtCursor('**', '**')} />
        <ToolbarBtn icon={<Italic size={14} />} onPress={() => insertAtCursor('_', '_')} />
        <ToolbarBtn icon={<Code size={14} />} onPress={() => insertAtCursor('`', '`')} />
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
        <ToolbarBtn icon={<Hash size={14} />} onPress={() => insertLinePrefix('# ')} />
        <ToolbarBtn icon={<span style={{ fontSize: '0.7rem', fontWeight: 700 }}>H2</span>} onPress={() => insertLinePrefix('## ')} />
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
        <ToolbarBtn icon={<List size={14} />} onPress={() => insertLinePrefix('- ')} />
        <ToolbarBtn icon={<ListOrdered size={14} />} onPress={() => insertLinePrefix('1. ')} />
        <ToolbarBtn icon={<CheckSquare size={14} />} onPress={() => insertLinePrefix('- [ ] ')} />
        <ToolbarBtn icon={<Quote size={14} />} onPress={() => insertLinePrefix('> ')} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {wordCount}w · {readTime}m
        </span>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => handleContentChange(e.target.value)}
          placeholder="Start writing… use # for heading, - for list, **bold**, _italic_"
          style={{
            width: '100%', height: '100%', padding: '20px 20px 100px',
            background: 'transparent', border: 'none', outline: 'none', resize: 'none',
            fontFamily: 'DM Sans, sans-serif', fontSize: '15px', lineHeight: 1.75,
            color: 'var(--text)', caretColor: 'var(--accent)',
          }}
        />
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <>
          <div onClick={() => setShowColorPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.5)' }} />
          <div className="animate-scale-in glass-strong" style={{
            position: 'fixed', bottom: '50%', left: '50%', transform: 'translate(-50%, 50%)',
            zIndex: 40, borderRadius: 20, padding: '20px', minWidth: 240,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 14, textAlign: 'center' }}>Note color</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => { ctx.updateNote(note.id, { color: c || null }, false); setShowColorPicker(false); }}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: `2px solid ${note.color === (c || null) ? 'var(--text)' : 'transparent'}`,
                    background: c || 'var(--surface)', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {!c && <span style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>✕</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Folder Picker Modal */}
      {showFolderPicker && (
        <>
          <div onClick={() => setShowFolderPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.5)' }} />
          <div className="animate-scale-in glass-strong" style={{
            position: 'fixed', bottom: '50%', left: '50%', transform: 'translate(-50%, 50%)',
            zIndex: 40, borderRadius: 20, padding: '20px', minWidth: 240,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 14, textAlign: 'center' }}>Move to folder</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => { ctx.updateNote(note.id, { folderId: null }, false); setShowFolderPicker(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: note.folderId === null ? 'var(--accent-glow)' : 'var(--surface)', border: `1px solid ${note.folderId === null ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', color: 'var(--text)', fontSize: '0.875rem' }}>
                <span>✦</span> No folder
                {note.folderId === null && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />}
              </button>
              {ctx.folders.map(f => (
                <button key={f.id} onClick={() => { ctx.updateNote(note.id, { folderId: f.id }, false); setShowFolderPicker(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: note.folderId === f.id ? 'var(--accent-glow)' : 'var(--surface)', border: `1px solid ${note.folderId === f.id ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', color: 'var(--text)', fontSize: '0.875rem' }}>
                  <span>{f.icon}</span> {f.name}
                  {note.folderId === f.id && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
