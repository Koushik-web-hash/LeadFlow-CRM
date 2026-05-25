// ===========================
// LEAD CRM — server.js
// Node.js + Express + MongoDB
// ===========================

// 1. Import required packages
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

// 2. Create the Express app
const app = express();

// 3. Middlewares
app.use(cors());              // Allow requests from any origin (frontend)
app.use(express.json());      // Parse incoming JSON request bodies

// ── MongoDB Connection ─────────────────────────────
const MONGO_URI =
  "YOUR MONGODB_ATLAS_CONNECTION_STRING_HERE";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));


// ── Lead Schema & Model ────────────────────────────
const leadSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true
  }
);

const Lead = mongoose.model("Lead", leadSchema);


// ── API Routes ─────────────────────────────────────

// POST /leads → Save a new lead
app.post("/leads", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newLead = new Lead({ name, email, message });
    const saved   = await newLead.save();

    res.status(201).json(saved);
    console.log("📩 New lead saved:", saved.name);

  } catch (error) {
    console.error("Save error:", error.message);
    res.status(500).json({ message: "Server error. Could not save lead." });
  }
});


// GET /leads → Fetch all leads (supports ?search=query)
app.get("/leads", async (req, res) => {
  try {
    const search = req.query.search || "";

    // If search query exists, filter by name, email, or message
    const filter = search
      ? {
          $or: [
            { name:    { $regex: search, $options: "i" } },
            { email:   { $regex: search, $options: "i" } },
            { message: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.status(200).json(leads);

  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Server error. Could not fetch leads." });
  }
});


// DELETE /leads/:id → Delete a lead by ID
app.delete("/leads/:id", async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Lead not found." });
    }

    res.status(200).json({ message: "Lead deleted successfully." });
    console.log("🗑️ Lead deleted:", deleted.name);

  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: "Server error. Could not delete lead." });
  }
});


// ── Start Server ───────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});