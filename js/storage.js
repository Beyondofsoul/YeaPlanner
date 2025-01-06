export const Storage = {
  saveTask(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },
  loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  },
};
