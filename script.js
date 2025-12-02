// script.js (FINAL VERSION - Includes Persistence, Views, Editing, and Time Input)

// Replace with your Render backend URL
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
        
        // --- VIEW SETTINGS ---
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay' // ADDED: Day, Week, and Month views
        },
        initialView: "dayGridMonth",
        selectable: true,
        editable: true, // Enables drag/drop and resize editing
        events: eventsArray,
        dayMaxEvents: true, 
        eventTimeFormat: { 
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false 
        },

        // --- PERSISTENCE UTILITY ---
        // Function to update the backend with the current eventsArray
        function updateBackend() {
            fetch(`${BACKEND_URL}/events`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(eventsArray)
            })
            .catch(err => console.error("Error updating events:", err));
        }

        // --- EDITING LOGIC (Drag/Drop/Resize) ---
        eventChange: function (info) {
            // Find the updated event in the array and replace it
            const index = eventsArray.findIndex(e => e.id === info.event.id);
            if (index > -1) {
                eventsArray[index] = {
                    id: info.event.id,
                    title: info.event.title,
                    start: info.event.startStr,
                    end: info.event.endStr || null, // endStr might be empty for all-day events
                    allDay: info.event.allDay
                };
            }
            updateBackend();
        },

        // --- ADD NEW EVENT ---
        dateClick: function (info) {
          const title = prompt("Add Event Title:");
          if (title) {
            
            const startTime = prompt("Enter Start Time (e.g., 08:00) or leave blank for all-day:");
            let startDateTime = info.dateStr;
            let endDateTime = null;
            let isAllDay = true;

            if (startTime) {
                const endTime = prompt("Enter End Time (e.g., 10:00):");
                startDateTime = `${info.dateStr}T${startTime}:00`;
                endDateTime = `${info.dateStr}T${endTime}:00`;
                isAllDay = false;
            }

            const newEvent = {
              id: Date.now().toString(),
              title: title,
              start: startDateTime,
              end: endDateTime,
              allDay: isAllDay 
            };

            calendar.addEvent(newEvent);
            eventsArray.push(newEvent);
            updateBackend();
          }
        },

        // --- EDIT/DELETE ON CLICK ---
        eventClick: function (info) {
          const action = prompt(`Event: ${info.event.title}\n\nDo you want to (E)dit the title or (D)elete the event? (Type E or D)`);
          
          if (action && action.toUpperCase() === 'D') {
            if (confirm(`Are you sure you want to delete event: ${info.event.title}?`)) {
              info.event.remove();

              // Remove from events array
              eventsArray = eventsArray.filter(e => e.id !== info.event.id);
              updateBackend();
            }
          } else if (action && action.toUpperCase() === 'E') {
            const newTitle = prompt("Enter new title for the event:", info.event.title);
            if (newTitle) {
              info.event.setProp('title', newTitle);
              
              // Update the array object for persistence
              const index = eventsArray.findIndex(e => e.id === info.event.id);
              if (index > -1) {
                  eventsArray[index].title = newTitle;
              }
              updateBackend();
            }
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
