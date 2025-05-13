const { Client } = require("pg")
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")

// Load environment variables from .env.local if it exists
try {
  const envPath = path.resolve(process.cwd(), ".env.local")
  if (fs.existsSync(envPath)) {
    const envConfig = fs
      .readFileSync(envPath, "utf8")
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"))
      .map((line) => line.split("="))
      .reduce((acc, [key, value]) => {
        acc[key] = value
        return acc
      }, {})

    Object.keys(envConfig).forEach((key) => {
      process.env[key] = envConfig[key]
    })
  }
} catch (error) {
  console.error("Error loading .env.local file:", error)
}

// Database connection configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DATABASE || "postgres", // Connect to default postgres database first
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
}

async function createDatabase() {
  const client = new Client(dbConfig)

  try {
    await client.connect()

    // Check if database exists
    const dbCheckResult = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      process.env.POSTGRES_DATABASE || "bizmatchke",
    ])

    // Create database if it doesn't exist
    if (dbCheckResult.rowCount === 0) {
      console.log(`Creating database: ${process.env.POSTGRES_DATABASE || "bizmatchke"}`)
      await client.query(`CREATE DATABASE ${process.env.POSTGRES_DATABASE || "bizmatchke"}`)
      console.log("Database created successfully")
    } else {
      console.log(`Database ${process.env.POSTGRES_DATABASE || "bizmatchke"} already exists`)
    }
  } catch (error) {
    console.error("Error creating database:", error)
  } finally {
    await client.end()
  }
}

async function setupTables() {
  // Connect to the specific database
  const appDbConfig = {
    ...dbConfig,
    database: process.env.POSTGRES_DATABASE || "bizmatchke",
  }

  const client = new Client(appDbConfig)

  try {
    await client.connect()

    // Read and execute schema SQL
    const schemaPath = path.resolve(process.cwd(), "scripts", "schema.sql")
    const schemaSql = fs.readFileSync(schemaPath, "utf8")

    console.log("Creating tables...")
    await client.query(schemaSql)
    console.log("Tables created successfully")

    // Check if admin user exists
    const adminCheck = await client.query("SELECT 1 FROM users WHERE email = $1", ["admin@bizmatchke.co.ke"])

    // Create admin user if it doesn't exist
    if (adminCheck.rowCount === 0) {
      const passwordHash = await bcrypt.hash("admin123", 10)

      await client.query(
        `INSERT INTO users (name, email, password_hash, is_admin, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        ["Admin User", "admin@bizmatchke.co.ke", passwordHash, true],
      )

      console.log("Admin user created successfully")
    } else {
      console.log("Admin user already exists")
    }

    // Add sample data
    await addSampleData(client)
  } catch (error) {
    console.error("Error setting up tables:", error)
  } finally {
    await client.end()
  }
}

async function addSampleData(client) {
  try {
    // Check if we already have sample data
    const skillsCheck = await client.query("SELECT COUNT(*) FROM skills")

    if (Number.parseInt(skillsCheck.rows[0].count) > 0) {
      console.log("Sample data already exists, skipping...")
      return
    }

    console.log("Adding sample data...")

    // Add skills
    const skills = ["Web Development", "Marketing", "Finance", "Design", "Sales"]
    for (const skill of skills) {
      await client.query("INSERT INTO skills (name, created_at) VALUES ($1, CURRENT_TIMESTAMP)", [skill])
    }

    // Add interests
    const interests = ["Technology", "Health", "Education", "Food", "Fashion"]
    for (const interest of interests) {
      await client.query("INSERT INTO interests (name, created_at) VALUES ($1, CURRENT_TIMESTAMP)", [interest])
    }

    // Add a regular user
    const passwordHash = await bcrypt.hash("user123", 10)
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, bio, location, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      ["John Doe", "john@example.com", passwordHash, "Regular user for testing", "Nairobi"],
    )

    const userId = userResult.rows[0].id

    // Add user skills
    for (let i = 1; i <= 3; i++) {
      await client.query("INSERT INTO user_skills (user_id, skill_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)", [
        userId,
        i,
      ])
    }

    // Add user interests
    for (let i = 1; i <= 3; i++) {
      await client.query(
        "INSERT INTO user_interests (user_id, interest_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)",
        [userId, i],
      )
    }

    // Add resources
    const resources = [
      {
        title: "Business Plan Template",
        description: "A comprehensive business plan template for startups",
        type: "template",
        url: "https://example.com/business-plan",
      },
      {
        title: "Marketing Strategy Guide",
        description: "Learn how to create an effective marketing strategy",
        type: "guide",
        url: "https://example.com/marketing",
      },
    ]

    for (const resource of resources) {
      await client.query(
        `INSERT INTO resources (title, description, type, url, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [resource.title, resource.description, resource.type, resource.url, 1],
      )
    }

    console.log("Sample data added successfully")
  } catch (error) {
    console.error("Error adding sample data:", error)
  }
}

async function main() {
  try {
    await createDatabase()
    await setupTables()
    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  }
}

main()
