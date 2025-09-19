import express from "express";
import ViteExpress from "vite-express";
import os from "os";
import dotenv from "dotenv";
import webpush from "web-push"; 
import path from "path";

dotenv.config();

function getLocalIpAddress(): string {
  const nets = os.networkInterfaces();
  let address: string = "";

  for (const name of Object.keys(nets)) {
    const networkInterface = nets[name];
    if (networkInterface) {
      for (const net of networkInterface) {
        if (net.family === "IPv4" && !net.internal) {
          address = `http://${net.address}:3000/`;
        }
      }
    }
  }
  
  return address;
}

const dummyDb = { subscription: null };

let VAPID_PUBLIC = process.env.VAPID_PUBLIC || "";
let VAPID_PRIVATE = process.env.VAPID_PRIVATE || "";


if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  const keys = webpush.generateVAPIDKeys();
  VAPID_PUBLIC = keys.publicKey;
  VAPID_PRIVATE = keys.privateKey;
  console.warn("Generated VAPID keys. For production, set VAPID_PUBLIC and VAPID_PRIVATE in .env");
}


webpush.setVapidDetails("mailto:talk2ved11@gmail.com", VAPID_PUBLIC, VAPID_PRIVATE);



const saveToDatabase = async (subscription: any) => {
  dummyDb.subscription = subscription;
};

const addresses = getLocalIpAddress();
const app = express();
app.use(express.json());

app.get("/api/vapidPublicKey", (_, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

app.post("/save-subscription", async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription || Object.keys(subscription).length === 0) {
      return res.status(400).json({ error: "Invalid subscription object" });
    }
    await saveToDatabase(subscription); 
    res.json({ message: "success" });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/send-notification", (req, res) => {
  const subscription = dummyDb.subscription; 
  const message = "Hello World from server";
  if (!subscription) {
    return res.status(400).json({ error: "No subscription found" });
  }
  webpush.sendNotification(subscription, message);

  res.json({ message: "message sent" });
});

app.get("/api/secrets", async (req, res) => {
  const data = {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
  };
  res.json(data);
});

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

// Serve static files from the "public" directory
app.use(express.static(path.join("public")));



ViteExpress.listen(app, 3000, () =>
  console.log(`Server is listening on port 3000 (http://localhost:3000/ or ${addresses})...`),
);
