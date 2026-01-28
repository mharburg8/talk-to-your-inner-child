import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateStorageKey(userId: string, type: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${type}/${userId}/${timestamp}-${random}-${sanitized}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export async function bufferToBlob(buffer: Buffer, mimeType: string): Promise<Blob> {
  return new Blob([buffer as any], { type: mimeType });
}