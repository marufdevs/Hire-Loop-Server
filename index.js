import express from "express";
import "dotenv/config";
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";
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
const jobs = dataBase.collection("jobs");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async(req, res) => {
  const cursor = users.find({});
  const allUsers = await cursor.toArray();
  res.json(allUsers)
});

app.post("/jobs", async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const result = await jobs.insertOne(data);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create job",
      error: error.message,
    });
  }
});

app.get("/jobs", async (req, res) => {
  try {
    const allJobs = await jobs.find({}).sort({ _id: -1 }).toArray();
    return res.json(allJobs);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load jobs",
      error: error.message,
    });
  }
});

app.delete("/jobs/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const result = await jobs.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.json({ message: "Job deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete job",
      error: error.message,
    });
  }
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
