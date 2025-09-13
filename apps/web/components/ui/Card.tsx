"use client"
import React from 'react'

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="p-4 bg-gray-900 rounded-md">{children}</div>
}

/* Minimal Card component for layout and reuse. */

