const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const EVENTS_FILE = path.join(__dirname, "events.json");

// --- Helper Functions for File Persistence ---

// Read events from file
function readEvents() {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading events file:", error);
  }
  // Default data if file doesn't exist or error occurs
  return [
    { id: "1", title: "Team Meeting", start: "2025-12-05" },
    { id: "2", title: "Project Deadline", start: "2025-12-10" },
    { id: "3", title: "Client Call", start: "2025-12-15" }
  ];
}

// Write events to file
function writeEvents(events) {
  try {
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

// POST /events: Add a new event
app.post("/events", (req, res) => {
  const events = readEvents();
  const newEventData = req.body;
  
  // Create a unique ID for the new event
  const newId = Date.now().toString();
  const newEvent = { id: newId, ...newEventData };
  
  events.push(newEvent);
  writeEvents(events);
  
  // Return the newly created event object including its ID
  res.status(201).json(newEvent);
});

// DELETE /events/:id: Delete an event
app.delete("/events/:id", (req, res) => {
  let events = readEvents();
  const eventIdToDelete = req.params.id;
  
  const initialLength = events.length;
  events = events.filter(e => e.id !== eventIdToDelete);
  
  if (events.length < initialLength) {
    writeEvents(events);
    res.json({ status: "success", message: `Event with id ${eventIdToDelete} deleted.` });
  } else {
    res.status(404).json({ status: "error", message: `Event with id ${eventIdToDelete} not found.` });
  }
});


app.get("/", (req, res) => {
  res.send("Backend is running and ready for events API calls!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
