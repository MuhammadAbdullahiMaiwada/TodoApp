import React, { use, useState } from "react";
import "./Todo.css";

const SOUND_OPTIONS = [
    { key: "ping", label: "Ping (soft)" },
    { key: "alarm", label: "Alarm(loud)" },
    { key: "beep", label: "Beep" },
];

export default function TodoForm({ addTodo }) {
    const [text, setText] = useState("");
    const [reminder, setReminder] = useState("");
    const [sound, setSound] = useState("ping");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        addTodo({ text: text.trim(), reminder: reminder || null, sound });
        setText("");
        setReminder("");
        setSound("ping");
    };

    return (
        <form className="todo-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Enter a task..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <input type="datetime-local"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
            />

            <select value={sound} onChange={(e) => setSound(e.target.value)}>
                {SOUND_OPTIONS.map((s) => (
                    <option key={s.key} value={s.key}>
                        {s.label}
                    </option>
                ))}
            </select>

            <button type="submit">Add</button>
        </form>
    );
};