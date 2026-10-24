import { useEffect, useState } from 'react';
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';
import wasmUrl from '@lottiefiles/dotlottie-web/dotlottie-player.wasm?url';
import animationUrl from '../../../assets/animations/skillspring-learning.json?url';
import styles from './HeroAnimation.module.css';

// Vite serves the renderer with the app; playback does not depend on an external CDN.
setWasmUrl(wasmUrl);

export default function LearningAnimation({
  playing,
  onLoad,
  onError,
}: {
  playing: boolean;
  onLoad: () => void;
  onError: () => void;
}) {
  const [player, setPlayer] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (!player) return;
    player.addEventListener('load', onLoad);
    player.addEventListener('loadError', onError);
    player.addEventListener('renderError', onError);
    if (player.isLoaded) onLoad();
    return () => {
      player.removeEventListener('load', onLoad);
      player.removeEventListener('loadError', onError);
      player.removeEventListener('renderError', onError);
    };
  }, [player, onLoad, onError]);

  useEffect(() => {
    if (playing) player?.play();
    else player?.pause();
  }, [player, playing]);

  return (
    <DotLottieReact
      className={styles.player}
      src={animationUrl}
      loop
      autoplay={playing}
      useFrameInterpolation={false}
      renderConfig={{ devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5) }}
      dotLottieRefCallback={setPlayer}
    />
  );
}
