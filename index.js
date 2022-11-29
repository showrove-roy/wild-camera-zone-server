const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { query } = require("express");
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
    const userList = client.db("wcz-BD").collection("userList");

    // get user role
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userList.findOne(query);
      res.send({ role: user?.role });
    });

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

    // get all users
    app.get("/users", async (req, res) => {
      const userType = req.query.role;
      const query = { role: userType };
      const result = await userList.find(query).toArray();
      res.send(result);
    });

    //verify seller
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const filter2 = { seller_email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          seller_type: "verified",
        },
      };
      const result = await userList.updateOne(filter, updateDoc, options);
      if (result.modifiedCount > 0) {
        const storedUser = await productList.find(filter2).toArray();
        if (storedUser.length > 0) {
          const result2 = await productList.updateMany(
            filter2,
            updateDoc,
            options
          );
          return res.send(result2);
        }
      }
      res.send(result);
    });

    // update user list
    app.post("/users", async (req, res) => {
      const user = req.body;
      const userEmail = user.email;
      const query = { email: userEmail };
      const storedUser = await userList.findOne(query);
      if (storedUser?.email === userEmail) {
        return res.send({ acknowledged: true });
      }
      const result = await userList.insertOne(user);
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
