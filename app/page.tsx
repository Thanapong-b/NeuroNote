'use client';
import dynamic from 'next/dynamic';
const NotedApp = dynamic(() => import('@/components/NotedApp'), { ssr: false });
export default function Page() { return <NotedApp />; }
