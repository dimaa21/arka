import type { ShoeVariant } from './catalog';

/** Chunky side-view shoe. Light colors stay outlined so they read on a gray card. */
export function shoeMarkup(variant: ShoeVariant, color: string): string {
  const fill = isLight(color) ? '#efece6' : color;
  const line = '#1c1c1c';
  if (variant === 'slide') return slide(fill, line);
  if (variant === 'boot') return boot(fill, line);
  return sneaker(fill, line);
}

function isLight(color: string): boolean {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return false;
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 170;
}

function sneaker(fill: string, line: string): string {
  return `<svg viewBox="0 0 240 160" aria-hidden="true">
    <ellipse cx="120" cy="142" rx="78" ry="6" fill="#000" opacity="0.15"/>
    <path d="M28 112h176c8 0 14 6 12 12s-10 10-20 10H40c-12 0-20-6-18-14 1-4 3-8 6-8z" fill="#2a2a2a"/>
    <path d="M46 112c2-34 18-58 52-64 22-4 40 6 52 22l38 8c16 4 28 8 34 18v16H46z" fill="${fill}" stroke="${line}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M78 78h28M80 90h26M84 102h20" stroke="${line}" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
    <circle cx="168" cy="96" r="7" fill="none" stroke="${line}" stroke-width="3"/>
  </svg>`;
}

function slide(fill: string, line: string): string {
  return `<svg viewBox="0 0 240 160" aria-hidden="true">
    <ellipse cx="120" cy="140" rx="74" ry="6" fill="#000" opacity="0.15"/>
    <path d="M36 118h160c10 0 16 6 14 12s-10 8-18 8H48c-12 0-18-4-16-12 1-4 2-8 4-8z" fill="#2a2a2a"/>
    <path d="M52 118c8-10 70-18 132-4 4 6 2 12-8 14H60c-8-2-10-6-8-10z" fill="${fill}" stroke="${line}" stroke-width="4"/>
    <path d="M96 78c28-22 58-16 74 8" fill="none" stroke="${line}" stroke-width="10" stroke-linecap="round"/>
  </svg>`;
}

function boot(fill: string, line: string): string {
  return `<svg viewBox="0 0 240 160" aria-hidden="true">
    <ellipse cx="122" cy="142" rx="76" ry="6" fill="#000" opacity="0.15"/>
    <path d="M30 116h172c8 0 14 6 12 12s-10 10-20 10H44c-14 0-22-6-20-14 1-4 3-8 6-8z" fill="#2a2a2a"/>
    <path d="M58 116c4-46 16-70 46-74 18-2 28 10 34 32h46c18 2 30 8 34 16v26H58z" fill="${fill}" stroke="${line}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M86 52v36M76 78h26M78 92h24" stroke="${line}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  </svg>`;
}
