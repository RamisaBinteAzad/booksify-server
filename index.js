const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
// must write,don't forget
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dydehr7.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const categoryCollection = client.db("booksify").collection("category");
    const usersCollection = client.db("booksify").collection("users");

    app.get("/category", async (req, res) => {
      const query = {};

      const options = await categoryCollection.find(query).toArray();
    //   console.log(options);
      res.send(options);
    });

    //   save users data
    app.post("/users", async (req, res) => {
        const user = req.body;
       console.log(user);
    const query = {
      name: user.name,
      email: user.email,
    };
           console.log(query);
         const alreadyAccount = await usersCollection.find(query).toArray();
        if (alreadyAccount.length) {
          const message = `You already have signed up`;
          // console.log(message);
          return res.send({ acknowledged: false, message });
        }
      const result = await usersCollection
       
        .insertOne(user);
     console.log(result);
     res.send(result);
    });
    //   app.get("/users", async (req, res) => {
    //          const query = {};
    //       const options = await usersCollection.find(query).toArray();
          
   
    //   });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("booksify server is running");
});
app.listen(port, () => {
  console.log(`booksify running on ${port}`);
});
