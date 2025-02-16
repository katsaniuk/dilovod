export type Person = {
  id: number;
  name: string;
  phone: string;
};

export type Product = {
  id: number;
  code: string;
  parentCode?: string;
  price?: string;
};

export type ProductWithPrice = Omit<Product, 'price'> & {
  price: number;
};
