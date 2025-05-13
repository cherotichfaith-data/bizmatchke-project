// Adapter to maintain compatibility with existing code
import {
  query as executeQueryDirect,
  queryOne,
  transaction as executeTransactionDirect,
  checkConnection,
} from "./db-client"

// Helper function for raw SQL queries with parameters
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
  try {
    const result = await executeQueryDirect<T>(query, params)
    return result as T
  } catch (error: any) {
    console.error(`Database query error:`, error)
    throw new Error(`Database query error: ${error?.message || "Unknown error"}`)
  }
}

// Helper function for raw SQL queries with tagged template literals
export async function executeRawQuery<T = any>(query: string, ...values: any[]): Promise<T> {
  // Convert to standard parameterized query
  const { text, values: params } = convertToParameterized(query, values)
  return executeQuery<T>(text, params)
}

// Helper function to convert a tagged template to a parameterized query
function convertToParameterized(query: string, values: any[]) {
  let paramIndex = 1
  let parameterized = query
  const params: any[] = []

  // Replace ${value} with $1, $2, etc.
  values.forEach((value) => {
    const placeholder = `$${paramIndex}`
    parameterized = parameterized.replace(/\$\{\}/, placeholder)
    params.push(value)
    paramIndex++
  })

  return { text: parameterized, values: params }
}

// Helper function to execute a transaction with multiple queries
export async function executeTransaction<T = any>(queries: { query: string; params: any[] }[]): Promise<T[]> {
  try {
    const formattedQueries = queries.map(({ query, params }) => ({
      text: query,
      params,
    }))

    const results = await executeTransactionDirect(formattedQueries)
    return results.flat() as T[]
  } catch (error: any) {
    console.error(`Transaction error:`, error)
    throw new Error(`Transaction error: ${error?.message || "Unknown error"}`)
  }
}

// Check if the database is available
export async function checkDatabaseConnection(): Promise<boolean> {
  return checkConnection()
}

// For backward compatibility with existing code
export const sql = {
  query: executeQuery,
}

// Mock getDb for backward compatibility
export function getDb() {
  return {
    query: executeQuery,
    one: queryOne,
    oneOrNone: queryOne,
    many: executeQuery,
    manyOrNone: executeQuery,
    none: async () => null,
    tx: async (cb: any) => {
      // Simple transaction implementation
      return cb({
        query: executeQuery,
        one: queryOne,
        oneOrNone: queryOne,
        many: executeQuery,
        manyOrNone: executeQuery,
        none: async () => null,
      })
    },
  }
}
