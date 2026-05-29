import type { ReactNode } from 'react';

type Tone = 'default' | 'todo' | 'progress' | 'review' | 'done' | 'low' | 'medium' | 'high' | 'urgent';

const toneClasses: Record<Tone, string> = {
  default: 'bg-gray-100 text-gray-700',
  todo: 'bg-gray-100 text-gray-700',
  progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function Badge({ tone = 'default', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}