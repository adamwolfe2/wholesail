'use client'

import { useState } from 'react'

interface PickItem {
  id: string
  name: string
  quantity: number
  category: string
  unit: string
}

export function PickListItems({ items }: { items: PickItem[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const checkedCount = Object.values(checked).filter(Boolean).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-ink/50 uppercase tracking-wider">
          Items ({items.length})
        </p>
        <p className="text-xs text-ink/40 print:hidden">
          {checkedCount} of {items.length} picked
        </p>
      </div>

      <table className="w-full border-collapse border border-shell">
        <thead>
          <tr className="bg-cream border-b border-shell">
            <th className="w-10 p-3 text-left print:hidden">
              <span className="sr-only">Picked</span>
            </th>
            <th className="p-3 text-left text-xs font-medium text-ink/50 uppercase tracking-wider">
              Product
            </th>
            <th className="p-3 text-left text-xs font-medium text-ink/50 uppercase tracking-wider">
              Category
            </th>
            <th className="p-3 text-right text-xs font-medium text-ink/50 uppercase tracking-wider">
              Qty
            </th>
            <th className="p-3 text-left text-xs font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
              Unit
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              className={`border-b border-shell transition-colors ${
                checked[item.id] ? 'bg-shell/30' : i % 2 === 0 ? 'bg-white' : 'bg-cream/50'
              }`}
            >
              <td className="p-3 print:hidden">
                <input
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={() => toggle(item.id)}
                  className="w-4 h-4 border-sand accent-ink cursor-pointer"
                />
              </td>
              <td className="p-3">
                <span
                  className={`text-sm font-medium ${
                    checked[item.id] ? 'line-through text-ink/40' : 'text-ink'
                  }`}
                >
                  {item.name}
                </span>
              </td>
              <td className="p-3">
                <span className="text-xs text-ink/50 uppercase tracking-wider">
                  {item.category}
                </span>
              </td>
              <td className="p-3 text-right">
                <span className="text-sm font-bold text-ink">{item.quantity}</span>
              </td>
              <td className="p-3 hidden sm:table-cell">
                <span className="text-xs text-ink/50">{item.unit}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
