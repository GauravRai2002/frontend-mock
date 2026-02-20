'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { TrendingUp, Clock, Loader2 } from 'lucide-react'
import { getProjectStats, type ProjectStats } from '@/lib/api'

interface StatsBarProps {
    projectId: string
}

const StatsBar = ({ projectId }: StatsBarProps) => {
    const { getToken } = useAuth()
    const [stats, setStats] = useState<ProjectStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const token = await getToken()
                if (!token) return
                const data = await getProjectStats(token, projectId)
                setStats(data)
            } catch {
                // Non-critical — silently fail
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [getToken, projectId])

    if (loading) return null
    if (!stats) return null

    const lastHit = stats.lastRequestAt
        ? new Date(stats.lastRequestAt).toLocaleString()
        : 'Never'

    return (
        <div className="flex items-center gap-4 px-4 py-1.5 bg-muted/30 border-b border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <TrendingUp size={11} className="text-primary" />
                <span>
                    <span className="font-semibold text-foreground">{stats.totalRequests.toLocaleString()}</span> total hits
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-primary" />
                <span>Last hit: <span className="text-foreground">{lastHit}</span></span>
            </div>
        </div>
    )
}

export default StatsBar
