import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getCountdownText(date: string): string {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Started';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'gold': return 'text-yellow-500';
    case 'silver': return 'text-gray-400';
    case 'bronze': return 'text-amber-700';
    default: return 'text-gray-500';
  }
}

export function getBadgeColor(badge: string): string {
  const colors: Record<string, string> = {
    'Early Adopter': 'bg-purple-500/20 text-purple-400',
    'Community Builder': 'bg-blue-500/20 text-blue-400',
    'Event Organizer': 'bg-green-500/20 text-green-400',
    'Active Member': 'bg-orange-500/20 text-orange-400',
  };
  return colors[badge] || 'bg-gray-500/20 text-gray-400';
}
