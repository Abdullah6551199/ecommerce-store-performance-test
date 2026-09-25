/**
 * 20 Curated Entrance Animations for Stage 42.6 (Elementor-style Motion Effects)
 */

export interface AnimationPreset {
  id: string;
  name: string;
  category: 'fade' | 'slide' | 'zoom' | 'rotate' | 'bounce' | 'special';
  duration: number; // default ms
  easing: string;
  keyframes: string;
}

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  fadeIn: {
    id: 'fadeIn',
    name: 'Fade In',
    category: 'fade',
    duration: 800,
    easing: 'ease-out',
    keyframes: `@keyframes ate-fadeIn { from { opacity: 0; } to { opacity: 1; } }`,
  },
  fadeInUp: {
    id: 'fadeInUp',
    name: 'Fade In Up',
    category: 'fade',
    duration: 800,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    keyframes: `@keyframes ate-fadeInUp { from { opacity: 0; transform: translate3d(0, 30px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }`,
  },
  fadeInDown: {
    id: 'fadeInDown',
    name: 'Fade In Down',
    category: 'fade',
    duration: 800,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    keyframes: `@keyframes ate-fadeInDown { from { opacity: 0; transform: translate3d(0, -30px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }`,
  },
  fadeInLeft: {
    id: 'fadeInLeft',
    name: 'Fade In Left',
    category: 'fade',
    duration: 800,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    keyframes: `@keyframes ate-fadeInLeft { from { opacity: 0; transform: translate3d(-30px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }`,
  },
  fadeInRight: {
    id: 'fadeInRight',
    name: 'Fade In Right',
    category: 'fade',
    duration: 800,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    keyframes: `@keyframes ate-fadeInRight { from { opacity: 0; transform: translate3d(30px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }`,
  },
  slideInUp: {
    id: 'slideInUp',
    name: 'Slide In Up',
    category: 'slide',
    duration: 700,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    keyframes: `@keyframes ate-slideInUp { from { transform: translate3d(0, 100%, 0); visibility: visible; } to { transform: translate3d(0, 0, 0); } }`,
  },
  slideInDown: {
    id: 'slideInDown',
    name: 'Slide In Down',
    category: 'slide',
    duration: 700,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    keyframes: `@keyframes ate-slideInDown { from { transform: translate3d(0, -100%, 0); visibility: visible; } to { transform: translate3d(0, 0, 0); } }`,
  },
  slideInLeft: {
    id: 'slideInLeft',
    name: 'Slide In Left',
    category: 'slide',
    duration: 700,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    keyframes: `@keyframes ate-slideInLeft { from { transform: translate3d(-100%, 0, 0); visibility: visible; } to { transform: translate3d(0, 0, 0); } }`,
  },
  slideInRight: {
    id: 'slideInRight',
    name: 'Slide In Right',
    category: 'slide',
    duration: 700,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    keyframes: `@keyframes ate-slideInRight { from { transform: translate3d(100%, 0, 0); visibility: visible; } to { transform: translate3d(0, 0, 0); } }`,
  },
  zoomIn: {
    id: 'zoomIn',
    name: 'Zoom In',
    category: 'zoom',
    duration: 700,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    keyframes: `@keyframes ate-zoomIn { from { opacity: 0; transform: scale3d(0.7, 0.7, 0.7); } 50% { opacity: 1; } to { opacity: 1; transform: scale3d(1, 1, 1); } }`,
  },
  zoomOut: {
    id: 'zoomOut',
    name: 'Zoom Out',
    category: 'zoom',
    duration: 700,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    keyframes: `@keyframes ate-zoomOut { from { opacity: 0; transform: scale3d(1.3, 1.3, 1.3); } 50% { opacity: 1; } to { opacity: 1; transform: scale3d(1, 1, 1); } }`,
  },
  rotateIn: {
    id: 'rotateIn',
    name: 'Rotate In',
    category: 'rotate',
    duration: 800,
    easing: 'ease-out',
    keyframes: `@keyframes ate-rotateIn { from { transform-origin: center; transform: rotate3d(0, 0, 1, -180deg); opacity: 0; } to { transform-origin: center; transform: translate3d(0, 0, 0); opacity: 1; } }`,
  },
  bounceIn: {
    id: 'bounceIn',
    name: 'Bounce In',
    category: 'bounce',
    duration: 900,
    easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    keyframes: `@keyframes ate-bounceIn { from, 20%, 40%, 60%, 80%, to { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 20% { transform: scale3d(1.08, 1.08, 1.08); } 40% { transform: scale3d(0.92, 0.92, 0.92); } 60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); } 80% { transform: scale3d(0.97, 0.97, 0.97); } to { opacity: 1; transform: scale3d(1, 1, 1); } }`,
  },
  flipInX: {
    id: 'flipInX',
    name: 'Flip In X',
    category: 'rotate',
    duration: 850,
    easing: 'ease-in',
    keyframes: `@keyframes ate-flipInX { from { transform: perspective(400px) rotate3d(1, 0, 0, 90deg); animation-timing-function: ease-in; opacity: 0; } 40% { transform: perspective(400px) rotate3d(1, 0, 0, -20deg); animation-timing-function: ease-in; } 60% { transform: perspective(400px) rotate3d(1, 0, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(1, 0, 0, -5deg); } to { transform: perspective(400px); opacity: 1; } }`,
  },
  flipInY: {
    id: 'flipInY',
    name: 'Flip In Y',
    category: 'rotate',
    duration: 850,
    easing: 'ease-in',
    keyframes: `@keyframes ate-flipInY { from { transform: perspective(400px) rotate3d(0, 1, 0, 90deg); animation-timing-function: ease-in; opacity: 0; } 40% { transform: perspective(400px) rotate3d(0, 1, 0, -20deg); animation-timing-function: ease-in; } 60% { transform: perspective(400px) rotate3d(0, 1, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(0, 1, 0, -5deg); } to { transform: perspective(400px); opacity: 1; } }`,
  },
  lightSpeedIn: {
    id: 'lightSpeedIn',
    name: 'Light Speed In',
    category: 'special',
    duration: 750,
    easing: 'ease-out',
    keyframes: `@keyframes ate-lightSpeedIn { from { transform: translate3d(100%, 0, 0) skewX(-30deg); opacity: 0; } 60% { transform: skewX(20deg); opacity: 1; } 80% { transform: skewX(-5deg); } to { transform: translate3d(0, 0, 0); opacity: 1; } }`,
  },
  rollIn: {
    id: 'rollIn',
    name: 'Roll In',
    category: 'special',
    duration: 800,
    easing: 'ease-out',
    keyframes: `@keyframes ate-rollIn { from { opacity: 0; transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg); } to { opacity: 1; transform: translate3d(0, 0, 0); } }`,
  },
  backInUp: {
    id: 'backInUp',
    name: 'Back In Up',
    category: 'slide',
    duration: 800,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    keyframes: `@keyframes ate-backInUp { 0% { transform: translateY(500px) scale(0.7); opacity: 0.7; } 80% { transform: translateY(0px) scale(0.7); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }`,
  },
  backInDown: {
    id: 'backInDown',
    name: 'Back In Down',
    category: 'slide',
    duration: 800,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    keyframes: `@keyframes ate-backInDown { 0% { transform: translateY(-500px) scale(0.7); opacity: 0.7; } 80% { transform: translateY(0px) scale(0.7); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }`,
  },
  backInLeft: {
    id: 'backInLeft',
    name: 'Back In Left',
    category: 'slide',
    duration: 800,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    keyframes: `@keyframes ate-backInLeft { 0% { transform: translateX(-1000px) scale(0.7); opacity: 0.7; } 80% { transform: translateX(0px) scale(0.7); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }`,
  },
};

/**
 * Generate full CSS keyframes block for active animations
 */
export function getAllAnimationKeyframesCSS(): string {
  return Object.values(ANIMATION_PRESETS)
    .map((p) => p.keyframes)
    .join('\n');
}
