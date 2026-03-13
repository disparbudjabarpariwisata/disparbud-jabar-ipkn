require('dotenv').config();
const { Client } = require('pg');

const postgresUrl = process.env.DATABASE_URL;

if (!postgresUrl) {
  console.error("Missing DATABASE_URL in .env file.");
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString: postgresUrl,
  });

  try {
    await client.connect();
    console.log("Connected to Postgres.");
    
    await client.query('ALTER TABLE public.data_map ADD COLUMN IF NOT EXISTS desa_wisata_data JSONB;');
    await client.query('COMMENT ON COLUMN public.data_map.desa_wisata_data IS "Aggregated data of tourism villages (Desa Wisata) for each city/kabupaten.";');
    
    // Attempt to reload PostgREST schema cache
    try {
      await client.query('NOTIFY pgrst, "reload schema";');
      console.log("Notified PostgREST to reload schema.");
    } catch (e) {
      console.warn("Could not notify PostgREST:", e.message);
    }

    console.log("Column added successfully.");
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

run();
