/**
 * Seed script — populates the Supabase `ingredients` table from catalog.seed.json.
 * Idempotent: uses upsert on external_id.
 *
 * Prerequisites in .env.local:
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 *   SUPABASE_ADMIN_EMAIL=guilherme.buhler@birdie.ai   (optional, default above)
 *   SUPABASE_ADMIN_PASSWORD=<your-password>
 *
 * Run from project root:
 *   npx tsx scripts/seed-supabase.ts
 */

import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------
function loadDotEnv() {
  const path = '.env.local'
  if (!existsSync(path)) return
  readFileSync(path, 'utf-8')
    .split('\n')
    .forEach(line => {
      const m = /^([^#\s][^=]*)=(.*)/.exec(line.trim())
      if (m) process.env[m[1].trim()] = m[2].trim()
    })
}
loadDotEnv()

// ---------------------------------------------------------------------------
// Validate env
// ---------------------------------------------------------------------------
const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const adminEmail = process.env.SUPABASE_ADMIN_EMAIL ?? 'guilherme.buhler@birdie.ai'
const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD

if (!url || !anonKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}
if (!adminPassword) {
  console.error('❌ Missing SUPABASE_ADMIN_PASSWORD in .env.local')
  console.error('   Add: SUPABASE_ADMIN_PASSWORD=<your-password>')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Load seed
// ---------------------------------------------------------------------------
const catalog = JSON.parse(
  readFileSync('./src/infrastructure/seed/catalog.seed.json', 'utf-8')
) as {
  ingredients: Array<{
    id: string
    name: string
    category: string
    pricePerKg: number
    baseYield: number
    preparations: unknown[]
    dietFlags: string[]
  }>
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const supabase = createClient(url, anonKey)

async function main() {
  // Sign in as admin to get authenticated session (required by RLS)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword!,
  })
  if (authError) {
    console.error('❌ Auth error:', authError.message)
    process.exit(1)
  }
  console.log(`✓ Signed in as ${adminEmail}`)

  // Build rows
  const rows = catalog.ingredients.map((ing, i) => ({
    external_id: ing.id,
    name: ing.name,
    category: ing.category,
    price_per_kg: ing.pricePerKg,
    base_yield: ing.baseYield,
    preparations: ing.preparations,
    diet_flags: ing.dietFlags,
    active: true,
    position: i,
  }))

  // Upsert
  const { error } = await supabase
    .from('ingredients')
    .upsert(rows, { onConflict: 'external_id' })

  if (error) {
    console.error('❌ Upsert error:', error.message)
    process.exit(1)
  }

  console.log(`✓ Upserted ${rows.length} ingredients`)
  console.log('Done! 🎉')
}

main().catch(err => {
  console.error('❌', err)
  process.exit(1)
})
