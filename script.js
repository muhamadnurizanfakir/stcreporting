// Replace with your Render backend URL
const BACKEND_URL = "https://stcreporting-backend.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // Load events from backend
  fetch(`${BACKEND_URL}/events`)
    .then(response => response.json())
    .then(events => {
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        selectable: true,
        editable: true,
        events: events,

        // Add new event
        dateClick: function (info) {
          const title = prompt("Add Event Title:");
          if (title) {
            const newEvent = {
              id: Date.now().toString(),
              title: title,
              start: info.dateStr
            };

            // Add event to calendar
            calendar.addEvent(newEvent);

            // Update backend
            events.push(newEvent);
            fetch(`${BACKEND_URL}/events`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(events)
            })
            .catch(err => console.error("Error updating events:", err));
          }
        },

        // Delete event
        eventClick: function (info) {
          if (confirm("Delete this event?")) {
            info.event.remove();

            // Remove from events array
            events = events.filter(e => e.id !== info.event.id);

            // Update backend
            fetch(`${BACKEND_URL}/events`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(events)
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
