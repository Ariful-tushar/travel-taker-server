const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ga8wg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("DB connected!");
    const database = client.db("travel-taker");
    const packageCollections = database.collection("packages");
    const ordersCollections = database.collection("orders");

    // GET API
    app.get("/packages", async (req, res) => {
      console.log("DB Connected");
      const cursor = packageCollections.find({});
      const packages = await cursor.toArray();

      res.json(packages);
    });

    // GET SINGLE PACKAGE
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      console.log("hit request for single service", id);
      const query = { _id: ObjectId(id) };
      const package = await packageCollections.findOne(query);
      res.json(package);
    });

    // POST PACKAGES
    app.post("/packages", async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await packageCollections.insertOne(order);
      console.log(result);
      res.send(result);
    });

    // GET MY ORDERS
    app.post("/myorders", async (req, res) => {
      const query = req.body;
      console.log(query);

      const myOrders = await ordersCollections.find(query).toArray();

      res.json(myOrders);
    });

    // GET ALL ORDERS
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollections.find({});
      const orders = await cursor.toArray();

      res.json(orders);
    });

    // DELETE ORDERS
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await ordersCollections.deleteOne(query);
      res.json(result);
    });

    // POST ORDERS
    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log(order);

      const result = await ordersCollections.insertOne(order);
      console.log(result);
      res.send(result);
    });

    // UPDATE ORDER STATUS
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatestatus = req.body;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatestatus.status,
        },
      };
      const result = await ordersCollections.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running server on port");
});

app.listen(port, () => {
  console.log("Running server on port", port);
});
