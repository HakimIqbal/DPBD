/**
 * Minimal ambient module shim for `canvas-confetti`.
 *
 * The npm package ships JS only — the official `@types/canvas-confetti`
 * package is published separately on DefinitelyTyped, but adding it would
 * touch package.json. This shim covers the small surface our code uses
 * (the default-exported callable + a couple of optional config knobs).
 *
 * If we adopt more confetti features later, prefer installing
 * `@types/canvas-confetti` over expanding this shim.
 */
declare module "canvas-confetti" {
  export interface Options {
    particleCount?: number
    angle?: number
    spread?: number
    startVelocity?: number
    decay?: number
    gravity?: number
    drift?: number
    ticks?: number
    origin?: { x?: number; y?: number }
    colors?: string[]
    shapes?: ("square" | "circle")[]
    scalar?: number
    zIndex?: number
    disableForReducedMotion?: boolean
  }

  /**
   * Fire a confetti burst. Returns a Promise that resolves once the
   * animation completes (or `null` when reduced-motion is honored).
   */
  function confetti(options?: Options): Promise<null> | null
  export default confetti
}
