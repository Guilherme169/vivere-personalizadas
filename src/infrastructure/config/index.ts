export const ENV = {
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '555180889884',
  brandName: import.meta.env.VITE_BRAND_NAME ?? 'Vivere',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
} as const
