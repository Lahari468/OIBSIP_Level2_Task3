let tasks = [];

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


function init() {
    loadTasks();
    renderTasks();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('due-date').value = today;
}

// Render tasks based on filter
function renderTasks(filter = 'all') {
    const pendingContainer = document.getElementById('pending-tasks-container');
    const completedContainer = document.getElementById('completed-tasks-container');
    
    pendingContainer.innerHTML = '';
    completedContainer.innerHTML = '';
    
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    
    if (pendingTasks.length === 0) {
        pendingContainer.innerHTML = '<p class="empty-message">No pending tasks. Add a new task to get started!</p>';
    }
    
    if (completedTasks.length === 0) {
        completedContainer.innerHTML = '<p class="empty-message">No completed tasks yet. Complete some tasks to see them here!</p>';
    }
    
    pendingTasks.forEach(task => {
        pendingContainer.appendChild(createTaskElement(task));
    });
    
    completedTasks.forEach(task => {
        completedContainer.appendChild(createTaskElement(task));
    });
    
    if (filter === 'pending') {
        document.getElementById('all-tasks').style.display = 'block';
        document.getElementById('completed-tasks').style.display = 'none';
    } else if (filter === 'completed') {
        document.getElementById('all-tasks').style.display = 'none';
        document.getElementById('completed-tasks').style.display = 'block';
    } else {
        document.getElementById('all-tasks').style.display = 'block';
        document.getElementById('completed-tasks').style.display = 'block';
    }
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskElement.dataset.id = task.id;
    
    const priorityClass = `priority-${task.priority}`;
    
    let dueInfo = '';
    if (task.dueDate) {
        const dueDateTime = task.dueTime ? `${task.dueDate}T${task.dueTime}` : `${task.dueDate}T23:59:59`;
        const dueDate = new Date(dueDateTime);
        const now = new Date();
        
        if (dueDate < now && !task.completed) {
            dueInfo = `<span style="color: var(--danger-color);">Overdue: ${formatDate(dueDate)}</span>`;
        } else {
            dueInfo = `Due: ${formatDate(dueDate)}`;
        }
    }
    
    // Create task HTML
    taskElement.innerHTML = `
        <div class="task-info">
            <h3 class="task-title">${task.title}</h3>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div class="task-meta">
                <span class="task-priority ${priorityClass}">${task.priority.toUpperCase()}</span>
                ${dueInfo ? `<span>${dueInfo}</span>` : ''}
                <span>Created: ${formatDateTime(task.createdAt)}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="action-btn complete-btn" onclick="toggleComplete(${task.id})">
                ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="action-btn edit-btn" onclick="editTask(${task.id})">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        </div>
    `;
    
    return taskElement;
}

// Filter tasks by status
function filterTasks(filter) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks(filter);
}

function openAddTaskModal() {
    document.getElementById('add-task-modal').style.display = 'flex';
    document.getElementById('task-title').focus();
}

function closeAddTaskModal() {
    document.getElementById('add-task-modal').style.display = 'none';
    document.getElementById('task-form').reset();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('due-date').value = today;
}

// Save new task
function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const dueDate = document.getElementById('due-date').value;
    const dueTime = document.getElementById('due-time').value;
   
    if (!title) {
        alert('Please enter a title for the task');
        return;
    }
    
  
    const newTask = {
        id: Date.now(),
        title,
        description,
        priority,
        dueDate,
        dueTime,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closeAddTaskModal();
}

function toggleComplete(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                completed: !task.completed
            };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Edit existing task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
    document.getElementById('due-date').value = task.dueDate || '';
    document.getElementById('due-time').value = task.dueTime || '';
    
    tasks = tasks.filter(t => t.id !== taskId);
    
    openAddTaskModal();
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

function formatDate(date) {
    return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
window.onload = init;