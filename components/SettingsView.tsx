'use client';
import React, { useRef, useState } from 'react';
import { Moon, Sun, Download, Upload, Trash2, Info } from 'lucide-react';
import { exportData, importData } from '@/lib/db';

import { useNotes } from '@/hooks/useNotes'; type Ctx = ReturnType<typeof useNotes>;

function Row({ icon, label, sublabel, right, danger = false, onClick }: any) {
  return (
    <button onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', width: '100%',
        gap: 14, padding: '14px 16px', borderRadius: 14,
        background: 'var(--surface)', border: '1px solid var(--border)',
        cursor: onClick ? 'pointer' : 'default',
        marginBottom: 8, transition: 'all 0.15s',
        color: danger ? 'var(--red)' : 'var(--text)',
      }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: danger ? 'var(--red)' : 'var(--accent-2)' }}>
        {icon}
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>{sublabel}</div>}
      </div>
      {right}
    </button>
  );
}

export default function SettingsView({ ctx }: { ctx: Ctx }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importDone, setImportDone] = useState(false);

  const handleExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `noted-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await importData(text);
    await ctx.loadAll();
    setImportDone(true);
    setTimeout(() => setImportDone(false), 2500);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ padding: '56px 20px 16px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
          PREFERENCES
        </div>
        <h1 style={{ fontSize: '1.6rem', fontFamily: 'DM Serif Display, serif', color: 'var(--text)', margin: 0 }}>
          Settings
        </h1>
      </div>

      <div style={{ padding: '4px 20px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '8px 0 4px' }}>
          APPEARANCE
        </div>
        <Row
          icon={ctx.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          label={ctx.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          sublabel="Tap to toggle theme"
          onClick={() => ctx.setTheme(ctx.theme === 'dark' ? 'light' : 'dark')}
          right={
            <div style={{
              width: 44, height: 26, borderRadius: 99,
              background: ctx.theme === 'dark' ? 'var(--accent)' : 'var(--border-2)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 99, background: 'white',
                position: 'absolute', top: 3, left: ctx.theme === 'dark' ? 21 : 3,
                transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
          }
        />

        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '12px 0 4px' }}>
          DATA
        </div>
        <Row
          icon={<Download size={16} />}
          label="Export backup"
          sublabel={`${ctx.notes.length} notes · ${ctx.folders.length} folders`}
          onClick={handleExport}
        />
        <Row
          icon={<Upload size={16} />}
          label={importDone ? '✓ Import successful!' : 'Import backup'}
          sublabel="Merge from JSON backup file"
          onClick={() => fileRef.current?.click()}
        />
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />

        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '12px 0 4px' }}>
          STATS
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', marginBottom: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center' }}>
            {[
              { v: ctx.notes.length, l: 'Notes' },
              { v: ctx.folders.length, l: 'Folders' },
              { v: ctx.notes.reduce((s, n) => s + n.wordCount, 0).toLocaleString(), l: 'Words' },
            ].map(item => (
              <div key={item.l}>
                <div style={{ fontSize: '1.5rem', fontFamily: 'DM Serif Display, serif', color: 'var(--text)', lineHeight: 1 }}>{item.v}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 4 }}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', padding: '12px 0 4px' }}>
          ABOUT
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', marginBottom: 8 }}>
          <div style={{ fontSize: '1.1rem', fontFamily: 'DM Serif Display, serif', color: 'var(--text)', marginBottom: 6 }}>Noted ✦</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            A minimal, offline-first note app. Data stays on your device using IndexedDB.
            No accounts, no tracking, no cloud required.
          </div>
          <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>v1.0.0 · Local storage</div>
        </div>
      </div>
      <div style={{ height: 100 }} />
    </div>
  );
}
