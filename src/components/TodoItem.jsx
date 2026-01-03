import React, { useEffect, useState } from "react";

export default function TodoItem({
  todo,
  toggleTodo,
  deleteTodo,
  editTodo,
  snoozeTodo,
}) {
  const [remaining, setRemaining] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const [reminder, setReminder] = useState(todo.reminder || "");
  const [sound, setSound] = useState(todo.sound || "ping");

  useEffect(() => {
    if (!todo.reminder) return;

    const interval = setInterval(() => {
      const diff = new Date(todo.reminder).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Due now");
        clearInterval(interval);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setRemaining(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [todo.reminder]);

  const saveEdit = () => {
    editTodo(todo.id, {
      text,
      reminder: reminder || null,
      sound,
    });
    setIsEditing(false);
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      {isEditing ? (
        <div className="edit-row">
          <input value={text} onChange={(e) => setText(e.target.value)} />
          <input
            type="datetime-local"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
          />
          <select value={sound} onChange={(e) => setSound(e.target.value)}>
            <option value="ping">Ping</option>
            <option value="alarm">Alarm</option>
            <option value="beep">Beep</option>
          </select>

          <button onClick={saveEdit}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <>
          <div onClick={() => toggleTodo(todo.id)}>
            <strong>{todo.text}</strong>
            {todo.reminder && <div className="countdown">{remaining}</div>}
          </div>

          <div className="action">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => snoozeTodo(todo.id, 10)}>Snooze 10m</button>
            <button onClick={() => snoozeTodo(todo.id, 30)}>Snooze 30m</button>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </div>
        </>
      )}
    </li>
  );
}
