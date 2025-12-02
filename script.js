// Replace with your Render backend URL once deployed (e.g., "https://your-app-name.onrender.com")
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
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        selectable: true,
        editable: true,
        events: events,

        // --- ADD NEW EVENT (POST request) ---
        dateClick: function (info) {
          const title = prompt("Add Event Title:");
          if (title) {
            const newEvent = {
              title: title,
              start: info.dateStr,
              allDay: info.allDay
            };

            // 1. Post new event to backend
            fetch(`${BACKEND_URL}/events`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newEvent)
            })
            .then(response => response.json())
            .then(addedEvent => {
                 // 2. Add event to calendar using the ID returned from the backend
                 if (addedEvent && addedEvent.id) {
                     calendar.addEvent(addedEvent);
                 } else {
                     console.error("Backend did not return a valid event object with ID.");
                 }
            })
            .catch(err => console.error("Error adding event:", err));
          }
        },

        // --- DELETE EVENT (DELETE request) ---
        eventClick: function (info) {
          if (confirm(`Delete event: ${info.event.title}?`)) {
            const eventId = info.event.id;

            // 1. Send DELETE request to backend
            fetch(`${BACKEND_URL}/events/${eventId}`, {
              method: "DELETE"
            })
            .then(response => {
                if (response.ok) {
                    // 2. Remove event from calendar only if backend delete was successful
                    info.event.remove();
                } else {
                    alert("Failed to delete event on the server.");
                }
            })
            .catch(err => console.error("Error deleting event:", err));
          }
        }
      });

      calendar.render();
    })
    .catch(err => {
      console.error("Error fetching events:", err);
      // NOTE: Update the alert to reflect the new expected behavior
      alert("Error fetching events. Make sure the backend is running and URL is correct.");
    });
});
