import { useEffect, useMemo, useState } from 'react'
import type { Trip, View } from './types'
import {
  buildDaysFromRange,
  countStops,
  createActivity,
  createTrip,
  formatDisplayDate,
  loadTrips,
  saveTrips,
  tripSummaryText,
  uid,
} from './lib/itinerary'
import { Home } from './components/Home'
import { TripEditor } from './components/TripEditor'
import { PrintView } from './components/PrintView'
import './App.css'

function App() {
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips())
  const [view, setView] = useState<View>({ name: 'home' })
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const activeTrip = useMemo(() => {
    if (view.name === 'home') return null
    return trips.find((trip) => trip.id === view.tripId) ?? null
  }, [trips, view])

  function showToast(message: string) {
    setToast(message)
  }

  function upsertTrip(next: Trip) {
    const stamped = { ...next, updatedAt: new Date().toISOString() }
    setTrips((prev) => {
      const index = prev.findIndex((trip) => trip.id === stamped.id)
      if (index === -1) return [stamped, ...prev]
      const copy = [...prev]
      copy[index] = stamped
      return copy
    })
  }

  function handleCreateTrip() {
    const trip = createTrip({
      title: 'New itinerary',
      destination: '',
    })
    upsertTrip(trip)
    setView({ name: 'editor', tripId: trip.id })
  }

  function handleOpenTrip(tripId: string) {
    setView({ name: 'editor', tripId })
  }

  function handleDeleteTrip(tripId: string) {
    setTrips((prev) => prev.filter((trip) => trip.id !== tripId))
    if (view.name !== 'home' && view.tripId === tripId) {
      setView({ name: 'home' })
    }
    showToast('Trip removed')
  }

  function handleDuplicateTrip(tripId: string) {
    const source = trips.find((trip) => trip.id === tripId)
    if (!source) return
    const now = new Date().toISOString()
    const clone: Trip = {
      ...structuredClone(source),
      id: uid('trip'),
      title: `${source.title} (copy)`,
      createdAt: now,
      updatedAt: now,
      days: source.days.map((day) => ({
        ...day,
        id: uid('day'),
        activities: day.activities.map((activity) => ({
          ...activity,
          id: uid('act'),
        })),
      })),
    }
    upsertTrip(clone)
    setView({ name: 'editor', tripId: clone.id })
    showToast('Trip duplicated')
  }

  function handleUpdateTrip(patch: Partial<Trip>) {
    if (!activeTrip) return
    let next: Trip = { ...activeTrip, ...patch }
    if (patch.startDate !== undefined || patch.endDate !== undefined) {
      next = {
        ...next,
        days: buildDaysFromRange(next.startDate, next.endDate, activeTrip.days),
      }
    }
    upsertTrip(next)
  }

  async function handleCopySummary(trip: Trip) {
    try {
      await navigator.clipboard.writeText(tripSummaryText(trip))
      showToast('Itinerary copied')
    } catch {
      showToast('Could not copy — try Print instead')
    }
  }

  return (
    <div className="app-shell">
      {view.name === 'home' && (
        <Home
          trips={trips}
          onCreate={handleCreateTrip}
          onOpen={handleOpenTrip}
          onDelete={handleDeleteTrip}
          onDuplicate={handleDuplicateTrip}
          countStops={countStops}
          formatDisplayDate={formatDisplayDate}
        />
      )}

      {view.name === 'editor' && activeTrip && (
        <TripEditor
          trip={activeTrip}
          onBack={() => setView({ name: 'home' })}
          onUpdate={handleUpdateTrip}
          onDelete={() => handleDeleteTrip(activeTrip.id)}
          onDuplicate={() => handleDuplicateTrip(activeTrip.id)}
          onPrint={() => setView({ name: 'print', tripId: activeTrip.id })}
          onCopy={() => handleCopySummary(activeTrip)}
          createActivity={createActivity}
          formatDisplayDate={formatDisplayDate}
        />
      )}

      {view.name === 'print' && activeTrip && (
        <PrintView
          trip={activeTrip}
          onBack={() => setView({ name: 'editor', tripId: activeTrip.id })}
          formatDisplayDate={formatDisplayDate}
        />
      )}

      {view.name !== 'home' && !activeTrip && (
        <div className="missing-trip">
          <p>That trip could not be found.</p>
          <button type="button" className="btn btn-primary" onClick={() => setView({ name: 'home' })}>
            Back to Itnry
          </button>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
