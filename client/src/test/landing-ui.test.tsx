import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import LandingPage from '../pages/landing/LandingPage';
import { MobileNav } from '../pages/landing/components/MobileNav';
import { StepsTabs } from '../pages/landing/components/StepsTabs';
import { HeroAnimation } from '../pages/landing/components/HeroAnimation';
import fallbackUrl from '../assets/animations/skillspring-learning.svg';

const player = vi.hoisted(() => ({
  props: undefined as undefined | { playing: boolean; onLoad: () => void; onError: () => void },
}));

// Exercise the page's loading/playback decisions without a canvas renderer in JSDOM.
// The production renderer is checked separately in the browser.
vi.mock('../pages/landing/components/LearningAnimation', () => ({
  default: function Player(props: NonNullable<typeof player.props>) {
    player.props = props;
    const { onLoad } = props;
    useEffect(() => {
      onLoad();
    }, [onLoad]);
    return <canvas data-testid="lottie-player" />;
  },
}));

let reduced = true;
let desktop = false;
let motionChange: () => void;
let widthChange: () => void;
let visibilityChange: (visible: boolean) => void;

beforeEach(() => {
  reduced = true;
  desktop = false;
  player.props = undefined;
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes('reduced-motion') ? reduced : desktop;
    },
    media: query,
    addEventListener: (_event: string, callback: () => void) => {
      if (query.includes('reduced-motion')) motionChange = callback;
      else widthChange = callback;
    },
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private callback: IntersectionObserverCallback) {
        visibilityChange = (visible) =>
          this.callback(
            [{ isIntersecting: visible } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
      }
      observe() {
        visibilityChange(true);
      }
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

test('landing keeps the existing company route and adds a student action in the hero', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
  const heading = screen.getByRole('heading', { level: 1 });
  const hero = heading.closest('section')!;
  expect(hero.querySelector('a[href="/register?role=student"]')).toHaveTextContent(
    'Join as a student',
  );
  expect(hero.querySelector('a[href="/register?role=company"]')).toHaveTextContent('Post a task');
  expect(screen.getByText('Illustrative tasks')).toBeInTheDocument();
});

test('mobile navigation opens, closes on Escape, and returns focus to its trigger', async () => {
  render(
    <MemoryRouter>
      <MobileNav />
    </MemoryRouter>,
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: 'Open navigation menu' });
  await user.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Explore SkillSpring' })).toBeInTheDocument();
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: 'Explore tasks' })).toHaveAttribute('href', '/tasks');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('mobile navigation closes after a section link and when resizing to desktop', async () => {
  render(
    <MemoryRouter>
      <MobileNav />
    </MemoryRouter>,
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole('button', { name: 'Open navigation menu' });
  await user.click(trigger);
  await user.click(screen.getByRole('link', { name: 'FAQ' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(trigger);
  act(() => {
    desktop = true;
    widthChange();
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('audience tabs support arrow keys, Home/End, and a single tab stop', async () => {
  render(
    <MemoryRouter>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="always">
          <StepsTabs />
        </MotionConfig>
      </LazyMotion>
    </MemoryRouter>,
  );
  const user = userEvent.setup();
  const student = screen.getByRole('tab', { name: 'For students' });
  const company = screen.getByRole('tab', { name: 'For companies' });
  student.focus();
  await user.keyboard('{ArrowLeft}');
  expect(company).toHaveFocus();
  expect(company).toHaveAttribute('aria-selected', 'true');
  expect(student).toHaveAttribute('tabindex', '-1');
  expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', company.id);
  await user.keyboard('{Home}');
  expect(student).toHaveFocus();
  await user.keyboard('{End}');
  expect(company).toHaveFocus();
  await user.keyboard('{ArrowRight}');
  expect(student).toHaveFocus();
});

test('reduced motion shows a still without loading the animation player', () => {
  const { container } = render(<HeroAnimation />);
  expect(container.querySelector('img')).toHaveAttribute('src', fallbackUrl);
  expect(screen.queryByTestId('lottie-player')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /illustration/ })).not.toBeInTheDocument();
});

test('animation can be paused, pauses offscreen, and responds to reduced motion changes', async () => {
  reduced = false;
  render(<HeroAnimation />);
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'Pause illustration' }));
  expect(player.props?.playing).toBe(false);
  await user.click(screen.getByRole('button', { name: 'Play illustration' }));
  expect(player.props?.playing).toBe(true);
  act(() => visibilityChange(false));
  expect(player.props?.playing).toBe(false);
  act(() => visibilityChange(true));
  expect(player.props?.playing).toBe(true);
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(player.props?.playing).toBe(false);
  hidden.mockReturnValue(false);
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(player.props?.playing).toBe(true);
  act(() => {
    reduced = true;
    motionChange();
  });
  expect(screen.queryByTestId('lottie-player')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /illustration/ })).not.toBeInTheDocument();
});

test('a renderer failure leaves the static fallback and removes playback controls', async () => {
  reduced = false;
  const { container } = render(<HeroAnimation />);
  await screen.findByRole('button', { name: 'Pause illustration' });
  act(() => player.props?.onError());
  await waitFor(() => expect(screen.queryByTestId('lottie-player')).not.toBeInTheDocument());
  expect(container.querySelector('img')).not.toBeNull();
  expect(screen.queryByRole('button', { name: /illustration/ })).not.toBeInTheDocument();
});
