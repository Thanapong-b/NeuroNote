'use client';
import React, { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';
import SearchView from './SearchView';
import TrashView from './TrashView';
import SettingsView from './SettingsView';
import BottomNav from './BottomNav';

export default function NotedApp() {
  const ctx = useNotes();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="noted-root" style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.5,
      }} />

      {/* Main content area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {ctx.view === 'list' && <NoteList ctx={ctx} />}
        {ctx.view === 'editor' && <NoteEditor ctx={ctx} />}
        {ctx.view === 'search' && <SearchView ctx={ctx} />}
        {ctx.view === 'trash' && <TrashView ctx={ctx} />}
        {ctx.view === 'settings' && <SettingsView ctx={ctx} />}
      </div>

      {/* Bottom navigation */}
      <BottomNav ctx={ctx} />
    </div>
  );
}
