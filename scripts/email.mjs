// npm run email:preview  -> tulis email-preview.html (buka di browser, dev server harus jalan)
// npm run email:test     -> kirim email contoh ke TEST_EMAIL_TO (butuh .env.local)
// Tambahkan --date=YYYY-MM-DD untuk mensimulasikan tanggal tertentu.
import { writeFileSync } from 'node:fs'
import { renderBirthdayEmail } from '../email/birthdayEmail.js'
import { sendEmail, siteUrl } from '../email/send.js'

const [mode = 'preview', ...flags] = process.argv.slice(2)
const dateFlag = flags.find((f) => f.startsWith('--date='))?.slice(7)
const now = dateFlag ? new Date(`${dateFlag}T00:01:00+07:00`) : new Date()

if (mode === 'preview') {
  const email = renderBirthdayEmail({ siteUrl: process.env.SITE_URL || 'http://localhost:5173', now })
  writeFileSync('email-preview.html', email.html)
  console.log(`email-preview.html ditulis (umur ${email.age}, hari ulang tahun: ${email.isBirthday ? 'ya' : 'bukan'})`)
  console.log(`Subjek: ${email.subject}`)
} else if (mode === 'send') {
  const url = siteUrl()
  if (!url) throw new Error('Isi SITE_URL di .env.local dengan alamat web yang sudah online, supaya gambarnya bisa dimuat')
  const to = process.env.TEST_EMAIL_TO || process.env.GMAIL_USER
  const email = renderBirthdayEmail({ siteUrl: url, now })
  const info = await sendEmail({ to, ...email })
  console.log(`Terkirim ke ${to} (${info.messageId})`)
} else {
  console.error('Mode tidak dikenal. Pakai: preview atau send')
  process.exit(1)
}
