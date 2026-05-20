const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8000;



const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("driveFleetdb")
    const carsCollection = db.collection("cars")
    const bookingCollection = db.collection("bookings")
    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await carsCollection.findOne(query)
      res.send(result)
    })
    app.get("/availableCars", async (req, res) => {
      const query = { available: true }
      const cursor = carsCollection.find(query).limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get("/bookings/user/:userId", async (req, res) => {
      const userId = req.params.userId
      const query = { userId: userId }
      const cursor = bookingCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.post("/bookings", async (req, res) => {
      const booking = req.body
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});