'use client'
import React, { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const METHOD_COLORS: Record<string, { text: string; bg: string }> = {
    GET: { text: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
    POST: { text: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
    PUT: { text: 'text-[#F97316]', bg: 'bg-[#F97316]/10' },
    DELETE: { text: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10' },
    PATCH: { text: 'text-[#A855F7]', bg: 'bg-[#A855F7]/10' },
    OPTIONS: { text: 'text-[#64748B]', bg: 'bg-[#64748B]/10' },
    HEAD: { text: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10' },
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
const METHODS: Method[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']

interface MethodDropdownProps {
    active: Method
    setActive: (m: Method) => void
}

const MethodDropdown = ({ active, setActive }: MethodDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const colors = METHOD_COLORS[active]

    return (
        <div ref={containerRef} className="relative flex-shrink-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold
          ${colors.text} ${colors.bg}
          border border-transparent hover:border-border
          transition-all duration-100 cursor-pointer select-none
        `}
            >
                <span className="w-14 text-left">{active}</span>
                <ChevronDown
                    size={12}
                    className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <ul className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-md shadow-lg overflow-hidden animate-scaleIn min-w-[110px]">
                    {METHODS.map((method) => {
                        const mc = METHOD_COLORS[method]
                        return (
                            <li key={method}>
                                <button
                                    onClick={() => { setActive(method); setIsOpen(false) }}
                                    className={`
                    w-full text-left px-3 py-2 text-xs font-bold cursor-pointer
                    ${mc.text}
                    ${active === method ? mc.bg : 'hover:bg-accent'}
                    transition-colors duration-75
                  `}
                                >
                                    {method}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default MethodDropdown