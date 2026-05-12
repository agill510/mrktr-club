export interface Video {
  id: number
  title: string
  speaker: string
  date: string
  duration: string
  thumbnail_url?: string
  thumbnail_position?: string
  thumbnail_zoom?: number
}

export const videos: Video[] = [
  { id: 1, title: 'Brand Positioning in the AI Era',    speaker: 'Sarah Chen',      date: 'Jun 28, 2026', duration: '42:18' },
  { id: 2, title: 'Growth Loops: What Actually Works',  speaker: 'Marcus Williams', date: 'Jun 14, 2026', duration: '28:05' },
  { id: 3, title: 'Building a Community-Led Brand',     speaker: 'Priya Nair',      date: 'Jun 14, 2026', duration: '35:47' },
  { id: 4, title: 'The Future of Influencer Marketing', speaker: 'Jordan Lee',      date: 'Jul 10, 2026', duration: '19:22' },
  { id: 5, title: 'SEO in 2026: What Changed',          speaker: 'Alex Torres',     date: 'Jul 22, 2026', duration: '51:03' },
  { id: 6, title: 'Paid Ads That Convert',              speaker: 'Megan Park',      date: 'Jul 22, 2026', duration: '38:14' },
]
