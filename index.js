
import express from "express";
import multer from "multer";
import { create } from "ipfs-http-client";

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY || "my-secret-key";
const PORT = process.env.PORT || 3000;
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// Local IPFS node
const ipfs = create({ url: "http://127.0.0.1:5001" });

function apiKeyAuth(req, res, next) {
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.use(apiKeyAuth);

// Upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { buffer, originalname } = req.file;
    const { cid } = await ipfs.add(buffer);
    await ipfs.pin.add(cid);

    res.json({ success: true, cid: cid.toString(), filename: originalname });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// Cat endpoint
app.get("/cat/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    res.setHeader("Content-Type", "application/octet-stream");

    for await (const chunk of ipfs.cat(cid)) res.write(chunk);
    res.end();
  } catch {
    res.status(404).json({ error: "CID not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 IPFS server running on port ${PORT}`);
});