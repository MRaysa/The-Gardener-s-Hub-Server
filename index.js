const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// ========== ROOT ROUTE ========== //
app.get("/", (req, res) => {
  res.send("Gardener's Hub Server is running.................");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

// MongoDB Connection
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-3fq34gd-shard-00-00.drxhi2b.mongodb.net:27017,ac-3fq34gd-shard-00-01.drxhi2b.mongodb.net:27017,ac-3fq34gd-shard-00-02.drxhi2b.mongodb.net:27017/?ssl=true&replicaSet=atlas-h89j0u-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

MongoClient.connect(uri, function (err, client) {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database collections
let userCollection;
let gardenersCollection;
let tipsCollection;

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // const userCollection = client.db("gardensdb").collection("users");
    // const gardenersCollection = db.collection("gardeners");

    // Initialize collections
    const db = client.db("gardensdb");
    userCollection = db.collection("users");
    gardenersCollection = db.collection("gardeners");
    tipsCollection = db.collection("tips");

    // start APIs backend

    //  ========== ✅ Get 6 active gardeners  ==========
    app.get("/gardeners/active", async (req, res) => {
      try {
        const result = await gardenersCollection
          .find({ status: "active" })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Failed to fetch gardeners:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // read gardeners FIND
    app.get("/gardeners", async (req, res) => {
      // const result = await gardenersCollection.find().toArray();
      const cursor = gardenersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // ========== USERS API ENDPOINTS ========== //

    // read user FIND
    app.get("/users", async (req, res) => {
      // const result = await userCollection.find().toArray();
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Read  specific id-------- Find
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // user create
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // update using patch because we have to update just one........ here options hoba na karon overall data put kortachina tai
    app.patch("/users", async (req, res) => {
      console.log(req.body);
      const { email, lastSignInTime } = req.body;
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          lastSignInTime: lastSignInTime,
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Delete user from db
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // ========== TIPS API ENDPOINTS ========== //

    app.get("/tips", async (req, res) => {
      // const result = await tipsCollection.find().toArray();
      const cursor = tipsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Create new tip
    app.post("/tips", async (req, res) => {
      try {
        const tip = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
          likes: 0,
        };

        const result = await tipsCollection.insertOne(tip);

        res.status(201).json({
          success: true,
          message: "Tip created successfully",
          data: result,
        });
      } catch (error) {
        console.error("Failed to create tip:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create tip",
          error: error.message,
        });
      }
    });

    // Get all public tips
    app.get("/tips/public", async (req, res) => {
      try {
        const result = await tipsCollection
          .find({
            $or: [{ availability: "Public" }, { availability: "public" }],
          })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error("Failed to fetch public tips:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch public tips",
        });
      }
    });

    // Get tips by user email
    app.get("/tips/user/:email", async (req, res) => {
      try {
        const result = await tipsCollection
          .find({ "author.email": req.params.email })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error("Failed to fetch user tips:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch user tips",
        });
      }
    });

    // Get single tip by ID
    app.get("/tips/:id", async (req, res) => {
      try {
        const tip = await tipsCollection.findOne({
          _id: new ObjectId(req.params.id),
        });

        if (!tip) {
          return res.status(404).json({
            success: false,
            message: "Tip not found",
          });
        }

        res.json({
          success: true,
          data: tip,
        });
      } catch (error) {
        console.error("Failed to fetch tip:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch tip",
        });
      }
    });

    // Update tip
    app.put("/tips/:id", async (req, res) => {
      try {
        const updatedTip = {
          ...req.body,
          updatedAt: new Date(),
        };

        const result = await tipsCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: updatedTip }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Tip not found",
          });
        }

        res.json({
          success: true,
          message: "Tip updated successfully",
          data: result,
        });
      } catch (error) {
        console.error("Failed to update tip:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update tip",
        });
      }
    });

    // Delete tip
    app.delete("/tips/:id", async (req, res) => {
      try {
        const result = await tipsCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Tip not found",
          });
        }

        res.json({
          success: true,
          message: "Tip deleted successfully",
        });
      } catch (error) {
        console.error("Failed to delete tip:", error);
        res.status(500).json({
          success: false,
          message: "Failed to delete tip",
        });
      }
    });

    // Like a tip
    app.patch("/tips/:id/like", async (req, res) => {
      try {
        const result = await tipsCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $inc: { totalLiked: 1 } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Tip not found",
          });
        }

        res.json({
          success: true,
          message: "Tip liked successfully",
        });
      } catch (error) {
        console.error("Failed to like tip:", error);
        res.status(500).json({
          success: false,
          message: "Failed to like tip",
        });
      }
    });

    // Get top trending tips (most liked)
    app.get("/tip/trend", async (req, res) => {
      try {
        if (!tipsCollection) {
          return res.status(500).json({
            success: false,
            message: "Database not connected",
          });
        }

        const result = await tipsCollection
          .find({ availability: "Public" })
          .sort({ totalLiked: -1 })
          .limit(6)
          .toArray();

        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error("Failed to fetch trending tips:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch trending tips",
          error: error.message,
        });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
