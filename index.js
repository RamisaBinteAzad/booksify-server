 const express = require("express");
 const cors = require("cors");
 const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
 const jwt = require("jsonwebtoken");
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

 // middlewire
 function verifyJWT(req, res, next) {
   console.log("tokenJWT", req.headers.authorization);
   const authHeader = req.headers.authorization;
   if (!authHeader) {
     return res.status(401).send("UnAuthorized Access");
   }

   const token = authHeader.split(" ")[1];
   jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
     if (err) {
       return res.status(403).send({ message: "Forbidden Access" });
     }
     req.decoded = decoded;
     next();
   });
 }

 async function run() {
   try {
     const categoryCollection = client.db("booksify").collection("category");
     const usersCollection = client.db("booksify").collection("users");
     const productsCollection = client.db("booksify").collection("products");
        const bookingsCollection = client.db("booksify").collection("bookings");
    
    //  const sellerproductsCollection = client
    //    .db("booksify")
    //    .collection("sellerproducts");

     app.get("/category", async (req, res) => {
       const query = {};

       const options = await categoryCollection.find(query).toArray();
       console.log(options);
       res.send(options);
     });

     //  app.get("/users", async (req, res) => {
     //    const query = {};

     //    const options = await usersCollection.find(query).toArray();
     //    console.log(options);
     //    res.send(options);
     //  });
     app.get("/jwt", async (req, res) => {
       const email = req.query.email;
       // user already users database e ache kina seta check kore dekhte hobe
       const query = { email: email };
       const user = await usersCollection.findOne(query);
       // users database theke user er sab details pabo
       // console.log(user);
       // res.send({ accessToken:'token'});

       if (user) {
         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
           expiresIn: "21d",
         });
         return res.send({ accessToken: token });
       }
       res.status(403).send({ accessToken: "" });
     });
     //   save users data
     app.post("/users", async (req, res) => {
       const user = req.body;
       console.log(user);
       const query = {
         email: user.email,
       };
      //  console.log(query);
       const alreadyAccount = await usersCollection.find(query).toArray();
       if (alreadyAccount.length) {
         const message = `You already have signed up`;
         // console.log(message);
         return res.send({ acknowledged: false, message });
       }
       const result = await usersCollection.insertOne(user);
      //  console.log(result);
       res.send(result);
     });
     // check seller
     app.get("/users/seller/:email", async (req, res) => {
       const email = req.params.email;
       const query = { email };
       const user = await usersCollection.findOne(query);
      //  console.log(user);
       res.send({ isSeller: user?.role === "Seller" });
     });

     app.post("/products", async (req, res) => {
       const product = req.body;
       const result = await productsCollection.insertOne(product);
       res.send(result);
     });
      
        app.get("/products", async (req, res) => {
          const query = {};
          const result = await productsCollection.find(query).toArray();
          console.log(result);
          res.send(result );
        });
     
      // category wise product
     app.get("/products/:id", async (req, res) => {
       const id = req.params.id;
      
       const categoryQuery = { categoryId:id };
       
       const categoryWiseProduct = await productsCollection
         .find(categoryQuery)
         .toArray();
       console.log(categoryWiseProduct);
       //
       res.send(categoryWiseProduct);
     });
      app.post("/bookings", async (req, res) => {
        const booking = req.body;
        console.log(booking);
       
        const result = await bookingsCollection.insertOne(booking);
        console.log(result);
        res.send(result);
      });

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