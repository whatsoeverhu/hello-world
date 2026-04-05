import { getBrandColor, getBrandInitials } from '../../utils/brandLogos';
import { db } from '../../db/database';
import { useEffect, useState } from 'react';

interface Props {
  brand: string;
  size?: number;
}

export function BrandBadge({ brand, size = 36 }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!brand) return;
    db.brandLogos.where('brand').equalsIgnoreCase(brand).first().then(logo => {
      if (logo) setLogoUrl(logo.logoUrl);
    });
  }, [brand]);

  const bgColor = getBrandColor(brand);
  const initials = getBrandInitials(brand);

  return (
    <div
      className="rounded-lg overflow-hidden flex items-center justify-center shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: logoUrl ? 'rgba(255,255,255,0.85)' : bgColor,
        backdropFilter: 'blur(4px)',
      }}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={brand} className="w-full h-full object-contain p-1" />
      ) : (
        <span
          className="font-bold text-white leading-none"
          style={{ fontSize: size * 0.35 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
