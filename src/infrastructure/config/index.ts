export const ENV = {
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '555180889884',
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD ?? 'vivere1213',
  brandName: import.meta.env.VITE_BRAND_NAME ?? 'Vivere',
} as const
