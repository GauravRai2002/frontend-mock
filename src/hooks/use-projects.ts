'use client'
import { useAuth } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    type Project,
} from '@/lib/api'

export function useProjects() {
    const { getToken } = useAuth()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const data = await getProjects(token)
            setProjects(data)
        } catch (err: any) {
            setError(err.message ?? 'Failed to load projects')
        } finally {
            setLoading(false)
        }
    }, [getToken])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    const create = async (name: string, description: string, isPublic = false): Promise<Project> => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        const project = await createProject(token, { name, description, isPublic })
        setProjects(prev => [project, ...prev])
        return project
    }

    const update = async (id: string, payload: { name?: string; description?: string; isPublic?: boolean }) => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        const updated = await updateProject(token, id, payload)
        setProjects(prev => prev.map(p => p.project_id === id ? { ...p, ...updated } : p))
        return updated
    }

    const remove = async (id: string) => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        await deleteProject(token, id)
        setProjects(prev => prev.filter(p => p.project_id !== id))
    }

    return { projects, loading, error, refetch: fetchProjects, create, update, remove }
}
