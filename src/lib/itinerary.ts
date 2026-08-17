import type { Activity, ActivityCategory, DayPlan, Trip } from '../types'

const STORAGE_KEY = 'itnry.trips.v1'

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

export function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Trip[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return ''
  const date = new Date(`${iso}T12:00:00`)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function eachDateInclusive(start: string, end: string): string[] {
  if (!start || !end) return []
  const dates: string[] = []
  const cursor = new Date(`${start}T12:00:00`)
  const last = new Date(`${end}T12:00:00`)
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime()) || cursor > last) {
    return []
  }
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function buildDaysFromRange(
  startDate: string,
  endDate: string,
  existing: DayPlan[] = [],
): DayPlan[] {
  const byDate = new Map(existing.map((day) => [day.date, day]))
  return eachDateInclusive(startDate, endDate).map((date, index) => {
    const prior = byDate.get(date)
    if (prior) {
      return {
        ...prior,
        label: prior.label || `Day ${index + 1}`,
      }
    }
    return {
      id: uid('day'),
      date,
      label: `Day ${index + 1}`,
      activities: [],
    }
  })
}

export function createTrip(partial?: Partial<Trip>): Trip {
  const today = new Date()
  const start = today.toISOString().slice(0, 10)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 2)
  const end = endDate.toISOString().slice(0, 10)
  const now = new Date().toISOString()

  const trip: Trip = {
    id: uid('trip'),
    title: partial?.title ?? 'Untitled trip',
    destination: partial?.destination ?? '',
    startDate: partial?.startDate ?? start,
    endDate: partial?.endDate ?? end,
    notes: partial?.notes ?? '',
    days: [],
    createdAt: now,
    updatedAt: now,
  }

  trip.days = buildDaysFromRange(trip.startDate, trip.endDate)
  return trip
}

export function createActivity(
  partial?: Partial<Activity>,
): Activity {
  return {
    id: uid('act'),
    time: partial?.time ?? '09:00',
    title: partial?.title ?? '',
    location: partial?.location ?? '',
    notes: partial?.notes ?? '',
    category: partial?.category ?? 'sight',
  }
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  sight: 'Sight',
  food: 'Food',
  transit: 'Transit',
  stay: 'Stay',
  activity: 'Activity',
  other: 'Other',
}

export function tripSummaryText(trip: Trip): string {
  const lines: string[] = [
    trip.title,
    trip.destination ? `Destination: ${trip.destination}` : '',
    trip.startDate && trip.endDate
      ? `Dates: ${formatDisplayDate(trip.startDate)} – ${formatDisplayDate(trip.endDate)}`
      : '',
    trip.notes ? `Notes: ${trip.notes}` : '',
    '',
  ].filter((line, index, arr) => line !== '' || arr[index - 1] !== '')

  for (const day of trip.days) {
    lines.push(`${day.label} · ${formatDisplayDate(day.date)}`)
    if (day.activities.length === 0) {
      lines.push('  (no stops yet)')
    } else {
      for (const activity of day.activities) {
        const place = activity.location ? ` @ ${activity.location}` : ''
        lines.push(`  ${activity.time} — ${activity.title || 'Untitled'}${place}`)
        if (activity.notes) lines.push(`    ${activity.notes}`)
      }
    }
    lines.push('')
  }

  return lines.join('\n').trim()
}

export function countStops(trip: Trip): number {
  return trip.days.reduce((sum, day) => sum + day.activities.length, 0)
}
