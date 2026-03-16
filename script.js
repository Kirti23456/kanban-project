let tasksData = {
    todo: [],
    progress: [],
    done: []
};

const todo = document.getElementById('todo');
const progress = document.getElementById('progress');
const done = document.getElementById('done');

let draggedTask = null;

// Load tasks from localStorage on page load
function loadTasks() {
    const stored = localStorage.getItem("tasksData");
    if (stored) {
        try {
            tasksData = JSON.parse(stored);
        } catch (e) {
            console.warn("Could not parse tasksData", e);
        }
    }

    // Clear existing tasks in DOM
    [todo, progress, done].forEach(col => {
        const tasks = col.querySelectorAll('.task');
        tasks.forEach(task => task.remove());
    });

    // Render tasks from tasksData
    for (const col in tasksData) {
        const column = document.getElementById(col);
        tasksData[col].forEach(task => {
            const div = document.createElement("div");
            div.classList.add("task");
            div.setAttribute("draggable", "true");
            div.innerHTML = `<h3>${task.title}</h3><p>${task.description}</p><button>Delete</button>`;
            column.appendChild(div);
            setupTaskDrag(div);
            const deleteBtn = div.querySelector("button");
            deleteBtn.addEventListener("click", () => deleteTask(div, col));
        });
    }

    updateCounts();
}

function saveTasks() {
    localStorage.setItem("tasksData", JSON.stringify(tasksData));
}

function updateCounts() {
    [todo, progress, done].forEach(col => {
        const tasks = col.querySelectorAll('.task');
        const count = col.querySelector(".right");
        count.innerText = tasks.length;
    });
}

function deleteTask(taskDiv, columnId) {
    taskDiv.remove();
    const title = taskDiv.querySelector('h3').innerText;
    const desc = taskDiv.querySelector('p').innerText;
    const index = tasksData[columnId].findIndex(t => t.title === title && t.description === desc);
    if (index > -1) {
        tasksData[columnId].splice(index, 1);
        saveTasks();
    }
    updateCounts();
}

function setupTaskDrag(task) {
    task.draggable = true;
    task.addEventListener("dragstart", (e) => {
        draggedTask = task;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', task.outerHTML);
        task.classList.add('dragging');
    });

    task.addEventListener("dragend", (e) => {
        task.classList.remove('dragging');
    });
}

const tasks = document.querySelectorAll('.task');
tasks.forEach(setupTaskDrag);

function addDragEventsOnColumn(column) {
    column.addEventListener("dragenter", (e) => {
        e.preventDefault();
        column.classList.add("drag-over");
    });

    column.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    column.addEventListener("dragleave", (e) => {
        if (!column.contains(e.relatedTarget)) {
            column.classList.remove("drag-over");
        }
    });

    column.addEventListener("drop", (e) => {
        e.preventDefault();
        column.classList.remove("drag-over");
        if (draggedTask) {
            column.appendChild(draggedTask);
            draggedTask = null;
        }
        // Update tasksData from DOM after drop
        [todo, progress, done].forEach(col => {
            const tasks = col.querySelectorAll('.task');
            tasksData[col.id] = Array.from(tasks).map(t => ({
                title: t.querySelector('h3').innerText,
                description: t.querySelector('p').innerText
            }));
        });
        saveTasks();
        updateCounts();
    });
}

addDragEventsOnColumn(todo);
addDragEventsOnColumn(progress);
addDragEventsOnColumn(done);

// Modal related code
const toggleModalBtn = document.querySelector("#toggle-modal");
const modalBg = document.querySelector(".modal .bg");
const modal = document.querySelector(".modal");
const addTaskBtn = document.querySelector("#add-new-task");

toggleModalBtn.addEventListener("click", () => {
    modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
    modal.classList.remove("active");
});

addTaskBtn.addEventListener("click", () => {
    const taskTitle = document.querySelector("#task-title-input").value.trim();
    const taskDesc = document.querySelector("#task-description-input").value.trim();

    if (!taskTitle) {
        alert("Please enter a task title.");
        return;
    }

    const div = document.createElement("div");
    div.classList.add("task");
    div.innerHTML = `<h3>${taskTitle}</h3><p>${taskDesc}</p><button>Delete</button>`;
    todo.appendChild(div);

    setupTaskDrag(div);

    tasksData.todo.push({ title: taskTitle, description: taskDesc });
    saveTasks();
    updateCounts();

    document.querySelector("#task-title-input").value = '';
    document.querySelector("#task-description-input").value = '';

    modal.classList.remove("active");
    const deleteBtn = div.querySelector("button");
    deleteBtn.addEventListener("click", () => deleteTask(div, 'todo'));
});

// Load tasks when page loads
loadTasks();