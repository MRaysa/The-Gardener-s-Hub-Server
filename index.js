const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Gardener's Hub Server is running.................");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

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

    // Create tip
    app.post("/tips", async (req, res) => {
      try {
        const tip = req.body;
        const result = await tipsCollection.insertOne(tip);
        res.status(201).json({
          success: true,
          message: "Tip created successfully",
          data: result,
        });
      } catch (error) {
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
          .find({ availability: "Public" })
          .toArray();
        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch public tips",
          error: error.message,
        });
      }
    });

    // Get user's tips
    app.get("/tips/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await tipsCollection
          .find({ "user.email": email })
          .toArray();
        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch user tips",
          error: error.message,
        });
      }
    });

    // Get single tip
    app.get("/tips/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await tipsCollection.findOne({ _id: new ObjectId(id) });
        if (!result) {
          return res.status(404).json({
            success: false,
            message: "Tip not found",
          });
        }
        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch tip",
          error: error.message,
        });
      }
    });

    // read tips FIND
    app.get("/tips", async (req, res) => {
      // const result = await gardenersCollection.find().toArray();
      const cursor = tipsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Update tip
    app.put("/tips/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const tip = req.body;
        const result = await tipsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: tip }
        );
        res.status(200).json({
          success: true,
          message: "Tip updated successfully",
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to update tip",
          error: error.message,
        });
      }
    });

    // Delete tip
    app.delete("/tips/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await tipsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Tip not found",
          });
        }
        res.status(200).json({
          success: true,
          message: "Tip deleted successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to delete tip",
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
