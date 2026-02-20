'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Zap } from 'lucide-react'

interface CardProps {
  name: string
  description: string
  endpointCount: number
  updatedAt: string
  slug: string
}

const Card = ({ name, description, endpointCount, updatedAt, slug }: CardProps) => {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/${slug}`)}
      className="
        group relative bg-card border border-border rounded-lg p-4 cursor-pointer
        hover:border-primary/40 hover:shadow-md transition-all duration-150
        flex flex-col gap-3
      "
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-primary" />
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
          {endpointCount} endpoints
        </span>
      </div>

      {/* Name + description */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground font-mono">{slug}</span>
        <span className="text-xs text-muted-foreground">{updatedAt}</span>
      </div>
    </div>
  )
}

export default Card