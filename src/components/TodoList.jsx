import TodoItem from "./TodoItem";

export default function TodoList({
  todos,
  toggleTodo,
  deleteTodo,
  editTodo,
  snoozeTodo,
}) {
  return (
    <ul className="todo-list">
      {todos.length === 0 && <p className="emptys">No tasks yet...</p>}

      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
          editTodo={editTodo}
          snoozeTodo={snoozeTodo}
        />
      ))}
    </ul>
  );
}
