'use client'
import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface UnsavedChangesModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const UnsavedChangesModal = ({ isOpen, onClose, onConfirm }: UnsavedChangesModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-card border border-border rounded-xl shadow-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle size={18} />
                        <h2 className="text-sm font-semibold text-foreground">Unsaved Changes</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You have unsaved changes in the current mock. If you navigate away now, these changes will be permanently lost.
                    </p>
                    <p className="text-sm text-foreground mt-2 font-medium">
                        Are you sure you want to discard your changes and continue?
                    </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
                    >
                        Stay on page
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Discard changes
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UnsavedChangesModal
