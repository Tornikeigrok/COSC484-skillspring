# SkillSpring landing illustration

`skillspring-learning.json` is an original, locally authored Lottie illustration for this project. It uses only vector shapes: a laptop, notebook, and growing plant. `skillspring-learning.svg` is its static fallback. Neither file requires a LottieFiles account or an API key.

The landing page loads the official LottieFiles React player only when the illustration enters the viewport and reduced motion is off. Playback pauses offscreen, in hidden tabs, or when the visitor presses Pause. The player, JSON, and WASM renderer are served with the app. If loading fails, the static illustration remains visible.

## Use an animation exported from LottieFiles

1. Export the selected asset as Lottie JSON or dotLottie, following that asset's usage terms.
2. For JSON, replace `skillspring-learning.json`. For dotLottie, add `skillspring-learning.lottie` here and change the `animationUrl` import in `../../pages/landing/components/LearningAnimation.tsx` to that file, keeping `?url`.
3. Replace the static SVG with a matching still if the illustration changes. Keep its 600 × 260 viewport, or adjust the reserved aspect ratio in `HeroAnimation.module.css` as well.
4. Run the frontend tests, typecheck, and production build. Check mobile, Pause/Play, and the browser's reduced-motion preference.

No changes to authentication, API hooks, or shared styles are needed to swap this illustration.
