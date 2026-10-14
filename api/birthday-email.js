import { renderBirthdayEmail } from '../email/birthdayEmail.js'
import { sendEmail, siteUrl } from '../email/send.js'

// Called by cron-job.org at 00:01 Asia/Jakarta on the birthday.
// Add `?test=1` to send a copy to TEST_EMAIL_TO instead (works on any date).
export async function GET(request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const test = new URL(request.url).searchParams.has('test')
  const email = renderBirthdayEmail({ siteUrl: siteUrl(), inline: true })

  if (!test && !email.isBirthday) {
    return Response.json({ sent: false, reason: 'Hari ini bukan hari ulang tahunnya' })
  }

  const to = test ? process.env.TEST_EMAIL_TO || process.env.GMAIL_USER : process.env.BIRTHDAY_EMAIL_TO
  if (!to) {
    return Response.json({ sent: false, reason: 'Alamat email tujuan belum diatur' }, { status: 500 })
  }

  try {
    const info = await sendEmail({ to, ...email })
    return Response.json({ sent: true, test, age: email.age, messageId: info.messageId })
  } catch (error) {
    return Response.json({ sent: false, reason: error.message }, { status: 500 })
  }
}
