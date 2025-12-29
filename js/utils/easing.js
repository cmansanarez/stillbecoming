/**
 * Easing functions for smooth, architectural transitions
 */

export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInCubic(t) {
  return t * t * t;
}

export function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

export function linear(t) {
  return t;
}

/**
 * Smooth interpolation between current and target value
 */
export function smoothDamp(current, target, smoothTime = 0.3, deltaTime = 0.016) {
  const diff = target - current;
  const speed = diff / smoothTime;
  return current + speed * deltaTime;
}

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
