import React, { useEffect, useState, useRef } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import ToastContainer from "./components/toast/ToastContainer";
import useToast from "./hooks/useToast";
import useAudioUnlock from "./hooks/useAudioUnlock";
import Stats from "./components/Stats";
import "./App.css";

const STORAGE_KEY = "todos_v2";

export default function App() {
  //  Toast system
  const { toasts, showToast, removeToast } = useToast();
  const [lastDeleted, setLastDeleted] = useState(null);


  // Unlock audio on first user interaction
  useAudioUnlock();

  //  Todos
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;

  const overdueTodos = todos.filter(t =>
    t.reminder &&

    new Date(t.reminder).getTime() < Date.now() &&
    !t.completed).length;

  const completionRate = totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("created");

  // Audio refs
  const audioRefs = useRef({
    ping: new Audio("/sounds/ping.wav"),
    alarm: new Audio("/sounds/alarm.wav"),
    beep: new Audio("/sounds/beep.wav"),
  });

  const playSound = (key = "ping") => {
    const audio = audioRefs.current[key] || audioRefs.current.ping;
    audio.currentTime = 0;
    audio.play().catch(() => { });
  };

  //  Persist todos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  //  Ask notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => { });
    }
  }, []);

  // REMINDER CHECKER (THIS IS THE MAGIC)
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      let changed = false;

      const updated = todos.map((t) => {
        if (t.reminder && !t.notified) {
          const when = new Date(t.reminder).getTime();
          if (!isNaN(when) && now >= when) {
            playSound(t.sound);

            if ("vibrate" in navigator) {
              navigator.vibrate([300, 150, 300]);
            }

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Todo Reminder", {
                body: t.text,
              });
            }

            showToast(`Reminder: ${t.text}`, { type: "info" });

            let nextReminder = null;
            if (t.repeat === "daily") {
              nextReminder = new Date(when + 24 * 60 * 60 * 1000).toISOString();
            }

            if (t.repeat === "weekly") {
              nextReminder = new Date(when + 7 * 24 * 60 * 60 * 1000).toISOString();
            }

            changed = true;

            return {
              ...t,
              reminder: nextReminder,
              notified: nextReminder ? false : true
            };
          }
        }
        return t;
      });

      if (changed) setTodos(updated);
    };


    const id = setInterval(checkReminders, 15000);
    checkReminders();

    return () => clearInterval(id);
  }, [todos, showToast]);

  // ➕ Add todo
  const addTodo = ({ text, reminder, sound, repeat }) => {
    const newTodo = {
      id: Date.now(),
      text,
      reminder: reminder || null,
      sound: sound || "ping",
      repeat: repeat || "none",
      completed: false,
      createdAt: Date.now(),
      notified: false,
    };

    setTodos((prev) => [newTodo, ...prev]);
    showToast("Todo added", { type: "success" });
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => {
      const todo = prev.find((t) => t.id === id);
      setLastDeleted(todo);
      return prev.filter((t) => t.id !== id);
    });

    showToast("Todo deleted", {
      type: "error",
      action: {
        label: "Undo",
        onClick: undoDelete,
      },
      duration: 5000,
    });
  };

  const undoDelete = () => {
    if (!lastDeleted) return;

    setTodos((prev) => [lastDeleted, ...prev]);
    setLastDeleted(null);

    showToast("Todo restored", { type: "success" });
  };

  const editTodo = (id, newFields) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...newFields, notified: false } : t))
    );
    showToast("Todo updated", { type: "info" });
  };

  //  Filter + sort
  const filtered = todos.filter((t) =>
    t.text.toLowerCase().includes(query.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "alpha") return a.text.localeCompare(b.text);
    if (sortBy === "completed") return a.completed - b.completed;
    return b.createdAt - a.createdAt;
  });


  const snoozeTodo = (id, minutes) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            reminder: new Date(Date.now() + minutes * 60000).toISOString(),
            notified: false
          }
          : t
      )
    );

    showToast(`Snoozed for ${minutes} minutes`, { type: "info" });
  }
  return (
    <div className="container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <h1> Todo App Reminders</h1>

      <div className="top-controls">
        <input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created">Newest</option>
          <option value="alpha">A–Z</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <TodoForm addTodo={addTodo} />

      <TodoList
        todos={sorted}
        toggleTodo={toggleTodo}
        deleteTodo={deleteTodo}
        editTodo={editTodo}
        snoozeTodo={snoozeTodo}
      />

      <Stats
        total={totalTodos}
        completed={completedTodos}
        overdue={overdueTodos}
        rate={completionRate}
      />
      {todos.length > 0 && (
        <button className="clear-btn" onClick={() => setTodos([])}>
          Clear All
        </button>
      )}
    </div>
  );
}
