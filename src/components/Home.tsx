import type { Trip } from '../types'

interface HomeProps {
  trips: Trip[]
  onCreate: () => void
  onOpen: (tripId: string) => void
  onDelete: (tripId: string) => void
  onDuplicate: (tripId: string) => void
  countStops: (trip: Trip) => number
  formatDisplayDate: (iso: string) => string
}

export function Home({
  trips,
  onCreate,
  onOpen,
  onDelete,
  onDuplicate,
  countStops,
  formatDisplayDate,
}: HomeProps) {
  const sorted = [...trips].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className="home">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-dot" />
        </div>
        <p className="topbar-note">Saved locally in this browser</p>
      </header>

      <section className="hero" aria-label="Itnry introduction">
        <div className="hero-media" aria-hidden="true">
          <div className="hero-wash" />
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />
          <div className="hero-route" />
        </div>

        <div className="hero-copy">
          <p className="brand">Itnry</p>
          <h1>Prepare the days. Keep the route clear.</h1>
          <p className="lede">
            Build a day-by-day travel itinerary with times, stops, and notes — then refine it
            until the trip feels ready.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={onCreate}>
              Start a new itinerary
            </button>
            {sorted.length > 0 && (
              <a className="btn btn-ghost" href="#trips">
                Open saved trips
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="trips-section" id="trips">
        <div className="section-head">
          <h2>Your itineraries</h2>
          <p>Pick up where you left off, or sketch the next route.</p>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <p>No trips yet. Start with a destination and a few days — you can fill stops later.</p>
            <button type="button" className="btn btn-secondary" onClick={onCreate}>
              Create your first trip
            </button>
          </div>
        ) : (
          <ul className="trip-list">
            {sorted.map((trip) => (
              <li key={trip.id} className="trip-row">
                <button
                  type="button"
                  className="trip-main"
                  onClick={() => onOpen(trip.id)}
                >
                  <span className="trip-title">{trip.title || 'Untitled trip'}</span>
                  <span className="trip-meta">
                    {trip.destination || 'No destination yet'}
                    {trip.startDate
                      ? ` · ${formatDisplayDate(trip.startDate)}${
                          trip.endDate ? ` – ${formatDisplayDate(trip.endDate)}` : ''
                        }`
                      : ''}
                    {` · ${trip.days.length} day${trip.days.length === 1 ? '' : 's'}`}
                    {` · ${countStops(trip)} stop${countStops(trip) === 1 ? '' : 's'}`}
                  </span>
                </button>
                <div className="trip-actions">
                  <button
                    type="button"
                    className="btn btn-text"
                    onClick={() => onDuplicate(trip.id)}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="btn btn-text danger"
                    onClick={() => onDelete(trip.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
