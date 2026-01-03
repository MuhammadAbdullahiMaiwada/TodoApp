import React from "react";

export default function Stats({ total, completed, overdue, rate }) {
    return (
        <div className="stats">
            <div>Total: {total}</div>
            <div>Completed: {completed}</div>
            <div>Overdue: {overdue}</div>
            <div>Completion Rate: {rate}%</div>
        </div>
    );
}