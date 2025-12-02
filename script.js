// script.js (FINAL VERSION - Includes Persistence logic setup, dayMaxEvents, and Time Input)

// Replace with your Render backend URLL
const BACKEND_URL = "https://stcreporting-backend.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // Load events from backend
  fetch(`${BACKEND_URL}/events`)
    .then(response => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
    })
    .then(events => {
      let eventsArray = events; 
      
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        selectable: true,
        editable: true,
        events: eventsArray,
        
        // Ensures multiple events on the same day are displayed
        dayMaxEvents: true, 
        
        // This setting ensures time is displayed on events in month view
        eventTimeFormat: { 
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false 
        },

        // --- Add new event (Now prompts for time) ---
        dateClick: function (info) {
          const title = prompt("Add Event Title:");
          if (title) {
            
            // NOTE: Using simple 24-hour format (e.g., 08:00, 15:00) for prompt
            const startTime = prompt("Enter Start Time (e.g., 08:00):");
            const endTime = prompt("Enter End Time (e.g., 10:00):");

            // Combine date (YYYY-MM-DD) and time (HH:MM) into ISO 8601 format
            const startDateTime = `${info.dateStr}T${startTime}:00`;
            const endDateTime = `${info.dateStr}T${endTime}:00`;

            const newEvent = {
              id: Date.now().toString(),
              title: title,
              // Use the full date-time strings
              start: startDateTime,
              end: endDateTime, 
              allDay: false // Important: set to false for timed events
            };

            // Add event to calendar
            calendar.addEvent(newEvent);

            // Update backend
            eventsArray.push(newEvent);
            fetch(`${BACKEND_URL}/events`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(eventsArray)
            })
            .catch(err => console.error("Error updating events:", err));
          }
        },

        // --- Delete event ---
        eventClick: function (info) {
          if (confirm("Delete this event?")) {
            info.event.remove();

            // Remove from events array
            eventsArray = eventsArray.filter(e => e.id !== info.event.id);

            // Update backend
            fetch(`${BACKEND_URL}/events`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(eventsArray)
            })
            .catch(err => console.error("Error updating events:", err));
          }
        }
      });

      calendar.render();
    })
    .catch(err => {
      console.error("Error fetching events:", err);
      alert("Error fetching events from backend. Make sure the backend is running.");
    });
});
