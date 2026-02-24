'use client'
import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

interface CreateProjectModalProps {
    onClose: () => void
    onCreate: (name: string, description: string) => Promise<void>
    error?: string | null
}

const CreateProjectModal = ({ onClose, onCreate, error }: CreateProjectModalProps) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setCreating(true)
        try {
            await onCreate(name.trim(), description.trim())
        } finally {
            setCreating(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md mx-4 animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Create new project</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">Project name</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="My awesome API"
                            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {slug && (
                            <p className="text-xs text-muted-foreground font-mono">
                                slug: <span className="text-primary">{slug}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-foreground">
                            Description <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What does this project mock?"
                            rows={3}
                            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-destructive text-center">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || creating}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {creating && <Loader2 size={12} className="animate-spin" />}
                            Create project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateProjectModal
