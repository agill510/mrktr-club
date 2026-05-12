export type CommunityType = 'school' | 'city' | 'company'
export type BannerColor = 'bannerTeal' | 'bannerBlue' | 'bannerPurple' | 'bannerAmber'

export interface Community {
  id: number
  type: CommunityType
  handle: string
  name: string
  members: number
  active: number
  desc: string
  banner: BannerColor
  banner_url?: string
  banner_position?: string
  banner_zoom?: number
  logo_url?: string
}

export const communities: Community[] = [
  { id: 1,  type: 'school',  handle: '@sjsu',         name: 'San Jose State University',      members: 142, active: 38, desc: 'Connect with SJSU marketing students and alumni building careers in the Bay Area.',    banner: 'bannerTeal'   },
  { id: 2,  type: 'school',  handle: '@sfsu',         name: 'San Francisco State University', members: 98,  active: 21, desc: 'A space for SFSU marketers to share opportunities, projects, and ideas.',             banner: 'bannerBlue'   },
  { id: 3,  type: 'school',  handle: '@csueb',        name: 'CSU East Bay',                   members: 74,  active: 14, desc: 'East Bay marketing community for students, grads, and faculty.',                      banner: 'bannerPurple' },
  { id: 4,  type: 'school',  handle: '@ucb',          name: 'UC Berkeley',                    members: 89,  active: 27, desc: 'Berkeley marketers — from Haas to the broader campus community.',                    banner: 'bannerAmber'  },
  { id: 5,  type: 'city',    handle: '@sanjose',      name: 'San Jose',                       members: 318, active: 84, desc: 'The hub for marketing professionals living and working in San Jose.',                 banner: 'bannerTeal'   },
  { id: 6,  type: 'city',    handle: '@sanfrancisco', name: 'San Francisco',                  members: 276, active: 61, desc: 'SF-based marketers across startups, agencies, and enterprise.',                      banner: 'bannerBlue'   },
  { id: 7,  type: 'city',    handle: '@fremont',      name: 'Fremont',                        members: 104, active: 19, desc: 'Local marketing community for Fremont professionals and students.',                   banner: 'bannerPurple' },
  { id: 8,  type: 'city',    handle: '@milpitas',     name: 'Milpitas',                       members: 61,  active: 11, desc: 'Connecting marketers in Milpitas and the surrounding South Bay.',                    banner: 'bannerAmber'  },
  { id: 9,  type: 'company', handle: '@adobe',        name: 'Adobe',                          members: 63,  active: 17, desc: 'Adobe employees and alumni sharing marketing insights and career moves.',             banner: 'bannerAmber'  },
  { id: 10, type: 'company', handle: '@paypal',       name: 'PayPal',                         members: 47,  active: 9,  desc: 'PayPal marketers — current team members and a growing alumni network.',              banner: 'bannerBlue'   },
  { id: 11, type: 'company', handle: '@meta',         name: 'Meta',                           members: 88,  active: 24, desc: 'Meta marketing team members, alumni, and those aspiring to join.',                   banner: 'bannerPurple' },
  { id: 12, type: 'company', handle: '@google',       name: 'Google',                         members: 112, active: 33, desc: 'Google marketers across teams — brand, growth, product, and beyond.',                banner: 'bannerTeal'   },
]
