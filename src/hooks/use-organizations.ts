'use client'
import { useAuth } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import {
    getOrganization,
    getOrganizationMembers,
    createOrganization,
    inviteOrgMember,
    removeOrgMember,
    updateOrgMemberRole,
    type Organization,
    type OrgMember,
} from '@/lib/api'

// ─── Org detail loader ────────────────────────────────────────────────────

export function useOrgDetail(orgId: string | null | undefined) {
    const { getToken } = useAuth()
    const [org, setOrg] = useState<Organization | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        if (!orgId) return
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const data = await getOrganization(token, orgId)
            setOrg(data)
        } catch (err: any) {
            setError(err.message ?? 'Failed to load organization')
        } finally {
            setLoading(false)
        }
    }, [getToken, orgId])

    useEffect(() => { fetch() }, [fetch])

    return { org, loading, error, refetch: fetch }
}

// ─── Org members loader ───────────────────────────────────────────────────

export function useOrgMembers(orgId: string | null | undefined) {
    const { getToken } = useAuth()
    const [members, setMembers] = useState<OrgMember[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async () => {
        if (!orgId) return
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const data = await getOrganizationMembers(token, orgId, { limit: 100 })
            setMembers(data.data)
            setTotalCount(data.totalCount)
        } catch (err: any) {
            setError(err.message ?? 'Failed to load members')
        } finally {
            setLoading(false)
        }
    }, [getToken, orgId])

    useEffect(() => { fetch() }, [fetch])

    return { members, totalCount, loading, error, refetch: fetch }
}

// ─── Org write actions ────────────────────────────────────────────────────

export function useOrgActions() {
    const { getToken } = useAuth()

    const create = async (payload: { name: string; slug?: string }): Promise<Organization> => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return createOrganization(token, payload)
    }

    const invite = async (orgId: string, payload: { emailAddress: string; role?: string }) => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return inviteOrgMember(token, orgId, payload)
    }

    const removeMember = async (orgId: string, membershipId: string) => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return removeOrgMember(token, orgId, membershipId)
    }

    const updateRole = async (orgId: string, membershipId: string, role: string) => {
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        return updateOrgMemberRole(token, orgId, membershipId, { role })
    }

    return { create, invite, removeMember, updateRole }
}
