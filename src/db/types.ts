export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string;
  color?: string;
  sortOrder: number;
  createdAt: string;
}

export interface ClothingItem {
  id: string;
  categoryId: string;
  images: string[]; // base64 data URLs
  coverIndex: number;
  brand: string;
  brandLogoUrl?: string;
  tempRange?: { min: number; max: number };
  price?: number;
  purchaseDate?: string;
  purchaseUrl?: string;
  notes?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandLogo {
  id?: number;
  brand: string;
  logoUrl: string; // base64 data URL
}
