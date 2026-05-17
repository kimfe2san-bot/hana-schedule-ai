"use client"

import { useEffect, useState, useRef } from "react"
import { CheckSquare, Plus, X, Check } from "lucide-react"

interface Todo {
  id: string
  text: string
  done: boolean
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const submitting = useRef(false)

  const fetchTodos = () => {
    fetch(`/api/todos?date=${todayStr()}`)
      .then((r) => r.json())
      .then((d) => setTodos(d.todos || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTodos() }, [])

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const handleAdd = async () => {
    if (submitting.current) return
    if (!input.trim()) { setAdding(false); return }
    submitting.current = true
    const text = input.trim()
    setInput("")
    setAdding(false)
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, date: todayStr() }),
      })
      const data = await res.json()
      if (data.todo) setTodos((prev) => [...prev, data.todo])
    } finally {
      submitting.current = false
    }
  }

  const toggleDone = async (id: string, done: boolean) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done } : t))
    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done }),
    })
  }

  const deleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" })
  }

  const done = todos.filter((t) => t.done)
  const pending = todos.filter((t) => !t.done)

  return (
    <div className="card animate-in h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={16} className="text-[#1a73e8]" />
          <h2 className="text-[14px] font-semibold text-[#202124]">오늘의 할 일</h2>
          {todos.length > 0 && (
            <span className="text-[11px] text-[#9aa0a6]">
              {done.length}/{todos.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#1a73e8] transition-colors"
          title="추가"
        >
          <Plus size={15} strokeWidth={2} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-[#f1f3f4] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {/* 입력 폼 */}
          {adding && (
            <div className="flex items-center gap-2 py-1">
              <div className="w-4 h-4 rounded border-2 border-[#dadce0] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd()
                  if (e.key === "Escape") { setAdding(false); setInput("") }
                }}
                onBlur={handleAdd}
                placeholder="할 일 입력..."
                className="flex-1 text-[13px] text-[#202124] outline-none bg-transparent placeholder-[#9aa0a6]"
              />
            </div>
          )}

          {/* 미완료 */}
          {pending.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-[#f8f9fa] transition-colors"
            >
              <button
                onClick={() => toggleDone(todo.id, true)}
                className="w-4 h-4 rounded border-2 border-[#dadce0] flex-shrink-0 hover:border-[#1a73e8] transition-colors flex items-center justify-center"
              />
              <span className="flex-1 text-[13px] text-[#202124] truncate">{todo.text}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-[#9aa0a6] hover:text-[#5f6368] transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* 완료 */}
          {done.length > 0 && (
            <>
              {pending.length > 0 && <div className="border-t border-[#f1f3f4] my-2" />}
              {done.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-[#f8f9fa] transition-colors"
                >
                  <button
                    onClick={() => toggleDone(todo.id, false)}
                    className="w-4 h-4 rounded border-2 border-[#1a73e8] bg-[#1a73e8] flex-shrink-0 flex items-center justify-center"
                  >
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </button>
                  <span className="flex-1 text-[13px] text-[#9aa0a6] truncate line-through">{todo.text}</span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#9aa0a6] hover:text-[#5f6368] transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* 빈 상태 */}
          {todos.length === 0 && !adding && (
            <div className="text-center py-6">
              <p className="text-[13px] text-[#9aa0a6] mb-2">오늘 할 일이 없어요</p>
              <button
                onClick={() => setAdding(true)}
                className="text-[12px] text-[#1a73e8] font-medium hover:underline"
              >
                추가하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
