import React from 'react'
import Button from './Button'

export default function AdminTable({ columns = [], rows = [], onEdit = ()=>{}, onDelete = ()=>{} }){
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-sm text-gray-600">
            {columns.map(col => <th key={col.key} className="px-3 py-2">{col.title}</th>)}
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-t">
              {columns.map(col => (
                <td key={col.key} className="px-3 py-3 align-top text-sm text-gray-800">{col.render ? col.render(row) : row[col.key]}</td>
              ))}
              <td className="px-3 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={()=>onEdit(row)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={()=>onDelete(row.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
