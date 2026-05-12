export type EventType = 'in-person' | 'virtual'
export type EventColor = 'fromTeal' | 'fromBlue' | 'fromPurple' | 'fromAmber'

export interface Event {
  id: number | string
  name: string
  date: string
  location: string
  type: EventType
  color: EventColor
  image_url?: string
  image_position?: string
  image_zoom?: number
  // Detail page fields
  description?: string
  time?: string
  speaker_name?: string
  speaker_title?: string
  speaker_company?: string
  speaker_bio?: string
  speaker_image?: string
  why_attend?: string
  max_spots?: number
  spots_taken?: number
  organizer_name?: string
  organizer_image?: string
}

export const events: Event[] = [
  { id: 1, name: 'Bay Area Marketing Summit',  date: 'June 14, 2026',    location: 'San Francisco, CA', type: 'in-person', color: 'fromTeal'   },
  { id: 2, name: 'Brand Strategy Keynote',     date: 'June 28, 2026',    location: 'Virtual',           type: 'virtual',   color: 'fromBlue'   },
  { id: 3, name: 'SJSU Marketing Mixer',       date: 'July 10, 2026',    location: 'San Jose, CA',      type: 'in-person', color: 'fromPurple' },
  { id: 4, name: 'Growth Marketing Workshop',  date: 'July 18, 2026',    location: 'Virtual',           type: 'virtual',   color: 'fromAmber'  },
  { id: 5, name: 'Social Media Masterclass',   date: 'August 3, 2026',   location: 'Oakland, CA',       type: 'in-person', color: 'fromTeal'   },
  { id: 6, name: 'Content Strategy Deep Dive', date: 'August 22, 2026',  location: 'Virtual',           type: 'virtual',   color: 'fromBlue'   },
]
