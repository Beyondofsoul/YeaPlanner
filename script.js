import { createObservable } from './js/createObservable.js';
import { DOMElements } from './js/elements.js';
import { Storage } from './js/storage.js';
import { taskService } from './js/taskService.js';
const TodoApp = () => {
  const initialTasks = Storage.loadTasks();

  const tasksObservable = createObservable(initialTasks);
  const currentObservable = createObservable('all');

  tasksObservable.subscribe((tasks) => {
    const currentFilter = currentObservable.getState();
    renderFilteredTasks(tasks, currentFilter);
    updateCounters(tasks);

    Storage.saveTask(tasks);
  });
  currentObservable.subscribe((current) => {
    const tasks = tasksObservable.getState();
    renderFilteredTasks(tasks, current);
    updateFilterButtons(current, DOMElements);
  });
  function initialRender() {
    const tasks = tasksObservable.getState();
    const filter = currentObservable.getState();

    if (tasks.length > 0 && DOMElements.sectionTasksTitle) {
      DOMElements.sectionTasksTitle.remove();
      if (DOMElements.sectionTaskTop) {
        DOMElements.sectionTaskTop.remove();
      }
    }

    renderFilteredTasks(tasks, filter);

    updateCounters(tasks, DOMElements);
    updateFilterButtons(filter, DOMElements);
  }
  //Обсервер
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        updateCounters();
      }
    });
  });

  observer.observe(DOMElements.sectionTasks, { childList: true, subtree: false });
  //Стили фильтрации
  function updateFilterButtons(currentFilter) {
    [DOMElements.allTasksBtn, DOMElements.activeTasksBtn, DOMElements.endTasksBtn].forEach(
      (btn) => {
        btn.classList.remove('active');
      },
    );

    switch (currentFilter) {
      case 'all':
        DOMElements.allTasksBtn.classList.add('active');
        break;
      case 'active':
        DOMElements.activeTasksBtn.classList.add('active');
        break;
      case 'completed':
        DOMElements.endTasksBtn.classList.add('active');
        break;
    }
  }
  //Добавление задач
  function addTask() {
    const inputValue = DOMElements.addInput.value.trim();
    if (inputValue !== '') {
      if (DOMElements.sectionTasksTitle && DOMElements.sectionTaskTop) {
        DOMElements.sectionTasksTitle.remove();
        DOMElements.sectionTaskTop.remove();
      }
      const task = taskService.createTask(inputValue);

      const currentTasks = tasksObservable.getState();
      tasksObservable.setState([...currentTasks, task]);
    }
    DOMElements.addInput.value = '';
  }
  //Отслеживание Счетчиков/*
  function updateCounters(tasks) {
    if (!tasks) return;

    const allTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const activeTasks = allTasks - completedTasks;

    DOMElements.counterAll.textContent = allTasks;
    DOMElements.counterEnd.textContent = completedTasks;
    DOMElements.counterActive.textContent = activeTasks;
  }

  //Чекбокс обработчик
  function addCheckboxListener(checkbox, taskElement) {
    checkbox.addEventListener('change', () => {
      const taskId = Number(taskElement.dataset.taskId);
      const currentTasks = tasksObservable.getState();
      const updatedTasks = currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: checkbox.checked } : task,
      );
      tasksObservable.setState(updatedTasks);
    });
  }
  //Удаление таски
  function deleteTask(event) {
    const taskElement = event.target.closest('.section__task');
    if (taskElement) {
      const taskId = Number(taskElement.dataset.taskId);
      const currentTasks = tasksObservable.getState();
      const updatedTasks = currentTasks.filter((task) => task.id !== taskId);

      tasksObservable.setState(updatedTasks);
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

    DOMElements.sectionTasks.appendChild(taskElement);
  }

  function renderFilteredTasks(tasks, currentFilter) {
    if (!DOMElements.sectionTasks) return;
    DOMElements.sectionTasks.innerHTML = '';

    const filteredTasks = taskService.filterTasks(tasks, currentFilter);

    filteredTasks.forEach((task) => {
      renderTask(task);
    });
  }

  //Евент листнеры
  DOMElements.addButton.addEventListener('click', addTask);
  DOMElements.addInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });
  DOMElements.allTasksBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentObservable.setState('all');
  });

  DOMElements.activeTasksBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentObservable.setState('active');
  });

  DOMElements.endTasksBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentObservable.setState('completed');
  });

  updateFilterButtons(currentObservable.getState());
  initialRender();
};
document.addEventListener('DOMContentLoaded', TodoApp);
export default TodoApp;
