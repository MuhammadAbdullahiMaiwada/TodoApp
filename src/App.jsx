import React, { useEffect, useState, useRef } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

export default function App() {
  // safe load from localstorage
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parsed(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [query, setQuery] = useState("");
  const [sortBy, SetSortBy] = useState("created"); //s for creating | date |alpha | completed
  const audioRefs = useRef({
    ping: new Audio("/sounds/alarm.wav"),
    alrm: new Audio("/sounds/alrm.wav"),
    beep: new Audio("/sounds/beep.wav"),
  });

  //persist safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch { }
  }, [todos]);

  //request notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => { });
    }
  }, []);

  //background checker every 15 second, check reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      let changed = false;
      const updated = todos.map((t) => {
        if (t.reminder && !t.notified) {
          const when = new Date(t.reminder).getTime();
          if (!isNaN(when) && now >= when) {
            //fire notification + Sound 
            try {
              //play audio (may be block until  user interection)
              const soundKey = t.sound || "ping";
              const audio = audioRefs.current[soundKey] || audioRefs.current.ping;
              audio.currentTime = 0;
              audio.play().catch(() => { });
            } catch { }

            //browser notification if allowed 
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Todo Reminder", {
                body: t.text,
                silent: false,
              });
            }
            //also show a fallback alert
            //(avoid spamming: only show if window is focused or permission denied)
            try {
              if (document.hasFocus()) {
                //small non-blocking toast approach: use alert only if focused
                //(you can replace with a nicer UI toast)
                //eslint-disable-next-lne no-alert
                alert(`Reminder: ${t.text}`);
              }
            } catch { }
            changed = true
            return { ...t, notified: true };
          }
        }
        return t;
      });
      if (changed) setTodos(updated);
    };

    const id = setInterval(checkReminders, 1500); // for 15s
    //Also run immediately once
    checkReminders();
    return () => clearInterval(id);
  }, [todos]);

  //CRUD operation
  const addTodo = ({ text, reminder, sound }) => {
    const newTodo = {
      id: Date.now(),
      text,
      reminder: reminder || null,
      sound: sound || "ping",
      completed: false,
      createdAt: Date.now(),
      notified: false,
    };
    setTodos((s) => [newTodo, ...s]);
  };

  const toggleTodo = (id) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  };

  const deleteTodo = (id) => {
    setTodos((s) => s.filter((t) => t.id !== id));
  };

  const editTodo = (id, newFields) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, ...newFields } : t)));
  };

  const clearAll = () => {
    setTodos([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  //derived & sorted list
  const filterd = todos.filter((t) =>
    t.text.toLowerCase().includes(query.trim().toLowerCase())
  );

  const sorted = filterd.slice().sort((a, b) => {
    if (sortBy === "date") {
      const ad = a.reminder ? new Date(a.reminder).getTime() : Infinity;
      const bd = b.reminder ? new Date(b.reminder).getTime() : Infinity;
      return ad - bd;
    }
    if (sortBy === "alpha") {
      return a.text.localeCompare(b.text);
    }
    if (sortBy === "completed") {
      return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
    }
    //created (default)
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="container">
      <h1>Todo App Reminders</h1>

      <div className="top-controls">
        <div className="search">
          <input placeholder="Search todos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="sort">
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => SetSortBy(e.target.value)}>
            <option value="created">Newest</option>
            <option value="date">By Date</option>
            <option value="alpha">A - Z</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <TodoForm addTodo={addTodo} />

      <TodoList
        todos={sorted}
        toggleTodo={toggleTodo}
        deleteTodo={deleteTodo}
        editTodo={editTodo}
      />

      {todos.length > 0 && (
        <button className="clear-btn" onClick={clearAll}>
          Clear All
        </button>
      )}
      <p className="note">
        Note: Reminders and sounds work while the page is open. For background /push notifications
        when the browser is closed you'd need a Service worker +  push (PWA) or server push.
      </p>
    </div>
  )
}
