export const taskService = {
  createTask(text) {
    return {
      id: Date.now(),
      text,
      completed: false,
    };
  },
  filterTasks(tasks, filter) {
    return tasks.filter((task) => {
      switch (filter) {
        case 'active':
          return !task.completed;
        case 'completed':
          return task.completed;
        default:
          return true;
      }
    });
  },
};
