import { useCallback, useEffect, useState } from 'react';

/**
 * Counts down in whole seconds after start(seconds). `remaining` is 0 when the action can be used again.
 * It compares against the clock, so it stays correct even if the browser slows down a background tab.
 */
export function useCooldown() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setEndsAt(null);
    }, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  const start = useCallback((seconds: number) => {
    setRemaining(seconds);
    setEndsAt(Date.now() + seconds * 1000);
  }, []);

  return { remaining, start };
}
