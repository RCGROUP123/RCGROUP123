export type ActivityCategory =
  | 'sight'
  | 'food'
  | 'transit'
  | 'stay'
  | 'activity'
  | 'other'

export interface Activity {
  id: string
  time: string
  title: string
  location: string
  notes: string
  category: ActivityCategory
}

export interface DayPlan {
  id: string
  date: string
  label: string
  activities: Activity[]
}

export interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  notes: string
  days: DayPlan[]
  updatedAt: string
  createdAt: string
}

export type View =
  | { name: 'home' }
  | { name: 'editor'; tripId: string }
  | { name: 'print'; tripId: string }
