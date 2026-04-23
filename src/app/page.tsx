"use client";

import { useState, useEffect, useRef } from "react";

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: generateId(), text, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearDone = () => {
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;

  return (
    <main className="min-h-screen bg-[#f8f7f4] flex flex-col items-center px-4 py-16">
      {/* Header */}
      <div className="w-full max-w-lg mb-10">
        <h1 className="text-3xl font-light tracking-widest text-stone-800 mb-1">
          タスク
        </h1>
        <p className="text-sm text-stone-400 tracking-wide">
          {activeCount > 0
            ? `${activeCount}件の未完了タスク`
            : doneCount > 0
            ? "すべて完了しました 🎉"
            : "タスクを追加してください"}
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex gap-2 bg-white rounded-2xl shadow-sm border border-stone-100 p-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-3 py-2.5 text-stone-700 placeholder-stone-300 bg-transparent outline-none text-sm"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="px-5 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-medium
              hover:bg-stone-700 active:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-150"
          >
            追加
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      {todos.length > 0 && (
        <div className="w-full max-w-lg mb-4 flex gap-1 bg-stone-100 rounded-xl p-1">
          {(
            [
              { key: "all", label: `すべて (${todos.length})` },
              { key: "active", label: `未完了 (${activeCount})` },
              { key: "done", label: `完了済み (${doneCount})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                filter === key
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Todo list */}
      <div className="w-full max-w-lg space-y-2">
        {filtered.length === 0 && mounted && (
          <div className="text-center py-16 text-stone-300 text-sm tracking-wide">
            {filter === "done"
              ? "完了したタスクはありません"
              : filter === "active"
              ? "未完了のタスクはありません"
              : "タスクがありません"}
          </div>
        )}

        {filtered.map((todo) => (
          <div
            key={todo.id}
            className={`group flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5
              border border-stone-100 shadow-sm transition-all duration-200
              ${todo.done ? "opacity-60" : "hover:shadow-md hover:border-stone-200"}`}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                transition-all duration-200
                ${
                  todo.done
                    ? "bg-emerald-400 border-emerald-400"
                    : "border-stone-300 hover:border-emerald-400"
                }`}
              aria-label={todo.done ? "未完了に戻す" : "完了にする"}
            >
              {todo.done && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Text */}
            <span
              className={`flex-1 text-sm text-stone-700 transition-all duration-200 ${
                todo.done ? "line-through text-stone-400" : ""
              }`}
            >
              {todo.text}
            </span>

            {/* Delete button */}
            <button
              onClick={() => deleteTodo(todo.id)}
              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
                text-stone-300 hover:text-red-400 hover:bg-red-50
                opacity-0 group-hover:opacity-100 transition-all duration-150"
              aria-label="削除"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Clear done */}
      {doneCount > 0 && (
        <div className="w-full max-w-lg mt-6 flex justify-end">
          <button
            onClick={clearDone}
            className="text-xs text-stone-400 hover:text-red-400 transition-colors duration-150 tracking-wide"
          >
            完了済みを削除 ({doneCount}件)
          </button>
        </div>
      )}
    </main>
  );
}
