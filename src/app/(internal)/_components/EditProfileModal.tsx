'use client'
import React, { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { X, Loader2 } from 'lucide-react'
import { updateProfile } from '@/lib/api'

interface EditProfileModalProps {
    currentName: string
    onClose: () => void
    onUpdated: (name: string) => void
}

const EditProfileModal = ({ currentName, onClose, onUpdated }: EditProfileModalProps) => {
    const { getToken } = useAuth()
    const [firstName, setFirstName] = useState(currentName.split(' ')[0] ?? '')
    const [lastName, setLastName] = useState(currentName.split(' ').slice(1).join(' '))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!firstName.trim() && !lastName.trim()) {
            setError('Enter at least a first or last name')
            return
        }
        try {
            setSaving(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const result = await updateProfile(token, {
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
            })
            onUpdated(result.name)
            onClose()
        } catch (err: any) {
            setError(err.message ?? 'Failed to update profile')
            setSaving(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-sm mx-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Edit profile</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground">First name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground">Last name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
                        >
                            {saving && <Loader2 size={12} className="animate-spin" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProfileModal
