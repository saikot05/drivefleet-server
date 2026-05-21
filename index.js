const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8000;



const uri = process.env.MONGODB_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const logger = (req, res, next) => {
  console.log(`${req.method} | ${req.url}`)
  next();
}
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)
const verifytoken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" })
  }
  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    console.log(error)
    res.status(401).send({ message: "Unauthorized" })
  }


}

async function run() {
  try {
    //await client.connect();

    const db = client.db("driveFleetdb")
    const carsCollection = db.collection("cars")
    const bookingCollection = db.collection("bookings")
    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/cars', async (req, res) => {
      try {
        console.log('data in the request:', req.body);
        const newCar = req.body;

        if (!newCar.make || !newCar.model || !newCar.price_per_day) {
          return res.status(400).send({
            success: false,
            message: "Missing required fields (make, model, or price_per_day)"
          });
        }

        newCar.available = true;
        if (!newCar.created_at) {
          newCar.created_at = new Date().toISOString();
        }

        const result = await carsCollection.insertOne(newCar);

        res.send({
          success: true,
          data: result,
          message: "Car added successfully"
        });
      } catch (error) {
        console.error('Error adding car:', error);
        res.status(500).send({
          success: false,
          message: "An error occurred while adding the car",
          error: error.message
        });
      }
    })

    app.get("/cars/owner/:email", async (req, res) => {
      const email = req.params.email;
      const query = { addedBy: email };
      const cursor = carsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.put("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        delete updatedData._id;


        if (updatedData.year) updatedData.year = Number(updatedData.year);
        if (updatedData.price_per_day) updatedData.price_per_day = Number(updatedData.price_per_day);
        if (updatedData.seats) updatedData.seats = Number(updatedData.seats);
        if (updatedData.mileage) updatedData.mileage = Number(updatedData.mileage);
        if (updatedData.horsepower) updatedData.horsepower = Number(updatedData.horsepower);

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: updatedData,
        };
        const result = await carsCollection.updateOne(filter, updateDoc);
        res.send({ success: true, result });
      } catch (error) {
        console.error("Error updating car:", error);
        res.status(500).send({ success: false, error: error.message });
      }
    });

    app.delete("/cars/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await carsCollection.deleteOne(query);
        res.send({ success: true, result });
      } catch (error) {
        console.error("Error deleting car:", error);
        res.status(500).send({ success: false, error: error.message });
      }
    });


    app.get("/cars/:id", logger, verifytoken,
      async (req, res) => {
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
    app.post("/bookings", verifytoken, async (req, res) => {
      const booking = req.body
      const result = await bookingCollection.insertOne(booking)

      const carId = booking.carId
      if (carId) {
        await carsCollection.updateOne(
          { _id: new ObjectId(carId) },
          { $set: { available: false } }
        )
      }
      res.send(result)
    })

    app.get("/bookings", verifytoken, async (req, res) => {
      const email = req.query.email
      let query = {}
      if (email) {
        query = { userEmail: email }
      }
      const cursor = bookingCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id
      const carId = req.query.carId
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)

      if (carId) {
        await carsCollection.updateOne(
          { _id: new ObjectId(carId) },
          { $set: { available: true } }
        )
      }
      res.send(result)
    })

    //await client.db("admin").command({ ping: 1 });
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