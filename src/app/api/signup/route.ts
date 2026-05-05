import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { role, school, grad_year, company, job_title, first_name, last_name, email, phone } = body

  const { error } = await supabase.from('signups').insert({
    role, school, grad_year, company, job_title, first_name, last_name, email, phone,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await resend.emails.send({
    from: 'mrktr.club <hello@mrktr.club>',
    to: email,
    subject: 'Welcome to mrktr.club!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#0d0d0d;color:#fff;border-radius:16px;">
        <h1 style="font-size:28px;font-weight:800;margin-bottom:8px;">Welcome to mrktr.club</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;margin-bottom:32px;">
          Hey ${first_name}, thanks for signing up! We're building a private community for marketing students and professionals. We'll review your application and be in touch soon.
        </p>
        <a href="https://mrktr.club" style="display:inline-block;background:#fff;color:#000;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
          Visit mrktr.club
        </a>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:40px;">You're receiving this because you signed up at mrktr.club.</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}
