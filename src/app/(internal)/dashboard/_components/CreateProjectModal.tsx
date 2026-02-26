'use client'
import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2, Sparkles, Wand2 } from 'lucide-react'

interface CreateProjectModalProps {
    onClose: () => void
    onCreate: (name: string, description: string) => Promise<void>
    onGenerate?: (prompt: string) => Promise<void>
    error?: string | null
}

const CreateProjectModal = ({ onClose, onCreate, onGenerate, error }: CreateProjectModalProps) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [prompt, setPrompt] = useState('')
    const [creating, setCreating] = useState(false)
    const [tab, setTab] = useState<'manual' | 'ai'>('manual')
    const inputRef = useRef<HTMLInputElement>(null)
    const promptRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (tab === 'manual') inputRef.current?.focus()
        else promptRef.current?.focus()
    }, [tab])

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
        setCreating(true)
        try {
            if (tab === 'manual') {
                if (!name.trim()) return
                await onCreate(name.trim(), description.trim())
            } else {
                if (!prompt.trim() || !onGenerate) return
                await onGenerate(prompt.trim())
            }
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

                {/* Tabs */}
                {onGenerate && (
                    <div className="flex px-5 pt-3 border-b border-border mb-2">
                        <button
                            type="button"
                            onClick={() => setTab('manual')}
                            className={`pb-2 px-1 mr-4 text-sm font-medium transition-colors border-b-2 ${tab === 'manual' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                        >
                            Manual
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('ai')}
                            className={`pb-2 px-1 flex gap-1.5 items-center text-sm font-medium transition-colors border-b-2 ${tab === 'ai' ? 'text-purple-500 border-purple-500' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                        >
                            <Sparkles size={14} className={tab === 'ai' ? 'text-purple-500' : 'text-muted-foreground'} />
                            AI Generation
                        </button>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    {tab === 'manual' ? (
                        <>
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
                        </>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground flex items-center gap-1">
                                <Wand2 size={14} className="text-purple-500" /> Explain your API
                            </label>
                            <p className="text-xs text-muted-foreground mb-1">
                                Describe the API you want. We'll generate endpoints, methods, and a few mock responses to get you started.
                            </p>
                            <textarea
                                ref={promptRef}
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="E.g., A simple blogging API with users and posts."
                                rows={4}
                                maxLength={1000}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                            />
                            <p className="text-[10px] text-right text-muted-foreground">
                                {prompt.length}/1000
                            </p>
                        </div>
                    )}

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
                        {tab === 'manual' ? (
                            <button
                                type="submit"
                                disabled={!name.trim() || creating}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {creating && <Loader2 size={12} className="animate-spin" />}
                                Create project
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!prompt.trim() || creating}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={14} />
                                        Generate API
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateProjectModal
