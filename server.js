const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set the EVENTS_FILE path using path.join to ensure correct behavior across environments
const EVENTS_FILE = path.join(__dirname, "events.json");

// --- Helper Functions for File Persistence ---

/**
 * Reads events from the events.json file.
 * Returns default data if the file is missing, empty, or has an error.
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
  
  // If file is missing or error occurred, create the file with default data
  writeEvents(defaultEvents); 
  return defaultEvents;
}

/**
 * Writes the entire events array to the events.json file.
 */
function writeEvents(events) {
  try {
    // Write synchronously to ensure data is saved before response is sent
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing events file:", error);
  }
}


// --- API Endpoints ---

// GET /events: Read all events
app.get("/events", (req, res) => {
  const events = readEvents();
  res.json(events);
});

// POST /events: This endpoint receives the ENTIRE updated array from the frontend.
app.post("/events", (req, res) => {
  const events = req.body;
  writeEvents(events); // Overwrite the file with the new array
  res.json({ status: "success", message: "Events updated and saved." });
});


// GET /: Root endpoint check
app.get("/", (req, res) => {
  res.send("Backend is running and ready for persistent events API calls!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
