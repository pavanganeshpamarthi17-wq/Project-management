import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt) : '—';
};

export const timeAgo = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const priorityConfig = {
  high: { label: 'High', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  medium: { label: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  low: { label: 'Low', color: '#34d399', bg: 'rgba(52,211,153,0.12)' }
};

export const statusConfig = {
  todo: { label: 'To Do', color: '#8892b0', bg: 'rgba(136,146,176,0.12)' },
  'in-progress': { label: 'In Progress', color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)' },
  completed: { label: 'Completed', color: '#34d399', bg: 'rgba(52,211,153,0.12)' }
};

export const projectStatusConfig = {
  active: { label: 'Active', color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)' },
  completed: { label: 'Completed', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  'on-hold': { label: 'On Hold', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  cancelled: { label: 'Cancelled', color: '#f87171', bg: 'rgba(248,113,113,0.12)' }
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const PROJECT_COLORS = [
  '#4f8ef7', '#a78bfa', '#34d399', '#fbbf24', '#f87171',
  '#38bdf8', '#fb923c', '#f472b6', '#a3e635', '#22d3ee'
];
