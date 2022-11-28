const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
      // get single seller products
      const email = req.query.email;
      const query = { seller_email: email };
      if (email) {
        const result = await productList
          .find(query)
          .sort({ upload_time: -1 })
          .toArray();
        return res.send(result);
      }
      const result = await productList
        .find({})
        .sort({ upload_time: -1 })
        .toArray();
      res.send(result);
    });

    // get only ad product
    app.get("/product/ad", async (req, res) => {
      const query = { ad_status: "ad" };
      const result = await productList.find(query).toArray();
      res.send(result);
    });

    // get  category products
    app.get("/product/category/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await productList.find(query).toArray();
      res.send(result);
    });

    // add a product on advertising
    app.put("/product/:id", async (req, res) => {
      const id = req.params;
      const ad = req.body.ad_status;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ad_status: ad,
        },
      };

      const result = await productList.updateOne(filter, updateDoc, options);

      res.send(result);
    });

    //
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
