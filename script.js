const BACKEND_URL = "https://stcreporting-backend.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  fetch(`${BACKEND_URL}/events`)
    .then(response => response.json())
    .then(events => {
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          selectable: true,
          editable: true,
          events: events,

          dateClick: function (info) {
            const title = prompt("Add Event Title:");
            if (title) {
              const newEvent = {
                id: Date.now().toString(),
                title: title,
                start: info.dateStr
              };
              calendar.addEvent(newEvent);

              events.push(newEvent);
              fetch(`${BACKEND_URL}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(events)
              });
            }
          },

          eventClick: function (info) {
            if (confirm("Delete this event?")) {
              info.event.remove();
              events = events.filter(e => e.id !== info.event.id);

              fetch(`${BACKEND_URL}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(events)
              });
            }
          }
        });

        calendar.render();
    });
});
