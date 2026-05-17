"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { AppShell } from "@/components/layout/AppShell"
import { Project, ProjectCategory, CATEGORY_COLORS, CATEGORY_LABELS } from "@/types"
import { Plus, Trash2, Pause, Play, X } from "lucide-react"

const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: "content", label: "콘텐츠/유튜브" },
  { value: "business", label: "사업" },
  { value: "ai", label: "AI 자동화" },
  { value: "marketing", label: "마케팅" },
]

export default function ProjectsPage() {
  const { data: session } = useSession({ required: true })
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newCategory, setNewCategory] = useState<ProjectCategory>("content")

  useEffect(() => {
    if (session) {
      fetch("/api/projects")
        .then((r) => r.json())
        .then((d) => setProjects(d.projects || []))
        .finally(() => setLoading(false))
    }
  }, [session])

  const createProject = async () => {
    if (!newTitle.trim()) return
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDesc, category: newCategory }),
    })
    const { project } = await res.json()
    setProjects((prev) => [project, ...prev])
    setNewTitle("")
    setNewDesc("")
    setShowForm(false)
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    })
    const { project } = await res.json()
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)))
  }

  const deleteProject = async (id: string) => {
    if (!confirm("프로젝트를 삭제할까요?")) return
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" })
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const activeProjects = projects.filter((p) => p.status === "active")
  const pausedProjects = projects.filter((p) => p.status === "paused")
  const completedProjects = projects.filter((p) => p.status === "completed")

  const ProjectCard = ({ project }: { project: Project }) => {
    const color = CATEGORY_COLORS[project.category] || "#6b7280"
    return (
      <div className="bg-white border border-[#dadce0] rounded-xl p-4 lg:p-5 hover:shadow-sm hover:border-[#bdc1c6] transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[14px] font-semibold text-[#202124] truncate">{project.title}</span>
          </div>
          <div className="flex gap-1 flex-shrink-0 ml-2">
            <button
              onClick={() =>
                updateProject(project.id, {
                  status: project.status === "active" ? "paused" : "active",
                })
              }
              className="p-1.5 rounded-lg hover:bg-[#f1f3f4] text-[#9aa0a6] hover:text-[#5f6368] transition-colors"
            >
              {project.status === "active" ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              onClick={() => deleteProject(project.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-[#9aa0a6] hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {project.description && (
          <p className="text-[12px] text-[#5f6368] mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ color, background: `${color}15` }}
          >
            {CATEGORY_LABELS[project.category]}
          </span>
          <span className="text-[13px] font-bold" style={{ color }}>
            {project.progress}%
          </span>
        </div>

        <div className="progress-bar mb-2">
          <div
            className="progress-bar-fill"
            style={{ width: `${project.progress}%`, background: color }}
          />
        </div>

        <div className="flex justify-between">
          {[0, 25, 50, 75, 100].map((val) => (
            <button
              key={val}
              onClick={() => updateProject(project.id, { progress: val })}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                project.progress === val
                  ? "text-[#202124] bg-[#f1f3f4] font-semibold"
                  : "text-[#9aa0a6] hover:text-[#5f6368]"
              }`}
            >
              {val}%
            </button>
          ))}
        </div>

        {project.progress === 100 && project.status !== "completed" && (
          <button
            onClick={() => updateProject(project.id, { status: "completed" })}
            className="w-full mt-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-medium hover:bg-emerald-100 transition-colors border border-emerald-100"
          >
            완료로 표시 ✓
          </button>
        )}
      </div>
    )
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-[#202124]">프로젝트</h1>
            <p className="text-[#9aa0a6] text-xs lg:text-sm mt-0.5">장기 프로젝트 추적 & 진행률 관리</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[13px] font-medium transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">새 프로젝트</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-6 animate-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-[#202124]">새 프로젝트</h2>
              <button onClick={() => setShowForm(false)} className="text-[#9aa0a6] hover:text-[#202124] transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="프로젝트 이름"
                autoFocus
                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:bg-white transition-colors"
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="설명 (선택사항)"
                className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-lg px-4 py-2.5 text-sm text-[#202124] placeholder-[#9aa0a6] outline-none focus:border-[#1a73e8] focus:bg-white transition-colors"
              />
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setNewCategory(value)}
                    className="px-3 py-1.5 rounded-lg text-[12px] border transition-all"
                    style={{
                      borderColor: newCategory === value ? CATEGORY_COLORS[value] : "#dadce0",
                      color: newCategory === value ? CATEGORY_COLORS[value] : "#5f6368",
                      background: newCategory === value ? `${CATEGORY_COLORS[value]}15` : "transparent",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={createProject}
                disabled={!newTitle.trim()}
                className="w-full py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-40 text-white text-sm font-medium transition-colors"
              >
                프로젝트 생성
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-[#f1f3f4] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {activeProjects.length > 0 && (
              <div>
                <p className="text-[11px] text-[#9aa0a6] font-medium uppercase tracking-wider mb-3">
                  진행 중 ({activeProjects.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              </div>
            )}
            {pausedProjects.length > 0 && (
              <div>
                <p className="text-[11px] text-[#9aa0a6] font-medium uppercase tracking-wider mb-3">
                  일시중단 ({pausedProjects.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {pausedProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              </div>
            )}
            {completedProjects.length > 0 && (
              <div>
                <p className="text-[11px] text-[#9aa0a6] font-medium uppercase tracking-wider mb-3">
                  완료 ({completedProjects.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-40">
                  {completedProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              </div>
            )}
            {projects.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#9aa0a6] text-sm">프로젝트가 없습니다</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 text-[#1a73e8] hover:text-[#1557b0] text-sm flex items-center gap-1 mx-auto font-medium"
                >
                  <Plus size={14} /> 첫 번째 프로젝트 추가
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
