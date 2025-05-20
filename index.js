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
  res.send("server is running................");
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db("gardensdb").collection("users");
    // start APIs backend

    // User related all database APIs

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
      const result = await coffeesCollection.findOne(query);
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
