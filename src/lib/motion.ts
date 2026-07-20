// Shared motion presets — a small reusable "animation system" so transitions feel
// consistent across the app rather than each page inventing its own timing/easing.

export const springSnappy = { type: 'spring', stiffness: 380, damping: 32, mass: 0.9 } as const;
export const springSoft = { type: 'spring', stiffness: 220, damping: 26, mass: 1 } as const;
export const easeOut = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

export const staggerContainer = (stagger = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: springSoft },
};
