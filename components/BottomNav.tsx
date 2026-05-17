'use client';
import React from 'react';
import { BookOpen, Search, Plus, Trash2, Settings } from 'lucide-react';
import type { View } from '@/hooks/useNotes';

import { useNotes } from '@/hooks/useNotes'; type Ctx = ReturnType<typeof useNotes>;

const NAV_ITEMS: { view: View; icon: React.ReactNode; label: string }[] = [
  { view: 'list',     icon: <BookOpen size={20} />,  label: 'Notes' },
  { view: 'search',  icon: <Search size={20} />,    label: 'Search' },
  { view: 'trash',   icon: <Trash2 size={20} />,    label: 'Trash' },
  { view: 'settings',icon: <Settings size={20} />,  label: 'Settings' },
];

export default function BottomNav({ ctx }: { ctx: Ctx }) {
  const isEditing = ctx.view === 'editor';

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--bg-2)',
      borderTop: '1px solid var(--border)',
      paddingBottom: 'env(safe-area-inset-bottom, 12px)',
      paddingTop: 8, paddingLeft: 8, paddingRight: 8,
      position: 'relative', zIndex: 5,
      gap: 0,
    }}>
      {NAV_ITEMS.map(item => {
        const active = ctx.view === item.view;
        return (
          <button
            key={item.view}
            onClick={() => {
              if (item.view !== 'list') ctx.setActiveNote(null);
              ctx.setView(item.view);
            }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '6px 4px', borderRadius: 12,
              background: active ? 'var(--accent-glow)' : 'transparent',
              border: 'none', cursor: 'pointer',
              color: active ? 'var(--accent-2)' : 'var(--text-3)',
              transition: 'all 0.2s', position: 'relative',
            }}
          >
            {item.icon}
            <span style={{ fontSize: '0.6rem', fontWeight: active ? 600 : 400, letterSpacing: '0.02em' }}>
              {item.label}
            </span>
            {active && (
              <div style={{
                position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 2, borderRadius: 99, background: 'var(--accent)',
              }} />
            )}
          </button>
        );
      })}

      {/* FAB for quick create (shown only in list/folder/search view) */}
      {(ctx.view === 'list' || ctx.view === 'search') && (
        <button
          onClick={() => ctx.createNote()}
          style={{
            position: 'absolute', bottom: 'calc(100% + 16px)', right: 20,
            width: 52, height: 52, borderRadius: 16,
            background: 'var(--accent)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 4px 20px var(--accent-glow), 0 8px 32px rgba(0,0,0,0.3)',
            transition: 'all 0.15s', zIndex: 10,
          }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
