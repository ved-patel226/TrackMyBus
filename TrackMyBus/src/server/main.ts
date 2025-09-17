import express from "express";
import ViteExpress from "vite-express";
import os from "os";
import dotenv from "dotenv";

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

const addresses = getLocalIpAddress();

const app = express();

app.get("/api/secrets", async (req, res) => {
  const data = {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
  };
  res.json(data);
});

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

ViteExpress.listen(app, 3000, () =>
  console.log(`Server is listening on port 3000 (http://localhost:3000/ or ${addresses})...`),
);
