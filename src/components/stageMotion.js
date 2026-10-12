export const stageMotion = {
  initial: { opacity: 0, scale: 1.04 },
  animate: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.9, ease: [0.64, 0, 0.78, 0] } },
}
