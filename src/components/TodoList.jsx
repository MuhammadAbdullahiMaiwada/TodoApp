import React, { useLayoutEffect, useState } from "react";

export default function TodoList({ todos, toggleTodo, deleteTodo, editTodo }) {
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [editReminder, setEditReminder] = useState("");
    const [editSound, setEditSound] = useState("ping");

    const startEdit = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
        setEditReminder(todo.reminder || "");
        setEditSound(todo.sound || "ping");
    };

    const saveEdit = (id) => {
        editTodo(id, { text: editText, reminder: editReminder || null, sound: editSound, notified: false });
        setEditingId(null);
    };

    const formatDate = (d) => {
        try {
            return new Date(d).toLocaleDateString();
        } catch {
            return "";
        }
    };

    const deadlineClass = (reminder) => {
        if (!reminder) return "";
        const when = new Date(reminder).setSeconds(0, 0);
        const now = new Date().setSeconds(0, 0);
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);
        const whenMs = new Date(reminder).getTime();
        if (whenMs < Date.now()) return "expired"
        if (whenMs >= startOfToday.getTime() && whenMs <= endOfToday.getTime()) return "due-today";
        return "future";
    };

    return (
        <ul className="todo-lists">
            {todos.length === 0 && <p className="emptys">No tasks yet...</p>}
            {todos.map((t) => (
                <li key={t.id} className={`todo-items ${t.completed ? "completed" : ""} ${deadlineClass(t.reminder)}`}>
                    {editingId === t.id ? (
                        <div className="edit-row">
                            <input value={editText} onChange={(e) => setEditText(e.target.value)} />
                            <input type="datetime-local" value={editReminder} onChange={(e) => setEditReminder(e.target.value)} />
                            <select value={editSound} onChange={(e) => setEditSound(e.target.value)}>
                                <option value="ping">Ping</option>
                                <option value="alarm">Alarm</option>
                                <option value="beep">Beep</option>
                            </select>
                            <div className="edit-section">
                                <button onClick={() => saveEdit(t.id)}>Save</button>
                                <button onClick={() => setEditingId(null)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="main" onClick={() => toggleTodo(t.id)}>
                                <span className="text">
                                    {t.text}
                                </span>
                                {t.reminder && <span className="reminder">{formatDate(t.reminder)}</span>}
                            </div>
                            <div className="right">
                                <button onClick={() => startEdit}>Edit</button>
                                <button onClick={() => deleteTodo(t.id)}>Delete</button>
                            </div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};
