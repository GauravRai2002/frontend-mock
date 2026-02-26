'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Plus, Search, Zap, Loader2, AlertCircle, RefreshCw, MoreVertical, Pencil, Trash2, Copy } from 'lucide-react'
import { getProjects, createProject, batchCreateProject, generateProjectStructure, duplicateProject, deleteProject, friendlyApiError, isPlanLimitError, type Project, type PlanLimitError, type AiGeneratedProjectResponse } from '@/lib/api'
import { useToast } from '@/components/Toast'
import CreateProjectModal from './_components/CreateProjectModal'
import EditProjectModal from './_components/EditProjectModal'
import UpgradeModal from '@/components/UpgradeModal'

const DashboardPage = () => {
  const router = useRouter()
  const { getToken } = useAuth()
  const toast = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [upgradeError, setUpgradeError] = useState<PlanLimitError | null>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch (server-side search) ──────────────────────────────────────
  const fetchProjects = async (q = '') => {
    try {
      setLoading(true)
      setError(null)
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const data = await getProjects(token, q || undefined)
      setProjects(data)
    } catch (err: any) {
      const msg = friendlyApiError(err)
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchProjects(value), 350)
  }

  // ── Create ────────────────────────────────────────────────────────────
  const handleCreate = async (name: string, description: string) => {
    try {
      setCreateError(null)
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const project = await createProject(token, { name, description })
      setIsCreateOpen(false)
      router.push(`/${project.project_id}`)
    } catch (err: any) {
      if (isPlanLimitError(err)) {
        setIsCreateOpen(false)
        setUpgradeError(err.details)
        return
      }
      const msg = friendlyApiError(err)
      setCreateError(msg)
      toast.error(msg)
    }
  }

  // ── AI Generate ───────────────────────────────────────────────────────
  const handleGenerate = async (prompt: string) => {
    try {
      setCreateError(null)
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      // 1. Get the AI structure
      const aiResponse = await generateProjectStructure(token, prompt)

      // 2. Derive project metadata
      const nameMatch = prompt.match(/^([a-z0-9\s-_]{3,30})/i)
      const inferredName = nameMatch ? nameMatch[0].trim() : 'AI Generated API'

      // 3. Dispatch to batch create
      const project = await batchCreateProject(token, {
        name: inferredName,
        description: `Generated from prompt: "${prompt}"`,
        endpoints: aiResponse.data || [],
      })

      setIsCreateOpen(false)
      router.push(`/${project.project_id}`)
      toast.success('Project generated successfully!')
    } catch (err: any) {
      if (isPlanLimitError(err)) {
        setIsCreateOpen(false)
        setUpgradeError(err.details)
        return
      }
      const msg = friendlyApiError(err)
      setCreateError(msg)
      toast.error(msg)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      setDeleting(id)
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      await deleteProject(token, id)
      setProjects(prev => prev.filter(p => p.project_id !== id))
      setDeleteConfirm(null)
    } catch (err: any) {
      toast.error(friendlyApiError(err))
    } finally {
      setDeleting(null)
    }
  }

  // ── Duplicate ─────────────────────────────────────────────────────────
  const handleDuplicate = async (id: string) => {
    try {
      setDuplicating(id)
      setMenuOpen(null)
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const cloned = await duplicateProject(token, id)
      setProjects(prev => [cloned, ...prev])
    } catch (err: any) {
      if (isPlanLimitError(err)) {
        setUpgradeError(err.details)
        return
      }
      toast.error(friendlyApiError(err))
    } finally {
      setDuplicating(null)
    }
  }

  return (
    <div className="flex-1 h-screen bg-background flex flex-col overflow-hidden" onClick={() => setMenuOpen(null)}>
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} /> New Project
          </button>
        </div>
        <div className="relative max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {loading && (
          <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading projects…</span>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <AlertCircle size={22} className="text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button onClick={() => fetchProjects(search)} className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}
        {!loading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <p className="text-sm">{search ? 'No projects match your search' : 'No projects yet'}</p>
            {!search && (
              <button onClick={() => setIsCreateOpen(true)} className="text-sm text-primary hover:underline cursor-pointer">
                Create your first project
              </button>
            )}
          </div>
        )}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.project_id}
                className="group relative bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-150 flex flex-col gap-3"
                onClick={() => router.push(`/${project.project_id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {duplicating === project.project_id
                      ? <Loader2 size={14} className="text-primary animate-spin" />
                      : <Zap size={14} className="text-primary" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                      {project.mock_count ?? 0} endpoints
                    </span>
                    {/* 3-dot menu */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === project.project_id ? null : project.project_id) }}
                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={13} />
                      </button>
                      {menuOpen === project.project_id && (
                        <div className="absolute right-0 top-6 z-20 bg-card border border-border rounded-md shadow-lg py-1 w-36 text-xs">
                          <button
                            onClick={() => { setEditProject(project); setMenuOpen(null) }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground cursor-pointer"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(project.project_id)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-foreground cursor-pointer"
                          >
                            <Copy size={11} /> Duplicate
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => { setDeleteConfirm(project.project_id); setMenuOpen(null) }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-destructive/10 text-destructive cursor-pointer"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {project.description || 'No description'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[110px]">{project.slug}</span>
                  <span className="text-xs text-muted-foreground">{new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => { setIsCreateOpen(false); setCreateError(null) }}
          onCreate={handleCreate}
          onGenerate={handleGenerate}
          error={createError}
        />
      )}

      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onUpdated={(updated) => {
            setProjects(prev => prev.map(p => p.project_id === updated.project_id ? { ...p, ...updated } : p))
            setEditProject(null)
          }}
        />
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-sm mx-4 p-5 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Delete project?</h2>
              <p className="text-xs text-muted-foreground mt-1">
                This permanently deletes the project and all its mocks. Cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={!!deleting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-destructive text-white text-sm font-medium rounded-md hover:bg-destructive/90 disabled:opacity-60 cursor-pointer"
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : null} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {upgradeError && (
        <UpgradeModal
          error={upgradeError}
          onClose={() => setUpgradeError(null)}
        />
      )}
    </div>
  )
}

export default DashboardPage