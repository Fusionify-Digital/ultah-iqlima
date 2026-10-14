import nodemailer from 'nodemailer'
import { config } from '../src/config.js'

export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  return host ? `https://${host}` : ''
}

// Sends through Gmail SMTP with an App Password (https://myaccount.google.com/apppasswords).
export async function sendEmail({ to, subject, html, text }) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) throw new Error('GMAIL_USER dan GMAIL_APP_PASSWORD belum diatur')

  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass: pass.replace(/\s+/g, '') } })
  return transport.sendMail({
    from: { name: config.email.fromName, address: user },
    to,
    subject,
    html,
    text,
  })
}
