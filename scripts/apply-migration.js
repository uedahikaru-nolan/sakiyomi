const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 環境変数から設定を読み込む
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local')
  process.exit(1)
}

// Supabaseクライアントの作成（Service Roleキーを使用）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)

  console.log(`Applying migration: ${migrationFile}`)

  // マイグレーションファイルを読み込む
  const sql = fs.readFileSync(migrationPath, 'utf8')

  // SQLを実行
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

  if (error) {
    console.error(`Error applying migration ${migrationFile}:`, error)
    return false
  }

  console.log(`✓ Migration ${migrationFile} applied successfully`)
  return true
}

async function main() {
  const migrationFile = process.argv[2]

  if (!migrationFile) {
    console.error('Usage: node apply-migration.js <migration-file>')
    console.error('Example: node apply-migration.js 20251215000001_create_course_tables.sql')
    process.exit(1)
  }

  const success = await applyMigration(migrationFile)

  if (!success) {
    process.exit(1)
  }
}

main()
