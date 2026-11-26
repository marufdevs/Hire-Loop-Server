import express from "express";
import "dotenv/config";
import cors from 'cors'
import { MongoClient } from "mongodb";
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGDB_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectionClient = await connectToMongoDB();
const dataBase = connectionClient.db("HireLoop");
const users = dataBase.collection("user");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async(req, res) => {
  const cursor = users.find({});
  const allUsers = await cursor.toArray();
  res.json(allUsers)
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
