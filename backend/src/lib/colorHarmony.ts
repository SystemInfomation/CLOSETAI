// Color Harmony Engine - CIEDE2000-inspired scoring
// Converts hex to HSL and computes harmony scores

export interface HarmonyResult {
  score: number; // 0-100
  type: string; // complementary, analogous, triadic, etc.
  explanation: string;
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

// Contrast ratio calculation (WCAG-based)
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRGB(hex1);
  const rgb2 = hexToRGB(hex2);
  const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Fair cool-undertone skin compatibility (avoid warm yellows, favor cool tones)
function skinToneScore(hex: string): number {
  const hsl = hexToHSL(hex);
  // Penalize warm yellows/oranges on fair cool skin
  if (hsl.h >= 40 && hsl.h <= 65 && hsl.s > 50) return 40; // Yellow - looks washed out
  if (hsl.h >= 25 && hsl.h <= 40 && hsl.s > 60) return 50; // Orange - not great
  // Boost cool tones (blues, purples, cool greens)
  if (hsl.h >= 180 && hsl.h <= 300) return 95; // Cool spectrum - excellent
  // Neutrals are always good
  if (hsl.s < 15) return 85; // Grays, blacks, whites
  // Reds can be good if cool-toned
  if (hsl.h >= 330 || hsl.h <= 15) return 80;
  return 70; // Default decent score
}

export function computeHarmony(hoodieHex: string, shortsHex: string): HarmonyResult {
  const hsl1 = hexToHSL(hoodieHex);
  const hsl2 = hexToHSL(shortsHex);
  
  const hueDiff = Math.abs(hsl1.h - hsl2.h);
  const normalizedDiff = hueDiff > 180 ? 360 - hueDiff : hueDiff;
  
  let harmonyType = 'neutral';
  let baseScore = 60;
  
  // Determine harmony type and base score
  if (normalizedDiff <= 30) {
    harmonyType = 'analogous';
    baseScore = 78;
  } else if (normalizedDiff >= 150 && normalizedDiff <= 210) {
    harmonyType = 'complementary';
    baseScore = 88;
  } else if (normalizedDiff >= 110 && normalizedDiff <= 140) {
    harmonyType = 'triadic';
    baseScore = 82;
  } else if (normalizedDiff >= 60 && normalizedDiff <= 90) {
    harmonyType = 'split-complementary';
    baseScore = 75;
  }
  
  // Monochrome bonus
  if (normalizedDiff < 10 && Math.abs(hsl1.l - hsl2.l) > 20) {
    harmonyType = 'monochrome';
    baseScore = 85;
  }
  
  // Neutral pairing bonus (grays/blacks with anything = safe)
  if (hsl1.s < 10 || hsl2.s < 10) {
    baseScore = Math.max(baseScore, 80);
    harmonyType = hsl1.s < 10 && hsl2.s < 10 ? 'neutral-neutral' : 'neutral-accent';
  }
  
  // Contrast bonus (some contrast between top and bottom is good)
  const contrast = contrastRatio(hoodieHex, shortsHex);
  const contrastBonus = Math.min(contrast * 3, 15);
  
  // Skin tone compatibility
  const skinScore = (skinToneScore(hoodieHex) + skinToneScore(shortsHex)) / 2;
  const skinBonus = (skinScore - 70) * 0.2;
  
  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore + contrastBonus + skinBonus)));
  
  const explanations: Record<string, string> = {
    'complementary': 'Complementary colors create maximum visual impact',
    'analogous': 'Analogous palette for a smooth, cohesive vibe',
    'triadic': 'Triadic harmony hits different with balanced energy',
    'split-complementary': 'Split-complementary for subtle contrast',
    'monochrome': 'Monochrome layers = clean and sophisticated',
    'neutral-accent': 'Neutral base lets the accent color pop hard',
    'neutral-neutral': 'All-neutral fits are timeless and versatile',
    'neutral': 'Solid color pairing with good balance'
  };
  
  return {
    score: finalScore,
    type: harmonyType,
    explanation: explanations[harmonyType] || 'Nice color combination'
  };
}

export function generateDripScore(harmonyScore: number, varietyBonus: number = 0): number {
  return Math.min(100, Math.round(harmonyScore * 0.7 + varietyBonus * 0.3 + Math.random() * 5));
}

export function generateStyleExplanation(
  _hoodieHex: string, 
  _shortsHex: string, 
  harmonyResult: HarmonyResult,
  dayOfWeek: string
): string {
  const vibes: Record<string, string[]> = {
    'Monday': ['fresh start energy', 'school drip'],
    'Tuesday': ['mid-week flex', 'low-key fire'],
    'Wednesday': ['hump day heat', 'peak performance'],
    'Thursday': ['almost-weekend energy', 'effortless cool'],
    'Friday': ['weekend preview', 'main character energy'],
    'Saturday': ['full casual flex', 'hangout certified'],
    'Sunday': ['recovery day clean', 'chill mode activated']
  };
  
  const dayVibes = vibes[dayOfWeek] || ['everyday drip', 'locked in'];
  const vibe = dayVibes[Math.floor(Math.random() * dayVibes.length)];
  
  const hypeLines = [
    `This ${harmonyResult.type} combo is absolutely unmatched. ${harmonyResult.explanation} and on a ${dayOfWeek}? That's ${vibe} energy right there.`,
    `Yo James, this fit goes crazy. The ${harmonyResult.type} pairing gives off pure ${vibe} vibes. ${harmonyResult.explanation}. You're about to be the best-dressed in the building.`,
    `${harmonyResult.explanation}. This ${dayOfWeek} fit is giving ${vibe} and honestly nobody's touching this drip. Harmony score: ${harmonyResult.score}/100.`,
  ];
  
  const motivational = [
    "Walk in like you own the place, king. 👑",
    "Atlanta's best-dressed and it's not even close. 🔥",
    "Confidence is the best accessory, and you've got it locked. 💯",
    "This fit? Certified heat. No debate. 🏀"
  ];
  
  return hypeLines[Math.floor(Math.random() * hypeLines.length)] + ' ' + 
         motivational[Math.floor(Math.random() * motivational.length)];
}
