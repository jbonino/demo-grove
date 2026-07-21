import "dotenv/config";
import { createApp } from "./app.js";
import { connectDb } from "./db.js";

const port = process.env.GROVE_API_PORT ? Number(process.env.GROVE_API_PORT) : 3001;

const app = createApp({ staticDir: process.env.GROVE_WEB_DIST_PATH });

app.listen(port, () => {
  console.log(`Grove API listening on port ${port}`);
});

// Connect to Mongo in the background so the server binds to the port immediately
// and can serve static assets and health checks without waiting on the Atlas
// TLS handshake. Mongoose buffers queries until the connection is ready, so
// DB-backed routes still work — they just wait for the connection on first hit.
connectDb().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});
