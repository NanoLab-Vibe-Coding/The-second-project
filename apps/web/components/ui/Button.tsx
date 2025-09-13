"use client"
import React from 'react'

export function Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-2 bg-indigo-600 rounded text-sm hover:brightness-110">
      {children}
    </button>
  )
}

/* Simple styled button used by the demo. */

