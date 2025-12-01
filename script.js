document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");

  fetch("data/events.json")
    .then(response => response.json())
    .then(events => {
        var calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          selectable: true,
          editable: true,
          events: events,

          dateClick: function (info) {
            let title = prompt("Add Event Title:");
            if (title) {
              calendar.addEvent({
                title: title,
                start: info.dateStr
              });
              alert("Event added — remember to update events.json manually.");
            }
          },

          eventClick: function (info) {
            let action = confirm("Delete this event?");
            if (action) {
              info.event.remove();
              alert("Event removed — remember to update events.json manually.");
            }
          }
        });

        calendar.render();
    });
});
