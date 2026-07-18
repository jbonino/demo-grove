import { createApp } from "./app.js";
import { connectDb } from "./db.js";

const port = process.env.GROVE_API_PORT ? Number(process.env.GROVE_API_PORT) : 3001;

await connectDb();

const app = createApp();

app.listen(port, () => {
  console.log(`Grove API listening on port ${port}`);
});
