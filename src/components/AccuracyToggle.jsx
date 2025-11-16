import React from 'react'

export default function AccuracyToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-2">
      <span className="text-xs text-sky-200">Location accuracy</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-white text-sm outline-none"
      >
        <option value="high">High (GPS)</option>
        <option value="balanced">Balanced</option>
        <option value="low">Battery saver</option>
      </select>
    </div>
  )
}
