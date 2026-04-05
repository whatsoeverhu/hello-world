// Known brand -> logo URL mapping (using public CDN where available)
// Fallback: display initials badge

export interface BrandInfo {
  name: string;
  color: string; // background color for initials badge
}

// Color mapping for brand initials badges
const BRAND_COLORS: Record<string, string> = {
  'Nike': '#111111',
  'Adidas': '#000000',
  'Zara': '#1a1a1a',
  'H&M': '#e50010',
  'Uniqlo': '#FF0000',
  'Gap': '#002e5f',
  'Levi\'s': '#c41230',
  'Supreme': '#FF0000',
  'Gucci': '#234f28',
  'Louis Vuitton': '#8b6914',
  'Prada': '#000000',
  'Chanel': '#000000',
  'Hermes': '#FF6600',
  'Burberry': '#B5A26E',
  'Versace': '#C9A84C',
  'Balenciaga': '#000000',
  'Off-White': '#000000',
  'Stone Island': '#333333',
  'The North Face': '#CC0000',
  'Patagonia': '#4A7C59',
  'Arc\'teryx': '#333333',
  'Canada Goose': '#CC0000',
  'Moncler': '#1a1a1a',
  'Vetements': '#000000',
  'Acne Studios': '#000000',
  'COS': '#000000',
  'Massimo Dutti': '#1a1a1a',
  'Mango': '#c49a6c',
};

export function getBrandColor(brand: string): string {
  if (!brand) return '#9d8860';
  const key = Object.keys(BRAND_COLORS).find(k => k.toLowerCase() === brand.toLowerCase());
  return key ? BRAND_COLORS[key] : '#7d6b49';
}

export function getBrandInitials(brand: string): string {
  if (!brand) return '?';
  const words = brand.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
