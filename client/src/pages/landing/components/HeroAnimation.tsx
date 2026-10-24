import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ReactNode } from 'react';
import fallbackUrl from '../../../assets/animations/skillspring-learning.svg';
import styles from './HeroAnimation.module.css';

const LearningAnimation = lazy(() => import('./LearningAnimation'));
const motionQuery = '(prefers-reduced-motion: reduce)';

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia?.(motionQuery);
  media?.addEventListener('change', callback);
  return () => media?.removeEventListener('change', callback);
}

function prefersReducedMotion() {
  return window.matchMedia?.(motionQuery).matches ?? true;
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}

// A decorative animation must never take the rest of the page down.
class AnimationBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function HeroAnimation() {
  const reducedMotion = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => true);
  // Reset loading state when switching from a still back to the player.
  return <Illustration key={reducedMotion ? 'still' : 'animated'} reducedMotion={reducedMotion} />;
}

function Illustration({ reducedMotion }: { reducedMotion: boolean }) {
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => true,
  );
  const frame = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState(() => ({
    entered: typeof IntersectionObserver === 'undefined',
    visible: typeof IntersectionObserver === 'undefined',
  }));
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);
  const onError = useCallback(() => {
    setLoaded(false);
    setFailed(true);
  }, []);

  useEffect(() => {
    if (!frame.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setViewport((previous) => ({
          entered: previous.entered || entry.isIntersecting,
          visible: entry.isIntersecting,
        }));
      },
      { threshold: 0.05 },
    );
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);

  const enabled = viewport.entered && !reducedMotion && !failed;
  const playing = viewport.visible && !hidden && !paused;
  const showAnimation = enabled && loaded;

  return (
    <figure className={styles.figure}>
      <div ref={frame} className={styles.frame} aria-hidden="true">
        <img
          src={fallbackUrl}
          alt=""
          width="600"
          height="260"
          className={showAnimation ? styles.fallbackHidden : styles.fallback}
        />
        {enabled && (
          <AnimationBoundary onError={onError}>
            <Suspense fallback={null}>
              <LearningAnimation playing={playing} onLoad={onLoad} onError={onError} />
            </Suspense>
          </AnimationBoundary>
        )}
      </div>
      <figcaption className={styles.caption}>
        <span>Learn. Build. Grow.</span>
        {showAnimation && (
          <button
            type="button"
            className={styles.control}
            onClick={() => setPaused(!paused)}
            aria-label={paused ? 'Play illustration' : 'Pause illustration'}
          >
            <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
            {paused ? 'Play' : 'Pause'}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
