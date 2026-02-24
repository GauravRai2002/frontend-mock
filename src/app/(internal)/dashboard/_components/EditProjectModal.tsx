'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { X, Loader2 } from 'lucide-react'
import { updateProject, type Project } from '@/lib/api'

interface EditProjectModalProps {
    project: Project
    onClose: () => void
    onUpdated: (updated: Project) => void
}

const EditProjectModal = ({ project, onClose, onUpdated }: EditProjectModalProps) => {
    const { getToken } = useAuth()
    const [name, setName] = useState(project.name)
    const [description, setDescription] = useState(project.description ?? '')
    const [isPublic, setIsPublic] = useState(project.is_public === 1)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { inputRef.current?.focus() }, [])
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        try {
            setSaving(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const updated = await updateProject(token, project.project_id, {
                name: name.trim(),
                description: description.trim(),
                isPublic,
            })
            onUpdated(updated)
            onClose()
        } catch (err: any) {
            setError(err.message ?? 'Failed to update project')
            setSaving(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Edit project</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">Project name</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2.5">
                        <div>
                            <p className="text-xs font-medium text-foreground">Public project</p>
                            <p className="text-xs text-muted-foreground">Anyone with the slug can hit your mocks</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPublic(p => !p)}
                            className={`relative w-8 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${isPublic ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-3' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {error && <p className="text-xs text-destructive">{error}</p>}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || saving}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {saving && <Loader2 size={12} className="animate-spin" />}
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProjectModal
