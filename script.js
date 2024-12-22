const addInput = document.getElementById('main-input');
const addButton = document.getElementById('main-button');
const counterAll = document.getElementById('section__counter-all');
const counterActive = document.getElementById('section__counter-active');
const counterEnd = document.getElementById('section__counter-end');
const sectionTasks = document.querySelector('.section__tasks');

const sectionTaskTop = document.querySelector('.section__tasks-top');
const sectionTasksTitle = document.querySelector('.section__tasks-title');

const allTasksBtn = document.getElementById('section__list-all');
const activeTasksBtn = document.getElementById('section__list-active');
const endTasksBtn = document.getElementById('section__list-end');

let currentFilter = 'all';
let tasks = [];

//LocalStorage
function loadTasksFromStorage() {
  const savedTasks = localStorage.getItem('tasks');

  if (savedTasks) {
    tasks = JSON.parse(savedTasks);

    if (tasks.length > 0 && sectionTasksTitle) {
      sectionTasksTitle.remove();
    }
    if (tasks.length == 0) {
      return sectionTasksTitle;
    }
    renderFilteredTasks();
    updateCounters();
  }
}
function saveTasksToStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
//Обсервер
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      updateCounters();
    }
  });
});

observer.observe(sectionTasks, { childList: true, subtree: false });
//Стили фильтрации
function updateFilterButtons() {
  [allTasksBtn, activeTasksBtn, endTasksBtn].forEach((btn) => {
    btn.classList.remove('active');
  });

  switch (currentFilter) {
    case 'all':
      allTasksBtn.classList.add('active');
      break;
    case 'active':
      activeTasksBtn.classList.add('active');
      break;
    case 'completed':
      endTasksBtn.classList.add('active');
      break;
  }
}
//Добавление задач
function addTask() {
  const inputValue = addInput.value.trim();
  if (inputValue !== '') {
    if (sectionTasksTitle && sectionTaskTop) {
      sectionTasksTitle.remove();
      sectionTaskTop.remove();
    }

    tasks.push({
      title: inputValue,
      completed: false,
    });
  }
  addInput.value = '';
  renderFilteredTasks();
}
//Отслеживание Счетчиков
function updateCounters() {
  const allTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const activeTasks = allTasks - completedTasks;

  counterAll.textContent = allTasks;
  counterEnd.textContent = completedTasks;
  counterActive.textContent = activeTasks;

  saveTasksToStorage();
}

//Чекбокс обработчик
function addCheckboxListener(checkbox, taskElement) {
  checkbox.addEventListener('change', () => {
    const taskTitle = taskElement.querySelector('.section__task-title').textContent;
    const taskIndex = tasks.findIndex((task) => task.title === taskTitle);
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = checkbox.checked;

      renderFilteredTasks();
    }
  });
}
//Удаление таски
function deleteTask(event) {
  const taskElement = event.target.closest('.section__task');
  if (taskElement) {
    const taskTitle = taskElement.querySelector('.section__task-title').textContent;
    tasks = tasks.filter((task) => task.title !== taskTitle);
    renderFilteredTasks();
    updateCounters();
    if (tasks.length == 0) {
      return sectionTasksTitle;
    }
  }
}

//Рендер Таски
function renderTask(title, completed = false) {
  const taskElement = document.createElement('div');
  taskElement.className = 'section__task';

  taskElement.innerHTML = `
  <input type="checkbox" class="section__task-checkbox" ${completed ? 'checked' : ''} />
  <p class="section__task-title">${title}</p>
  <button class="button__delete">
      <img src="./img/trash-2.svg" alt="delete" class="button__delete-svg" />
  </button>
`;
  const checkbox = taskElement.querySelector('.section__task-checkbox');
  addCheckboxListener(checkbox, taskElement);

  const deleteBtn = taskElement.querySelector('.button__delete');
  deleteBtn.addEventListener('click', deleteTask);

  sectionTasks.appendChild(taskElement);
}

function renderFilteredTasks() {
  sectionTasks.innerHTML = '';

  const filteredTasks = tasks.filter((task) => {
    switch (currentFilter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });
  filteredTasks.forEach((task) => {
    renderTask(task.title, task.completed);
  });
  updateFilterButtons();
}

//Евент листнеры
addButton.addEventListener('click', addTask);
addInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});
allTasksBtn.addEventListener('click', (e) => {
  e.preventDefault();
  currentFilter = 'all';
  renderFilteredTasks();
});

activeTasksBtn.addEventListener('click', (e) => {
  e.preventDefault();
  currentFilter = 'active';
  renderFilteredTasks();
});

endTasksBtn.addEventListener('click', (e) => {
  e.preventDefault();
  currentFilter = 'completed';
  renderFilteredTasks();
});
document.addEventListener('DOMContentLoaded', () => {
  loadTasksFromStorage();
  updateFilterButtons();
});
