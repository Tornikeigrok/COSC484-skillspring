import { useEffect, useState } from 'react';

const KEY = 'skillspring-saved-tasks';
const EVENT = 'saved-tasks-change';

// ponytail: saved ids live in the browser until the server has a saved-tasks endpoint
function read(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

// shared by Discover and Overview, so a bookmark shows up on both
export function useSavedTasks() {
  const [ids, setIds] = useState<number[]>(read);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  function toggle(id: number) {
    const current = read();
    const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage blocked (private window), still update this page
    }
    setIds(next);
    window.dispatchEvent(new Event(EVENT));
  }

  return { ids, toggle, isSaved: (id: number) => ids.includes(id) };
}