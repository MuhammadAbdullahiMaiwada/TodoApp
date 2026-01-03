import React, { useState } from "react";
import "./Todo.css";

const SOUND_OPTIONS = [
  { key: "ping", label: "Ping (soft)" },
  { key: "alarm", label: "Alarm (loud)" },
  { key: "beep", label: "Beep" },
];

export default function TodoForm({ addTodo }) {
  const [text, setText] = useState("");
  const [reminder, setReminder] = useState("");
  const [sound, setSound] = useState("ping");
  const [repeat, setRepeat] = useState("none");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    addTodo({
      text: text.trim(),
      reminder: reminder || null,
      sound,
      repeat,
    });

    setText("");
    setReminder("");
    setSound("ping");
    setRepeat("none");
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter a task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <input
        type="datetime-local"
        value={reminder}
        onChange={(e) => setReminder(e.target.value)}
      />

      <select value={sound} onChange={(e) => setSound(e.target.value)}>
        {SOUND_OPTIONS.map(s => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>

      <select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
        <option value="none">No repeat</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>

      <button type="submit">Add</button>
    </form>
  );
}
