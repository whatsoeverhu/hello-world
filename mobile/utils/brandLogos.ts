const BRAND_COLORS: Record<string, string> = {
  'nike': '#111111',
  'adidas': '#000000',
  'zara': '#1a1a1a',
  'h&m': '#e50010',
  'uniqlo': '#FF0000',
  'gap': '#002e5f',
  "levi's": '#c41230',
  'supreme': '#FF0000',
  'gucci': '#234f28',
  'louis vuitton': '#8b6914',
  'prada': '#000000',
  'chanel': '#000000',
  'hermes': '#FF6600',
  'burberry': '#B5A26E',
  'the north face': '#CC0000',
  'patagonia': '#4A7C59',
  'moncler': '#1a1a1a',
  'balenciaga': '#000000',
  'off-white': '#000000',
  'cos': '#000000',
  'massimo dutti': '#1a1a1a',
  'mango': '#c49a6c',
};

export function getBrandColor(brand: string): string {
  const key = brand.toLowerCase();
  return BRAND_COLORS[key] ?? '#7d6b49';
}

export function getBrandInitials(brand: string): string {
  if (!brand) return '?';
  const words = brand.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
