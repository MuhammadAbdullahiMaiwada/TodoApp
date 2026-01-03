import React from "react";
import "./Toast.css";
export default function Toast({ message, type = "info", onClose }) {
    return (
        <div className={`toast ${type}`}>
            <span>{message}</span>
            <button onClick={onClose}>×</button>
        </div>
    );
}