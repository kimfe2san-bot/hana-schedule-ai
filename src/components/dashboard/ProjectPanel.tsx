"use client"

import { useEffect, useState } from "react"
import { FolderOpen, Plus, Loader2, ChevronRight } from "lucide-react"
import { Project, CATEGORY_COLORS, CATEGORY_LABELS } from "@/types"
import Link from "next/link"

export function ProjectPanel() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects?.filter((p: Project) => p.status === "active") || []))
      .finally(() => setLoading(false))
  }, [])

  const updateProgress = async (id: string, progress: number) => {
    await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, progress }),
    })
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, progress } : p))
    )
  }

  return (
    <div className="card animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-cyan-500" />
          <h2 className="text-[14px] font-semibold text-[#202124]">진행 중 프로젝트</h2>
        </div>
        <Link
          href="/projects"
          className="text-[12px] text-[#1a73e8] hover:text-[#1557b0] transition-colors flex items-center gap-1 font-medium"
        >
          전체 보기 <ChevronRight size={11} />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="animate-spin text-[#dadce0]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[13px] text-[#9aa0a6] mb-3">진행 중인 프로젝트 없음</p>
          <Link
            href="/projects"
            className="text-[13px] text-[#1a73e8] hover:text-[#1557b0] flex items-center justify-center gap-1 font-medium"
          >
            <Plus size={13} /> 프로젝트 추가
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.slice(0, 5).map((project) => {
            const color = CATEGORY_COLORS[project.category] || "#6b7280"
            return (
              <div key={project.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-[13px] text-[#202124] font-medium">{project.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#9aa0a6]">
                      {CATEGORY_LABELS[project.category]}
                    </span>
                    <span className="text-[12px] font-semibold" style={{ color }}>
                      {project.progress}%
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill cursor-pointer"
                    style={{ width: `${project.progress}%`, background: color }}
                    title="클릭하여 진행률 수정"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateProgress(project.id, val)}
                      className="text-[10px] text-[#9aa0a6] hover:text-[#5f6368] transition-colors"
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
