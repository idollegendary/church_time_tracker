import React, { useState, useEffect } from 'react'
import axios from '../services/api'
import Avatar from '../components/Avatar'
import ConfirmModal from '../components/ConfirmModal'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Manage() {
  const [churchName, setChurchName] = useState('')
  const [preacherName, setPreacherName] = useState('')
  const [preacherAvatar, setPreacherAvatar] = useState('')
  const [editingPreacherId, setEditingPreacherId] = useState(null)
  const [toDeleteId, setToDeleteId] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteChurchId, setToDeleteChurchId] = useState(null)
  const [confirmChurchOpen, setConfirmChurchOpen] = useState(false)
  const [churches, setChurches] = useState([])
  const [preachers, setPreachers] = useState([])
  const [churchMap, setChurchMap] = useState({})
  const [selectedChurch, setSelectedChurch] = useState('')

  useEffect(() => {
    fetchChurches()
    fetchPreachers()
  }, [])

  async function fetchChurches() {
    try {
      const res = await axios.get('/api/churches')
      setChurches(res.data)
      const map = {}
      res.data.forEach(x=> map[x.id]=x)
      setChurchMap(map)
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchPreachers() {
    try {
      const res = await axios.get('/api/preachers')
      setPreachers(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  async function createChurch(e) {
    e.preventDefault()
    if (!churchName) return
    try {
      await axios.post('/api/churches', { name: churchName })
      setChurchName('')
      fetchChurches()
    } catch (e) {
      console.error(e)
      alert('Failed to create church')
    }
  }

  async function createPreacher(e) {
    e.preventDefault()
    if (!preacherName || !selectedChurch) {
      alert('Provide preacher name and select a church')
      return
    }
    try {
      if(editingPreacherId){
        await axios.patch(`/api/preachers/${editingPreacherId}`, { name: preacherName, church_id: selectedChurch, avatar_url: preacherAvatar || null })
        setEditingPreacherId(null)
        alert('Preacher updated')
      } else {
        await axios.post('/api/preachers', {
          name: preacherName,
          church_id: selectedChurch,
          avatar_url: preacherAvatar || null
        })
        alert('Preacher created')
      }
      setPreacherName('')
      setPreacherAvatar('')
      setSelectedChurch('')
      fetchPreachers()
    } catch (e) {
      console.error(e)
      alert('Failed to create preacher')
    }
  }

  function onEditPreacher(p){
    setEditingPreacherId(p.id)
    setPreacherName(p.name || '')
    setPreacherAvatar(p.avatar_url || '')
    setSelectedChurch(p.church_id || '')
  }

  function requestDeletePreacher(id){
    setToDeleteId(id)
    setConfirmOpen(true)
  }

  async function deletePreacher(id){
    try{
      await axios.delete(`/api/preachers/${id}`)
      setConfirmOpen(false)
      setToDeleteId(null)
      fetchPreachers()
    }catch(e){ console.error(e); alert('Delete failed') }
  }

  function requestDeleteChurch(id){
    setToDeleteChurchId(id)
    setConfirmChurchOpen(true)
  }

  async function deleteChurch(id){
    try{
      await axios.delete(`/api/churches/${id}`)
      setConfirmChurchOpen(false)
      setToDeleteChurchId(null)
      fetchChurches()
      fetchPreachers()
    }catch(e){ console.error(e); alert('Delete failed') }
  }

  return (
    <div className="w-full px-4 space-y-6">
      <h3 className="text-2xl font-semibold">Manage</h3>

      <section className="mb-4">
        <Card>
          <h4 className="font-medium">Create Church</h4>
          <form onSubmit={createChurch} className="flex gap-3 items-center mt-2">
          <input
            className="border rounded px-3 py-1"
            placeholder="Church name"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
          />
          <Button type="submit" variant="primary">Create</Button>
          </form>
        </Card>
      </section>

      <section className="mb-4">
        <Card>
          <h4 className="font-medium">Existing Churches</h4>
          <div className="mt-3 space-y-2">
            {churches.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded card-hover">
                <div className="truncate">{c.name}</div>
                <div>
                  <Button variant="danger" size="sm" onClick={()=>requestDeleteChurch(c.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mb-4">
        <Card>
          <h4 className="font-medium">Create Preacher (with avatar)</h4>
          <form onSubmit={createPreacher} className="flex gap-3 items-center mt-2 flex-wrap">
          <select className="border rounded px-2 py-1" value={selectedChurch} onChange={(e) => setSelectedChurch(e.target.value)}>
            <option value="">-- select church --</option>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            className="border rounded px-3 py-1"
            placeholder="Preacher name"
            value={preacherName}
            onChange={(e) => setPreacherName(e.target.value)}
          />

          <input
            className="border rounded px-3 py-1 w-64"
            placeholder="Avatar URL (optional)"
            value={preacherAvatar}
            onChange={(e) => setPreacherAvatar(e.target.value)}
          />

          <Button type="submit" variant="primary">{editingPreacherId ? 'Save' : 'Create'}</Button>
          </form>

          {preacherAvatar ? (
            <div className="mt-2 flex items-center gap-2">
              <strong>Preview:</strong>
              <Avatar src={preacherAvatar} name={preacherName} size={48} />
            </div>
          ) : null}
        </Card>
      </section>

      <section>
        <Card>
          <h4 className="font-medium">Existing Preachers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {preachers.map((p) => (
              <div key={p.id} className="card p-3 card-hover flex gap-3 items-start">
                <Avatar src={p.avatar_url} name={p.name} id={p.id} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-sm text-muted truncate">{churchMap[p.church_id]?.name || p.church_id || '—'}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1" />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" size="sm" onClick={()=>onEditPreacher(p)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={()=>requestDeletePreacher(p.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      <ConfirmModal open={confirmOpen} title="Delete preacher" description="This will remove the preacher and cannot be undone." onCancel={()=>{ setConfirmOpen(false); setToDeleteId(null) }} onConfirm={()=>deletePreacher(toDeleteId)} />
      <ConfirmModal open={confirmChurchOpen} title="Delete church" description="This will remove the church and all its associations and cannot be undone." onCancel={()=>{ setConfirmChurchOpen(false); setToDeleteChurchId(null) }} onConfirm={()=>deleteChurch(toDeleteChurchId)} />
    </div>
  )
}
