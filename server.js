const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs"); // Added: Node.js File System module
const path = require("path"); // Added: Node.js Path module
const axios = require("axios"); // Added: For Keep-Alive feature

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set the EVENTS_FILE path using path.join for reliability
const EVENTS_FILE = path.join(__dirname, "events.json");
const RENDER_URL = "https://stcreporting-backend.onrender.com"; // Your deployed URL

// --- 1. Persistence Helper Functions ---

/**
 * Reads events from the events.json file. Returns default data if file is missing/error.
 */
function readEvents() {
  const defaultEvents = [
    { id: "1", title: "Team Meeting", start: "2025-12-05" },
    { id: "2", title: "Project Deadline", start: "2025-12-10" },
    { id: "3", title: "Client Call", start: "2025-12-15" }
  ];
  
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, "utf8");
      if (data) {
          return JSON.parse(data);
      }
    }
  } catch (error) {
    console.error("Error reading events file, returning default data:", error);
  }
  
  // If file is missing or error occurred, initialize with default data and save it
  writeEvents(defaultEvents); 
  return defaultEvents;
}

/**
 * Writes the entire events array to the events.json file.
 */
function writeEvents(events) {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing events file:", error);
  }
}

// --- 2. Keep-Alive Function (Stops Render from sleeping) ---

function keepAlive() {
  if (RENDER_URL) {
    console.log(`Pinging self at ${RENDER_URL} to stay awake...`);
    axios.get(RENDER_URL)
      .then(() => console.log("Ping successful."))
      .catch(err => console.error("Ping failed:", err.message));
  } else {
    console.log("RENDER_URL not set, cannot perform self-ping.");
  }
}

// --- 3. API Endpoints (Now uses Persistence) ---

app.get("/events", (req, res) => {
  const events = readEvents(); // Loads events from file
  res.json(events);
});

app.post("/events", (req, res) => {
  const events = req.body;
  writeEvents(events); // Saves entire updated array to file
  res.json({ status: "success", message: "Events updated and saved." });
});


app.get("/", (req, res) => {
  res.send("Backend is running and ready for persistent events API calls!");
});

// --- 4. Server Start and Keep-Alive Initialization ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  
  // Start the heartbeat timer (Every 14 minutes)
  setInterval(keepAlive, 840000); 
  
  // Run the first ping immediately after the server starts
  keepAlive();
});
