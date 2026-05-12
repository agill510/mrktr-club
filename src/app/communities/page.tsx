'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import AppNav from '@/components/AppNav'
import ProtectedRoute from '@/components/ProtectedRoute'
import { communities as fallbackCommunities, type Community, CommunityType } from '@/data/communities'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import styles from './communities.module.css'

type TypeFilter = 'all' | CommunityType

function CommunityLogo({ type, handle, logo_url }: { type: string; handle: string; logo_url?: string }) {
  const slug = handle.slice(1)
  const src = logo_url || `/logos/${type}s/${slug}.png`
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <Image
        src={src}
        alt={handle}
        width={36}
        height={36}
        className={styles.logoImg}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div className={styles.logoFallback}>
      {handle.slice(1, 3).toUpperCase()}
    </div>
  )
}

function CommunitiesInner() {
  const { user } = useAuth()
  const router   = useRouter()
  const [communities,  setCommunities]  = useState<Community[]>(fallbackCommunities)
  const [memberOf,     setMemberOf]     = useState<Set<string>>(new Set())
  const [mentionCounts,setMentionCounts]= useState<Record<string, number>>({})
  const [search,       setSearch]       = useState('')
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>('all')

  useEffect(() => {
    supabase.from('communities').select('*').order('created_at').then(({ data }) => {
      if (data?.length) setCommunities(data as Community[])
    })
  }, [])

  useEffect(() => {
    if (!user) return
    // Which communities is the user already a member of?
    supabase.from('community_members').select('community_id').eq('user_id', user.id)
      .then(({ data }) => setMemberOf(new Set((data ?? []).map((r: any) => r.community_id))))
    // Unread mention counts per community
    supabase.from('mentions').select('community_id').eq('user_id', user.id).eq('is_read', false)
      .then(({ data }) => {
        const counts: Record<string, number> = {}
        ;(data ?? []).forEach((r: any) => { counts[r.community_id] = (counts[r.community_id] ?? 0) + 1 })
        setMentionCounts(counts)
      })
  }, [user])

  const joinOrEnter = async (communityId: string) => {
    if (!user) return
    if (!memberOf.has(communityId)) {
      await supabase.from('community_members').upsert({ community_id: communityId, user_id: user.id, role: 'member' })
      // Auto-create #chat if no channels exist
      const { data: chs } = await supabase.from('channels').select('id').eq('community_id', communityId).limit(1)
      if (!chs?.length) await supabase.from('channels').insert({ community_id: communityId, name: 'chat', position: 0 })
    }
    router.push(`/communities/${communityId}`)
  }

  const filtered = useMemo(() =>
    communities.filter(c => {
      const matchType   = typeFilter === 'all' || c.type === typeFilter
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.handle.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    }),
  [communities, search, typeFilter])

  return (
    <div className={styles.page}>
      <AppNav active="communities" />

      <section className={`${styles.section} ${styles.fadeUp} ${styles.delay1}`}>
        <h1 className={styles.pageTitle}>Communities</h1>

        <div className={styles.controls}>
          <label className={styles.searchBar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search communities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </label>

          <div className={styles.filterTabs}>
            {(['all', 'school', 'city', 'company'] as TypeFilter[]).map(f => (
              <button
                key={f}
                className={`${styles.filterTab} ${typeFilter === f ? styles.filterTabActive : ''}`}
                onClick={() => setTypeFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'school' ? 'Schools' : f === 'city' ? 'Cities' : 'Companies'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.empty}>No communities match your search.</p>
        ) : (
          <div className={styles.communityGrid}>
            {filtered.map((c, i) => (
              <div
                key={c.id}
                className={`${styles.communityCard} ${styles.fadeUp}`}
                style={{ animationDelay: `${0.1 + i * 0.04}s`, position: 'relative' }}
              >
                {(mentionCounts[String(c.id)] ?? 0) > 0 && (
                  <div style={{ position: 'absolute', top: 10, left: 10, background: '#ef4444', color: '#fff', borderRadius: '999px', fontSize: 11, fontWeight: 700, padding: '2px 7px', zIndex: 5, fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {mentionCounts[String(c.id)]}
                  </div>
                )}
                <div className={`${styles.communityBanner} ${styles[c.banner]}`} style={c.banner_url ? { backgroundImage: `url(${c.banner_url})`, backgroundSize: 'cover', backgroundPosition: c.banner_position || '50% 50%' } : undefined} />
                <div className={styles.verifiedBadge}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Verified</span>
                </div>
                <div className={styles.communityCardLogo}>
                  <CommunityLogo type={c.type} handle={c.handle} logo_url={c.logo_url} />
                </div>
                <div className={styles.communityCardBody}>
                  <p className={styles.communityCardName}>{c.name}</p>
                  <p className={styles.communityCardDesc}>{(c as any).description ?? c.desc}</p>
                  <div className={styles.communityCardFooter}>
                    <div className={styles.communityCardMembers}>
                      <span className={styles.memberStat}>
                        <span className={styles.memberDot} />
                        {c.members.toLocaleString()} members
                      </span>
                      <span className={styles.memberDivider}>·</span>
                      <span className={styles.memberStatActive}>
                        <span className={styles.memberDotActive} />
                        {c.active} active today
                      </span>
                    </div>
                    <button className={styles.joinBtn} onClick={() => joinOrEnter(String(c.id))}>
                      {memberOf.has(String(c.id)) ? 'Enter →' : 'Join →'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <a href="/home" className={styles.footerLogo}>mrktr.club</a>
        <div className={styles.footerLinks}>
          <a href="/terms"   className={styles.footerLink}>Terms of Service</a>
          <div className={styles.footerDot} />
          <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
          <div className={styles.footerDot} />
          <a href="/contact" className={styles.footerLink}>Contact</a>
        </div>
      </footer>
    </div>
  )
}

export default function CommunitiesPage() {
  return <ProtectedRoute><CommunitiesInner /></ProtectedRoute>
}
