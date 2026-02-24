'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Loader2, AlertCircle, CopyPlus, LayoutTemplate, Layers, Plus, FolderOpen } from 'lucide-react'
import { getTemplates, getTemplate, applyTemplate, getProjects, type Template, type TemplateDetail, type Project } from '@/lib/api'
import { useToast } from '@/components/Toast'

const TemplatesPage = () => {
    const router = useRouter()
    const { getToken } = useAuth()
    const toast = useToast()

    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ── Template modal state ──
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [templateDetail, setTemplateDetail] = useState<TemplateDetail | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [applying, setApplying] = useState(false)

    // ── Mode: new project | existing project ──
    const [mode, setMode] = useState<'new' | 'existing'>('new')
    const [projectName, setProjectName] = useState<string>('')
    const [projects, setProjects] = useState<Project[]>([])
    const [projectsLoading, setProjectsLoading] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const temps = await getTemplates(token)
            setTemplates(temps)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch templates')
            toast.error(err.message || 'Error fetching data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleTemplateClick = async (template: Template) => {
        setSelectedTemplate(template)
        setProjectName(`${template.name} Project`)
        setTemplateDetail(null)
        setMode('new')
        setSelectedProjectId('')
        try {
            setDetailLoading(true)
            const token = await getToken()
            if (token) {
                const detail = await getTemplate(token, template.id)
                setTemplateDetail(detail)
            }
        } catch {
            toast.error('Failed to load template details')
        } finally {
            setDetailLoading(false)
        }
    }

    const handleModeSwitch = async (newMode: 'new' | 'existing') => {
        setMode(newMode)
        if (newMode === 'existing' && projects.length === 0) {
            try {
                setProjectsLoading(true)
                const token = await getToken()
                if (token) {
                    const list = await getProjects(token)
                    setProjects(list)
                    if (list.length > 0) setSelectedProjectId(list[0].project_id)
                }
            } catch {
                toast.error('Failed to load projects')
            } finally {
                setProjectsLoading(false)
            }
        }
    }

    const handleApply = async () => {
        if (!selectedTemplate) return
        if (mode === 'new' && !projectName.trim()) return
        if (mode === 'existing' && !selectedProjectId) return

        try {
            setApplying(true)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')

            const payload = mode === 'new'
                ? { projectName: projectName.trim() }
                : { projectId: selectedProjectId }

            const res = await applyTemplate(token, selectedTemplate.id, payload)

            if (mode === 'new') {
                toast.success(`Project created with ${res.appliedMocks} endpoints.`)
                router.push(`/${res.projectId}`)
            } else {
                toast.success(`Added ${res.appliedMocks} endpoints to your project.`)
                router.push(`/${res.projectId}`)
            }
            setSelectedTemplate(null)
        } catch (err: any) {
            toast.error(err.message || `Failed to apply template`)
        } finally {
            setApplying(false)
        }
    }

    return (
        <div className="flex-1 h-screen bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-border flex-shrink-0">
                <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Layers size={18} className="text-primary" /> Template Library
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Kickstart your MockBird projects with pre-configured API sets and complex conditions.
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                {loading && (
                    <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Loading templates…</span>
                    </div>
                )}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <AlertCircle size={22} className="text-destructive" />
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <button onClick={fetchData} className="text-xs text-primary hover:underline cursor-pointer">Retry</button>
                    </div>
                )}
                {!loading && !error && templates.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                        <LayoutTemplate size={24} className="opacity-50" />
                        <p className="text-sm">No templates available</p>
                    </div>
                )}
                {!loading && !error && templates.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {templates.map(template => (
                            <div
                                key={template.id}
                                className="group bg-card border border-border hover:border-primary/50 rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-lg cursor-pointer"
                                onClick={() => handleTemplateClick(template)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <LayoutTemplate size={18} className="text-primary" />
                                    </div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                                        {template.endpointCount} endpoints
                                    </span>
                                </div>
                                <div className="flex-1 mt-1">
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                                        {template.description || 'Pre-configured endpoints for quick testing.'}
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-border/50 mt-1">
                                    <span className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-5px] group-hover:translate-x-0">
                                        Apply template &rarr;
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            {selectedTemplate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && !applying && setSelectedTemplate(null)}
                >
                    <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md mx-4 animate-scaleIn flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-border">
                            <h2 className="text-sm font-semibold text-foreground">Apply Template</h2>
                        </div>

                        <div className="p-5 flex flex-col gap-5">
                            {/* Template info */}
                            <div className="bg-muted px-4 py-3 rounded-lg border border-border">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <LayoutTemplate size={14} className="text-primary" /> {selectedTemplate.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">Adds {selectedTemplate.endpointCount} endpoints to the selected project.</p>
                            </div>

                            {/* Mode toggle */}
                            <div className="flex rounded-lg border border-border overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => handleModeSwitch('new')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors cursor-pointer ${mode === 'new' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Plus size={12} /> New Project
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleModeSwitch('existing')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors cursor-pointer ${mode === 'existing' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                                >
                                    <FolderOpen size={12} /> Existing Project
                                </button>
                            </div>

                            {/* New project name input */}
                            {mode === 'new' && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-foreground">Project Name</label>
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="My Project"
                                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                </div>
                            )}

                            {/* Existing project dropdown */}
                            {mode === 'existing' && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-foreground">Select Project</label>
                                    {projectsLoading ? (
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
                                            <Loader2 size={12} className="animate-spin" /> Loading projects…
                                        </div>
                                    ) : projects.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No existing projects found.</p>
                                    ) : (
                                        <select
                                            value={selectedProjectId}
                                            onChange={e => setSelectedProjectId(e.target.value)}
                                            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            {projects.map(p => (
                                                <option key={p.project_id} value={p.project_id}>{p.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* Endpoints preview */}
                            {detailLoading ? (
                                <div className="flex items-center justify-center p-6 text-muted-foreground">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                            ) : templateDetail ? (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-medium text-foreground">Included Endpoints ({templateDetail.mocks.length})</label>
                                    <div className="flex flex-col gap-1 bg-muted/50 border border-border/50 rounded-lg p-2 max-h-36 overflow-y-auto">
                                        {templateDetail.mocks.map((m, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-[11px] px-2 py-1">
                                                <span className="font-bold text-muted-foreground w-12 flex-shrink-0">{m.method}</span>
                                                <span className="font-mono text-foreground truncate">{m.path}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="p-4 border-t border-border flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedTemplate(null)}
                                disabled={applying}
                                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying || (mode === 'new' ? !projectName.trim() : !selectedProjectId)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {applying ? <Loader2 size={14} className="animate-spin" /> : <CopyPlus size={14} />}
                                {applying
                                    ? (mode === 'new' ? 'Creating...' : 'Adding...')
                                    : (mode === 'new' ? 'Create Project' : 'Add to Project')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TemplatesPage
