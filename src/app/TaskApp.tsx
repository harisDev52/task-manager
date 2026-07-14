"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Task } from "./types";
import WeatherBadge from "./WeatherBadge";

export default function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const data: Task[] = await res.json();
      setTasks(data);
    } catch {
      setError("Could not load tasks. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const created: Task = await res.json();
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
    } catch {
      setError("Could not add task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleCompleted(task: Task) {
    const updated = { ...task, completed: !task.completed };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updated.completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
    } catch {
      setError("Could not update task.");
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function saveEditing(task: Task) {
    const title = editingTitle.trim();
    if (!title || title === task.title) {
      cancelEditing();
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      setError("Could not save changes.");
    } finally {
      cancelEditing();
    }
  }

  async function deleteTask(id: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete task");
    } catch {
      setError("Could not delete task.");
      setTasks(previous);
    }
  }

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Task Manager
        </h1>
        <WeatherBadge />
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {loading
          ? "Loading tasks…"
          : `${remaining} of ${tasks.length} task${tasks.length === 1 ? "" : "s"} remaining`}
      </p>

      <form onSubmit={handleAdd} className="mt-6 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new task…"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <button
          type="submit"
          disabled={submitting || !newTitle.trim()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <ul className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {!loading && tasks.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-500">
            No tasks yet — add your first one above.
          </li>
        )}

        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleCompleted(task)}
              className="h-4 w-4 shrink-0 accent-neutral-900 dark:accent-white"
              aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
            />

            {editingId === task.id ? (
              <input
                type="text"
                value={editingTitle}
                autoFocus
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => saveEditing(task)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEditing(task);
                  if (e.key === "Escape") cancelEditing();
                }}
                className="flex-1 rounded border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            ) : (
              <span
                onDoubleClick={() => startEditing(task)}
                className={`flex-1 truncate text-sm ${
                  task.completed
                    ? "text-neutral-400 line-through"
                    : "text-neutral-900 dark:text-neutral-100"
                }`}
              >
                {task.title}
              </span>
            )}

            <button
              onClick={() => startEditing(task)}
              className="shrink-0 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Edit
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
