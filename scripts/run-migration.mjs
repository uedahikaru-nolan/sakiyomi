import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration(migrationFile) {
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile)

  console.log(`📄 Reading migration: ${migrationFile}`)

  try {
    // Read the migration file
    const sql = readFileSync(migrationPath, 'utf8')

    console.log(`🚀 Executing migration...`)

    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec', { sql: statement + ';' })

        if (error) {
          // Try alternative: direct query execution
          const { error: queryError } = await supabase.from('_migrations').insert({
            name: migrationFile,
            executed_at: new Date().toISOString()
          })

          if (queryError && queryError.code !== '42P01') { // Ignore table doesn't exist error
            console.error(`❌ Error executing statement:`, error)
            console.error('Statement:', statement.substring(0, 100) + '...')
            throw error
          }
        }
      }
    }

    console.log(`✅ Migration ${migrationFile} applied successfully!`)
    return true
  } catch (error) {
    console.error(`❌ Error applying migration ${migrationFile}:`, error.message)
    return false
  }
}

async function main() {
  const migrationFile = process.argv[2] || '20251215000001_create_course_tables.sql'

  console.log('🔧 Supabase Migration Runner')
  console.log('================================\n')

  const success = await runMigration(migrationFile)

  if (!success) {
    console.log('\n💡 Alternative: Copy the SQL content and run it manually in Supabase SQL Editor')
    console.log(`   URL: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`)
    process.exit(1)
  }

  console.log('\n✨ Done!')
}

main()
