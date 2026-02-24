'use client'
import { useAuth } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import {
    getProject,
    getMock,
    createMock,
    updateMock,
    deleteMock,
    createMockResponse,
    updateMockResponse,
    deleteMockResponse,
    parseResponseHeaders,
    parseConditions,
    type ProjectDetail,
    type Mock,
    type MockDetail,
    type MockResponse,
    type Condition,
} from '@/lib/api'

// ─── Project + mocks loader ───────────────────────────────────────────────

export function useProjectDetail(projectId: string) {
    const { getToken } = useAuth()
    const [project, setProject] = useState<ProjectDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const data = await getProject(token, projectId)
            setProject(data)
        } catch (err: any) {
            setError(err.message ?? 'Failed to load project')
        } finally {
            setLoading(false)
        }
    }, [getToken, projectId])

    useEffect(() => { fetch() }, [fetch])

    return { project, loading, error, refetch: fetch }
}

// ─── Full mock detail (with responses) ───────────────────────────────────

export function useMockDetail(mockId: string | null) {
    const { getToken } = useAuth()
    const [mock, setMock] = useState<MockDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        if (!mockId) return
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const data = await getMock(token, mockId)
            setMock(data)
        } catch (err: any) {
            setError(err.message ?? 'Failed to load mock')
        } finally {
            setLoading(false)
        }
    }, [getToken, mockId])

    useEffect(() => { fetch() }, [fetch])

    return { mock, setMock, loading, saving, setSaving, error, refetch: fetch }
}

// ─── Mock CRUD ────────────────────────────────────────────────────────────

export function useMockActions(projectId: string) {
    const { getToken } = useAuth()

    const create = async (payload: {
        name: string
        path: string
        method: string
        description?: string
        responseType?: string
        responseDelay?: number
    }): Promise<Mock> => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return createMock(token, projectId, payload)
    }

    const update = async (mockId: string, payload: {
        name?: string
        path?: string
        method?: string
        description?: string
        responseType?: string
        responseDelay?: number
        isActive?: boolean
    }): Promise<Mock> => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return updateMock(token, mockId, payload)
    }

    const remove = async (mockId: string): Promise<void> => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return deleteMock(token, mockId)
    }

    return { create, update, remove }
}

// ─── Mock Response CRUD ───────────────────────────────────────────────────

export function useMockResponseActions(mockId: string | null) {
    const { getToken } = useAuth()

    const create = async (payload: {
        name?: string
        statusCode?: number
        headers?: Record<string, string>
        body?: string
        isDefault?: boolean
        weight?: number
        conditions?: Condition[]
    }): Promise<MockResponse> => {
        if (!mockId) throw new Error('No mock selected')
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return createMockResponse(token, mockId, payload)
    }

    const update = async (responseId: string, payload: {
        name?: string
        statusCode?: number
        headers?: Record<string, string>
        body?: string
        isDefault?: boolean
        weight?: number
        conditions?: Condition[]
    }): Promise<MockResponse> => {
        if (!mockId) throw new Error('No mock selected')
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return updateMockResponse(token, mockId, responseId, payload)
    }

    const remove = async (responseId: string): Promise<void> => {
        if (!mockId) throw new Error('No mock selected')
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return deleteMockResponse(token, mockId, responseId)
    }

    return { create, update, remove }
}

export { parseResponseHeaders, parseConditions }
