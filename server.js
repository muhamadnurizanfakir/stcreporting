const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs"); 
const path = require("path");
const axios = require("axios"); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Set file paths
const EVENTS_FILE = path.join(__dirname, "events.json");
const TASKS_FILE = path.join(__dirname, "tasks.json"); // New file for tasks
const RENDER_URL = "https://stcreporting-backend.onrender.com"; // Your deployed URL

// --- Persistence Helper Functions ---

function readEvents() {
  const defaultEvents = [
    { id: "1", title: "Team Meeting", start: "2025-12-05" },
    { id: "2", title: "Project Deadline", start: "2025-12-10" },
    { id: "3", title: "Client Call", start: "2025-12-15" }
  ];
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, "utf8");
      if (data) { return JSON.parse(data); }
    }
  } catch (error) { console.error("Error reading events file:", error); }
  writeEvents(defaultEvents); 
  return defaultEvents;
}

function writeEvents(events) {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
  } catch (error) { console.error("Error writing events file:", error); }
}

// NEW: Task Persistence Functions
function readTasks() {
    const defaultTasks = [
        { id: "t1", description: "Review Q4 Metrics", task: "Analyze data", actionPlan: "Draft executive summary", pic: "Alice", targetDate: "2025-12-31", completionDate: "", percentage: 0 },
        { id: "t2", description: "Calendar Integration", task: "Test persistence", actionPlan: "Verify server.js logic", pic: "Bob", targetDate: "2025-12-15", completionDate: "", percentage: 50 }
    ];
    try {
        if (fs.existsSync(TASKS_FILE)) {
            const data = fs.readFileSync(TASKS_FILE, "utf8");
            if (data) { return JSON.parse(data); }
        }
    } catch (error) { console.error("Error reading tasks file, returning default data:", error); }
    writeTasks(defaultTasks);
    return defaultTasks;
}

function writeTasks(tasks) {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf8");
    } catch (error) { console.error("Error writing tasks file:", error); }
}


// --- Keep-Alive Function (Stops Render from sleeping) ---
function keepAlive() {
  if (RENDER_URL) {
    console.log(`Pinging self at ${RENDER_URL} to stay awake...`);
    axios.get(RENDER_URL)
      .then(() => console.log("Ping successful."))
      .catch(err => console.error("Ping failed:", err.message));
  }
}

// --- API Endpoints ---

// Calendar Endpoints
app.get("/events", (req, res) => { res.json(readEvents()); });
app.post("/events", (req, res) => { writeEvents(req.body); res.json({ status: "success", message: "Events updated." }); });

// NEW: Task Reporting Endpoints
app.get("/tasks", (req, res) => { res.json(readTasks()); });
app.post("/tasks", (req, res) => { writeTasks(req.body); res.json({ status: "success", message: "Tasks updated." }); });


app.get("/", (req, res) => {
  res.send("Backend is running and ready for persistent events and tasks API calls!");
});

// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  setInterval(keepAlive, 840000); 
  keepAlive();
});
