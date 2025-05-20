const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.drxhi2b.mongodb.net/gardensdb?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function seedTips() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for tips seeding!");

    const db = client.db("gardensdb");
    const tipsCollection = db.collection("tips");

    // Complete sample tips data (6 items)
    const tips = [
      {
        title: "How to Grow Tomatoes in Containers",
        content:
          "Choose a large pot (at least 5 gallons) with good drainage and use quality potting mix. Water consistently to keep soil moist but not soggy. Provide 6-8 hours of sunlight daily and use tomato cages for support as the plant grows. Fertilize every 2 weeks with a balanced fertilizer.",
        category: "Vegetables",
        views: 1250,
        likes: 342,
        author: "Sarah Green",
        authorId: "682c9c00841cfcfc21d72e02",
        createdAt: new Date("2023-05-10"),
        updatedAt: new Date("2023-06-15"),
        difficulty: "Intermediate",
        trending: true,
        tags: ["container gardening", "tomatoes", "urban gardening"],
      },
      {
        title: "Best Companion Plants for Roses",
        content:
          "Lavender, garlic, and marigolds make excellent companion plants for roses. Lavender deters aphids, garlic repels Japanese beetles, and marigolds discourage nematodes. Plant these companions 12-18 inches from your roses for best results while ensuring good air circulation.",
        category: "Flowers",
        views: 980,
        likes: 215,
        author: "John Bloom",
        authorId: "682c9c00841cfcfc21d72e03",
        createdAt: new Date("2023-04-15"),
        updatedAt: new Date("2023-05-20"),
        difficulty: "Beginner",
        trending: true,
        tags: ["roses", "companion planting", "pest control"],
      },
      {
        title: "Organic Pest Control for Vegetable Gardens",
        content:
          "For a natural approach: 1) Use neem oil spray for aphids and mites. 2) Sprinkle diatomaceous earth around plants for slugs and snails. 3) Plant basil near tomatoes to repel hornworms. 4) Introduce ladybugs to control aphids. Always apply treatments in early morning or late evening to avoid harming beneficial insects.",
        category: "Organic Gardening",
        views: 1560,
        likes: 428,
        author: "Maria Rodriguez",
        authorId: "682c9c00841cfcfc21d72e04",
        createdAt: new Date("2023-03-22"),
        updatedAt: new Date("2023-04-30"),
        difficulty: "Intermediate",
        trending: true,
        tags: ["pest control", "organic", "vegetables"],
      },
      {
        title: "Watering Tips for Succulents",
        content:
          "Succulents need 'soak and dry' watering: 1) Water thoroughly until it drains from the bottom. 2) Wait until soil is completely dry before watering again (typically 1-2 weeks). 3) Reduce watering in winter (every 3-4 weeks). 4) Use pots with drainage holes and well-draining soil mix (50% potting soil, 50% perlite).",
        category: "Succulents",
        views: 870,
        likes: 195,
        author: "David Kim",
        authorId: "682c9c00841cfcfc21d72e05",
        createdAt: new Date("2023-06-05"),
        updatedAt: new Date("2023-07-12"),
        difficulty: "Beginner",
        trending: true,
        tags: ["succulents", "watering", "indoor plants"],
      },
      {
        title: "Creating a Pollinator-Friendly Garden",
        content:
          "Attract bees, butterflies, and hummingbirds with: 1) Native flowering plants (milkweed, coneflowers, bee balm). 2) Continuous bloom from spring to fall. 3) Shallow water sources with stones for perching. 4) Avoid pesticides. 5) Leave some bare ground for ground-nesting bees. Cluster plants in groups of 3-5 for better visibility to pollinators.",
        category: "Eco Gardening",
        views: 1120,
        likes: 376,
        author: "Emma Wilson",
        authorId: "682c9c00841cfcfc21d72e06",
        createdAt: new Date("2023-02-18"),
        updatedAt: new Date("2023-03-25"),
        difficulty: "Beginner",
        trending: true,
        tags: ["pollinators", "wildlife", "eco-friendly"],
      },
      {
        title: "Winterizing Your Herb Garden",
        content:
          "To protect herbs in winter: 1) Bring tender herbs (basil, rosemary) indoors near sunny windows. 2) Mulch hardy herbs (thyme, sage) with 2-3 inches of straw. 3) Cut back perennials by 1/3 after first frost. 4) Cover plants with burlap during extreme cold snaps. 5) Reduce watering but don't let soil completely dry out. Harvest sparingly in winter to avoid stressing plants.",
        category: "Herbs",
        views: 1340,
        likes: 289,
        author: "James Peterson",
        authorId: "682c9c00841cfcfc21d72e07",
        createdAt: new Date("2023-01-10"),
        updatedAt: new Date("2023-02-15"),
        difficulty: "Intermediate",
        trending: true,
        tags: ["herbs", "winter care", "seasonal"],
      },
    ];

    // Clear existing data
    await tipsCollection.deleteMany({});

    // Insert new data
    const result = await tipsCollection.insertMany(tips);
    console.log(`✅ Successfully seeded ${result.insertedCount} tips`);

    // Create indexes for better performance
    await tipsCollection.createIndex({ category: 1 });
    await tipsCollection.createIndex({ views: -1 });
    await tipsCollection.createIndex({ trending: 1 });
    await tipsCollection.createIndex({ tags: 1 });
    console.log("Created database indexes for optimal performance");
  } catch (err) {
    console.error("❌ Tips seeder failed:", err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedTips();
