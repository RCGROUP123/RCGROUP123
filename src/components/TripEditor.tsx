import { useEffect, useState } from 'react'
import type { Activity, DayPlan, Trip } from '../types'
import { CATEGORY_LABELS } from '../lib/itinerary'

interface TripEditorProps {
  trip: Trip
  onBack: () => void
  onUpdate: (patch: Partial<Trip>) => void
  onDelete: () => void
  onDuplicate: () => void
  onPrint: () => void
  onCopy: () => void
  createActivity: (partial?: Partial<Activity>) => Activity
  formatDisplayDate: (iso: string) => string
}

export function TripEditor({
  trip,
  onBack,
  onUpdate,
  onDelete,
  onDuplicate,
  onPrint,
  onCopy,
  createActivity,
  formatDisplayDate,
}: TripEditorProps) {
  const [activeDayId, setActiveDayId] = useState(trip.days[0]?.id ?? '')
  const activeDay =
    trip.days.find((day) => day.id === activeDayId) ?? trip.days[0] ?? null

  useEffect(() => {
    if (!trip.days.some((day) => day.id === activeDayId)) {
      setActiveDayId(trip.days[0]?.id ?? '')
    }
  }, [trip.days, activeDayId])

  function updateDays(updater: (days: DayPlan[]) => DayPlan[]) {
    onUpdate({ days: updater(trip.days) })
  }

  function updateActiveDay(patch: Partial<DayPlan>) {
    if (!activeDay) return
    updateDays((days) =>
      days.map((day) => (day.id === activeDay.id ? { ...day, ...patch } : day)),
    )
  }

  function updateActivity(activityId: string, patch: Partial<Activity>) {
    if (!activeDay) return
    updateActiveDay({
      activities: activeDay.activities.map((activity) =>
        activity.id === activityId ? { ...activity, ...patch } : activity,
      ),
    })
  }

  function addActivity() {
    if (!activeDay) return
    const next = [...activeDay.activities, createActivity({ time: suggestNextTime(activeDay) })]
    updateActiveDay({ activities: next })
  }

  function removeActivity(activityId: string) {
    if (!activeDay) return
    updateActiveDay({
      activities: activeDay.activities.filter((activity) => activity.id !== activityId),
    })
  }

  function moveActivity(activityId: string, direction: -1 | 1) {
    if (!activeDay) return
    const index = activeDay.activities.findIndex((activity) => activity.id === activityId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= activeDay.activities.length) return
    const next = [...activeDay.activities]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    updateActiveDay({ activities: next })
  }

  return (
    <div className="editor">
      <header className="editor-top">
        <button type="button" className="btn btn-text" onClick={onBack}>
          ← All trips
        </button>
        <div className="editor-top-actions">
          <button type="button" className="btn btn-text" onClick={onCopy}>
            Copy text
          </button>
          <button type="button" className="btn btn-secondary" onClick={onPrint}>
            Print view
          </button>
        </div>
      </header>

      <section className="trip-meta">
        <div className="meta-brand">
          <p className="brand brand-sm">Itnry</p>
          <p className="meta-hint">Editing itinerary</p>
        </div>

        <label className="field field-title">
          <span>Trip title</span>
          <input
            value={trip.title}
            onChange={(event) => onUpdate({ title: event.target.value })}
            placeholder="Coastal week, family reunion…"
          />
        </label>

        <div className="meta-grid">
          <label className="field">
            <span>Destination</span>
            <input
              value={trip.destination}
              onChange={(event) => onUpdate({ destination: event.target.value })}
              placeholder="Lisbon, Kyoto, Banff…"
            />
          </label>
          <label className="field">
            <span>Start date</span>
            <input
              type="date"
              value={trip.startDate}
              onChange={(event) => onUpdate({ startDate: event.target.value })}
            />
          </label>
          <label className="field">
            <span>End date</span>
            <input
              type="date"
              value={trip.endDate}
              min={trip.startDate}
              onChange={(event) => onUpdate({ endDate: event.target.value })}
            />
          </label>
        </div>

        <label className="field">
          <span>Trip notes</span>
          <textarea
            rows={2}
            value={trip.notes}
            onChange={(event) => onUpdate({ notes: event.target.value })}
            placeholder="Pace, budget reminders, packing cues…"
          />
        </label>

        <div className="meta-tools">
          <button type="button" className="btn btn-text" onClick={onDuplicate}>
            Duplicate trip
          </button>
          <button type="button" className="btn btn-text danger" onClick={onDelete}>
            Delete trip
          </button>
        </div>
      </section>

      <section className="day-board">
        <div className="day-tabs" role="tablist" aria-label="Trip days">
          {trip.days.map((day) => (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={day.id === activeDay?.id}
              className={`day-tab${day.id === activeDay?.id ? ' is-active' : ''}`}
              onClick={() => setActiveDayId(day.id)}
            >
              <span className="day-tab-label">{day.label}</span>
              <span className="day-tab-date">{formatDisplayDate(day.date)}</span>
              <span className="day-tab-count">{day.activities.length}</span>
            </button>
          ))}
        </div>

        {!activeDay ? (
          <div className="empty-state compact">
            <p>Choose a valid start and end date to generate days.</p>
          </div>
        ) : (
          <div className="day-panel" key={activeDay.id}>
            <div className="day-panel-head">
              <label className="field field-inline">
                <span>Day label</span>
                <input
                  value={activeDay.label}
                  onChange={(event) => updateActiveDay({ label: event.target.value })}
                />
              </label>
              <button type="button" className="btn btn-primary" onClick={addActivity}>
                Add stop
              </button>
            </div>

            {activeDay.activities.length === 0 ? (
              <div className="empty-state compact">
                <p>No stops on this day yet. Add a morning start, a meal, or a landmark.</p>
              </div>
            ) : (
              <ul className="activity-list">
                {activeDay.activities.map((activity, index) => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-rail">
                      <input
                        className="time-input"
                        type="time"
                        value={activity.time}
                        onChange={(event) =>
                          updateActivity(activity.id, { time: event.target.value })
                        }
                        aria-label="Time"
                      />
                      <div className="reorder">
                        <button
                          type="button"
                          className="btn btn-icon"
                          aria-label="Move up"
                          disabled={index === 0}
                          onClick={() => moveActivity(activity.id, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon"
                          aria-label="Move down"
                          disabled={index === activeDay.activities.length - 1}
                          onClick={() => moveActivity(activity.id, 1)}
                        >
                          ↓
                        </button>
                      </div>
                    </div>

                    <div className="activity-body">
                      <div className="activity-row">
                        <label className="field grow">
                          <span>Stop</span>
                          <input
                            value={activity.title}
                            onChange={(event) =>
                              updateActivity(activity.id, { title: event.target.value })
                            }
                            placeholder="Museum visit, sunset walk…"
                          />
                        </label>
                        <label className="field">
                          <span>Type</span>
                          <select
                            value={activity.category}
                            onChange={(event) =>
                              updateActivity(activity.id, {
                                category: event.target.value as Activity['category'],
                              })
                            }
                          >
                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="field">
                        <span>Place</span>
                        <input
                          value={activity.location}
                          onChange={(event) =>
                            updateActivity(activity.id, { location: event.target.value })
                          }
                          placeholder="Neighborhood, venue, address…"
                        />
                      </label>

                      <label className="field">
                        <span>Notes</span>
                        <textarea
                          rows={2}
                          value={activity.notes}
                          onChange={(event) =>
                            updateActivity(activity.id, { notes: event.target.value })
                          }
                          placeholder="Tickets, reservations, walking time…"
                        />
                      </label>

                      <button
                        type="button"
                        className="btn btn-text danger"
                        onClick={() => removeActivity(activity.id)}
                      >
                        Remove stop
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function suggestNextTime(day: DayPlan): string {
  if (day.activities.length === 0) return '09:00'
  const last = day.activities[day.activities.length - 1]?.time
  if (!last) return '09:00'
  const [hours, minutes] = last.split(':').map(Number)
  const total = hours * 60 + minutes + 90
  const nextHours = Math.floor(total / 60) % 24
  const nextMinutes = total % 60
  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`
}
