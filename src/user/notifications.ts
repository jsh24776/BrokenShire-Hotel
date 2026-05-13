import { useEffect, useMemo, useState } from 'react';

export type GuestNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

const STORAGE_KEY = 'bh_guest_notifications_v1';
const CHANGE_EVENT = 'bh:guest_notifications';

function safeParse(json: string | null): GuestNotification[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as GuestNotification[];
  } catch {
    return [];
  }
}

function loadNotifications(): GuestNotification[] {
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

function saveNotifications(list: GuestNotification[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addGuestNotification(input: { title: string; message: string }) {
  const now = new Date().toISOString();
  const item: GuestNotification = {
    id: `n_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: input.title,
    message: input.message,
    created_at: now,
    read: false,
  };

  const next = [item, ...loadNotifications()].slice(0, 30);
  saveNotifications(next);
  return item;
}

export function markAllGuestNotificationsRead() {
  const current = loadNotifications();
  const next = current.map((n) => ({ ...n, read: true }));
  saveNotifications(next);
}

export function useGuestNotifications() {
  const [items, setItems] = useState<GuestNotification[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadNotifications();
  });

  useEffect(() => {
    const refresh = () => setItems(loadNotifications());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const unreadCount = useMemo(() => items.reduce((sum, n) => sum + (n.read ? 0 : 1), 0), [items]);

  return { items, unreadCount };
}
