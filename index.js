const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8000;

const uri = "mongodb+srv://DriveFleet:ZJUADVfx032OHhjR@cluster0.yhupfzi.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    
    const db = client.db("driveFleetdb");
    const carsCollection = db.collection("cars");
    
    app.get("/cars", async(req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/cars/:id", async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    app.get("/availableCars", async(req, res) => {
      const query = { available: true };
      const cursor = carsCollection.find(query).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    const bookingsCollection = db.collection("bookings");

    app.post("/bookings", async(req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      
      const carId = booking.carId;
      await carsCollection.updateOne(
        { _id: new ObjectId(carId) },
        { $set: { available: false } }
      );
      
      res.send(result);
    });

    app.get("/bookings", async(req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { userEmail: email };
      }
      const cursor = bookingsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/bookings/:id", async(req, res) => {
      const id = req.params.id;
      const carId = req.query.carId;
      const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (carId) {
        await carsCollection.updateOne(
          { _id: new ObjectId(carId) },
          { $set: { available: true } }
        );
      }
      
      res.send(result);
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});