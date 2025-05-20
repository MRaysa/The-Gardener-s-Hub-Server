const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.drxhi2b.mongodb.net/gardensdb?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding!");

    const db = client.db("gardensdb");
    const gardenersCollection = db.collection("gardeners");

    // json file add
    const dataPath = path.join(__dirname, "./data/gardenersData.json");
    const jsonData = fs.readFileSync(dataPath, "utf-8");
    const gardeners = JSON.parse(jsonData);

    // Clear existing data - pass empty object instead of array
    console.log("Clearing existing gardeners data...");
    await gardenersCollection.deleteMany({});

    // Insert new data
    console.log("Inserting new gardeners data...");
    const result = await gardenersCollection.insertMany(gardeners);
    console.log(`✅ Successfully seeded ${result.insertedCount} gardeners`);
  } catch (err) {
    console.error("❌ Seeder failed:", err);
  } finally {
    // await client.close();
    // process.exit(0);
  }
}

run().catch(console.error);
