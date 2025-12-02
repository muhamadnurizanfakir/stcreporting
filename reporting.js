// reporting.js - Logic for the Daily Task Reporting table

const BACKEND_URL = "https://stcreporting-backend.onrender.com";
const TASKS_ENDPOINT = `${BACKEND_URL}/tasks`;

// Global array to hold the current state of tasks
let tasksArray = [];

// --- Persistence & Sync ---

function updateBackend() {
    fetch(TASKS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tasksArray)
    })
    .catch(err => console.error("Error updating tasks:", err));
}

// --- DOM Rendering ---

function renderTasks() {
    const tableBody = document.getElementById('task-list-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    tasksArray.forEach((task, index) => {
        const row = tableBody.insertRow();
        row.dataset.taskId = task.id;

        // Columns that are editable (using input fields for data integrity)
        const columns = ['description', 'task', 'actionPlan', 'pic', 'targetDate', 'completionDate', 'percentage'];

        // 1. No. Column (Read-only)
        row.insertCell().textContent = index + 1;
        
        // 2. Data Columns (Editable Inputs)
        columns.forEach(key => {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = (key === 'percentage') ? 'number' : (key.includes('Date') ? 'date' : 'text');
            input.value = task[key] || '';
            input.placeholder = key.charAt(0).toUpperCase() + key.slice(1);
            input.className = 'task-input';
            input.dataset.key = key;
            
            // Add event listener to auto-save on change (blur)
            input.addEventListener('blur', handleEdit);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur(); // Trigger save on Enter
                }
            });
            
            cell.appendChild(input);
        });

        // 3. Action Column (Delete Button)
        const actionCell = row.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-task-btn';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        actionCell.appendChild(deleteBtn);
    });
}

// --- Event Handlers ---

function handleEdit(event) {
    const input = event.target;
    const key = input.dataset.key;
    const row = input.closest('tr');
    const taskId = row.dataset.taskId;
    
    // Find the task and update the value
    const taskIndex = tasksArray.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        let value = input.value;
        if (key === 'percentage') {
            // Ensure percentage is between 0 and 100
            value = Math.min(100, Math.max(0, parseInt(value) || 0));
            input.value = value;
        }
        tasksArray[taskIndex][key] = value;
        updateBackend();
    }
}

function addTask() {
    const newTask = {
        id: Date.now().toString(), // Unique ID
        description: 'New Task Description',
        task: 'Define task here',
        actionPlan: 'Outline steps',
        pic: 'Assignee',
        targetDate: new Date().toISOString().split('T')[0], // Today's date
        completionDate: '',
        percentage: 0 
    };
    tasksArray.push(newTask);
    renderTasks();
    updateBackend();
}

function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasksArray = tasksArray.filter(t => t.id !== taskId);
        renderTasks();
        updateBackend();
    }
}

// --- Initialization ---

document.addEventListener("DOMContentLoaded", function () {
    // 1. Fetch existing tasks
    fetch(TASKS_ENDPOINT)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(tasks => {
            tasksArray = tasks;
            renderTasks();
        })
        .catch(err => {
            console.error("Error fetching tasks:", err);
            // Fallback to empty array and render
            tasksArray = [];
            renderTasks();
        });

    // 2. Attach Add button listener
    const addButton = document.getElementById('add-task-btn');
    if (addButton) {
        addButton.addEventListener('click', addTask);
    }
});
```
eof

## 4. 🎨 Update `style.css` (Style the Table)

You need to add styles to make the new table look professional and, most importantly, responsive for mobile devices.

### **ACTION REQUIRED: Update Your `style.css`**

Add the following CSS rules to the **end** of your existing `style.css` file:

```css
/* ... (Existing styles for body, navbar, h1, #calendar, etc.) ... */

/* New: Wider container for the reporting page */
.wide-container {
    max-width: 1300px !important;
}

/* Table Actions (Button) */
.table-actions {
    text-align: right;
    margin-bottom: 15px;
}

.action-button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.action-button:hover {
    background-color: #45a049;
}

/* --- Responsive Table Styles --- */
.table-responsive {
    overflow-x: auto; /* Ensures horizontal scrolling on small screens */
    width: 100%;
    margin-top: 15px;
}

#daily-tasks-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1000px; /* Ensures columns don't compress too much */
    font-size: 0.9em;
}

#daily-tasks-table th, 
#daily-tasks-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

#daily-tasks-table th {
    background-color: #f2f2f2;
    color: #333;
    font-weight: 600;
}

#daily-tasks-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

/* Inputs within the table cells */
.task-input {
    width: 95%; /* Take up most of the cell width */
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-sizing: border-box;
    font-size: 1em;
}

/* Delete Button Style */
.delete-task-btn {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85em;
}

.delete-task-btn:hover {
    background-color: #da190b;
}
