export const LICENSING_CONFIG = {
  storeId: '',
  storeSlug: '',
  products: {
    FolderScope: { productId: 0, variantId: 0, name: 'FolderScope Pro', price: 3 },
  } as Record<string, { productId: number; variantId: number; name: string; price: number }>,
  isDev: import.meta.env.DEV,
  lsApiBase: 'https://api.lemonsqueezy.com/v1',
};
