import type { Trip } from '../types'
import { CATEGORY_LABELS } from '../lib/itinerary'

interface PrintViewProps {
  trip: Trip
  onBack: () => void
  formatDisplayDate: (iso: string) => string
}

export function PrintView({ trip, onBack, formatDisplayDate }: PrintViewProps) {
  return (
    <div className="print-view">
      <header className="print-toolbar no-print">
        <button type="button" className="btn btn-text" onClick={onBack}>
          ← Back to editor
        </button>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </header>

      <article className="print-sheet">
        <p className="brand brand-sm">Itnry</p>
        <h1>{trip.title || 'Untitled trip'}</h1>
        <p className="print-sub">
          {trip.destination || 'Destination TBD'}
          {trip.startDate
            ? ` · ${formatDisplayDate(trip.startDate)}${
                trip.endDate ? ` – ${formatDisplayDate(trip.endDate)}` : ''
              }`
            : ''}
        </p>
        {trip.notes && <p className="print-notes">{trip.notes}</p>}

        {trip.days.map((day) => (
          <section key={day.id} className="print-day">
            <h2>
              {day.label}
              <span>{formatDisplayDate(day.date)}</span>
            </h2>
            {day.activities.length === 0 ? (
              <p className="print-empty">No stops planned.</p>
            ) : (
              <ol>
                {day.activities.map((activity) => (
                  <li key={activity.id}>
                    <div className="print-stop-head">
                      <strong>{activity.time}</strong>
                      <span>{activity.title || 'Untitled stop'}</span>
                      <em>{CATEGORY_LABELS[activity.category]}</em>
                    </div>
                    {activity.location && <p className="print-place">{activity.location}</p>}
                    {activity.notes && <p className="print-activity-notes">{activity.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </article>
    </div>
  )
}
