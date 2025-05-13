import { Pool, type QueryResult } from "pg"

// Create a connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DATABASE || "bizmatchke",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of clients
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait for a connection
})

// Test the connection on startup
pool
  .connect()
  .then((client) => {
    console.log("Database connection successful")
    client.release()
  })
  .catch((err) => {
    console.error("Database connection error:", err)
  })

// Execute a query with parameters
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  try {
    const result: QueryResult = await pool.query(text, params)
    return result.rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Execute a single query that returns one row
export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const result = await query<T>(text, params)
  return result.length > 0 ? result[0] : null
}

// Execute a transaction
export async function transaction<T = any>(queries: { text: string; params: any[] }[]): Promise<T[][]> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const results: T[][] = []
    for (const { text, params } of queries) {
      const result = await client.query(text, params)
      results.push(result.rows as T[])
    }

    await client.query("COMMIT")
    return results
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Transaction error:", error)
    throw error
  } finally {
    client.release()
  }
}

// Check database connection
export async function checkConnection(): Promise<boolean> {
  try {
    await query("SELECT 1")
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}

// Export the pool for direct access if needed
export const db = {
  query,
  queryOne,
  transaction,
  checkConnection,
  pool,
}
