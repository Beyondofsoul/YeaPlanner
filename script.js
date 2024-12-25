import { createObservable } from './createObservable.js';

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

const Observable = createObservable([]);

Observable.subscribe(renderTask);

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
    const task = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };

    tasks.push(task);
    saveTasksToStorage();
  }
  addInput.value = '';
  renderFilteredTasks();
}
//Отслеживание Счетчиков/*
function updateCounters() {
  const allTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const activeTasks = allTasks - completedTasks;

  counterAll.textContent = allTasks;
  counterEnd.textContent = completedTasks;
  counterActive.textContent = activeTasks;
}

//Чекбокс обработчик
function addCheckboxListener(checkbox, taskElement) {
  checkbox.addEventListener('change', () => {
    const taskId = Number(taskElement.dataset.taskId);
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
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
    const taskId = Number(taskElement.dataset.taskId);
    tasks = tasks.filter((task) => task.id !== taskId);

    renderFilteredTasks();
    saveTasksToStorage();
  }
}

//Рендер Таски
function renderTask(task) {
  const taskElement = document.createElement('div');
  taskElement.className = 'section__task';

  taskElement.dataset.taskId = task.id;

  taskElement.innerHTML = `

  <input type="checkbox" class="section__task-checkbox" ${task.completed ? 'checked' : ''} />
  <p class="section__task-title">${task.text}</p>
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
    Observable.setState(task);
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
