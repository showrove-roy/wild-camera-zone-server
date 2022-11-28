const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DBUSER_NAME}:${process.env.SECRET_KEY}@cluster0.in3ib7y.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const productList = client.db("wcz-BD").collection("productList");

    // add a product
    app.post("/product/add", async (req, res) => {
      const product = req.body;
      const result = await productList.insertOne(product);
      res.send(result);
    });

    // get product
    app.get("/product", async (req, res) => {
      const result = await productList
        .find({})
        .sort({ upload_time: -1 })
        .toArray();
      res.send(result);
    });
  } finally {
  }
};
run().catch(console.dir);

app.get("", (req, res) => {
  res.send("Wild Camera Zone Server Is Running");
});

app.listen(port, () => {
  console.log(`WCZ Server Is Running on Port ${port}`);
});
