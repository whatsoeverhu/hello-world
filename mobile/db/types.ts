export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

export interface ClothingItem {
  id: string;
  categoryId: string;
  images: string[];    // local file URIs
  coverIndex: number;
  brand: string;
  tempMin?: number;
  tempMax?: number;
  price?: number;
  purchaseDate?: string;
  purchaseUrl?: string;
  notes?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
