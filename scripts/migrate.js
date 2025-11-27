const { Client } = require("pg")
const fs = require("fs")
const path = require("path")

// Import environment variables (convert to CommonJS)
const createEnv = require("@t3-oss/env-nextjs").createEnv
const z = require("zod")

// Define env schema for migration script
const env = createEnv({
  server: {
    POSTGRES_URL: z.string().url(),
  },
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})

const connectionString = env.POSTGRES_URL

if (!connectionString) {
  console.error("Missing POSTGRES_URL environment variable")
  process.exit(1)
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function runMigration() {
  try {
    await client.connect()
    console.log("Connected to database")

    const sqlPath = path.join(__dirname, "01_schema.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    console.log("Running migration...")
    await client.query(sql)
    console.log("Migration completed successfully")
  } catch (err) {
    console.error("Migration failed:", err)
  } finally {
    await client.end()
  }
}

runMigration()
