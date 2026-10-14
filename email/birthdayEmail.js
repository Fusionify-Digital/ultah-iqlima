import { getBirthdayInfo } from '../src/lib/birthday.js'
import { birthDate, config } from '../src/config.js'

export const TIME_ZONE = 'Asia/Jakarta'

const C = {
  page: '#ffe8ef',
  paper: '#fffaf7',
  ink: '#5a1f35',
  muted: '#9b6b7c',
  pink: '#e8457a',
  deep: '#c2185b',
  soft: '#ff8fab',
  line: '#f8d5df',
}

// Gmail ignores web fonts, so every stack falls back to a font that still fits the look.
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"
const SCRIPT = "'Dancing Script', 'Brush Script MT', 'Segoe Script', cursive"
const SANS = "Manrope, 'Segoe UI', Helvetica, Arial, sans-serif"

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Calendar date in Jakarta, independent of the server's own time zone.
export function dateInJakarta(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(now)
      .map((p) => [p.type, Number(p.value)]),
  )
  return { year: parts.year, month: parts.month, day: parts.day }
}

// With `inline`, images ship inside the email (cid: attachments) instead of being linked.
// Gmail often withholds linked images from new senders, but always shows embedded ones.
export function renderBirthdayEmail({ siteUrl, now = new Date(), inline = false }) {
  const today = dateInJakarta(now)
  const [, month, day] = birthDate.split('-').map(Number)
  const { age } = getBirthdayInfo(birthDate, new Date(today.year, today.month - 1, today.day))
  const isBirthday = today.month === month && today.day === day

  const copy = config.email
  const photo = config.memories.photos[copy.photo] ?? config.memories.photos[0]
  const base = siteUrl.replace(/\/$/, '')
  const subject = copy.subject(age)
  const paragraphs = copy.paragraphs(age)

  const images = {
    hero: { url: `${base}/email/hero.jpg`, filename: 'ulang-tahun.jpg' },
    photo: { url: `${base}${photo.src}`, filename: `foto${photo.src.slice(photo.src.lastIndexOf('.'))}` },
  }
  const src = (key) => (inline ? `cid:${key}@ultah-iqlima` : images[key].url)
  const attachments = inline
    ? Object.entries(images).map(([key, img]) => ({
        filename: img.filename,
        href: img.url,
        cid: `${key}@ultah-iqlima`,
        contentDisposition: 'inline',
      }))
    : []

  const p = (text) =>
    `<p style="margin:0 0 18px;font-family:${SERIF};font-size:20px;line-height:1.65;color:${C.ink};">${esc(text)}</p>`

  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light" />
<title>${esc(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Dancing+Script:wght@700&family=Manrope:wght@600&display=swap" rel="stylesheet" />
<style>
  body { margin: 0; padding: 0; background: ${C.page}; }
  img { border: 0; display: block; }
  @media (max-width: 620px) {
    .container { width: 100% !important; border-radius: 0 !important; }
    .px { padding-left: 26px !important; padding-right: 26px !important; }
    .photo { width: 220px !important; height: 220px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(copy.preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page};background-image:linear-gradient(180deg,#fff3f6 0%,${C.page} 45%,#ffdbe5 100%);">
  <tr>
    <td align="center" style="padding:28px 0 36px;">
      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.paper}" style="width:600px;max-width:600px;background:${C.paper};border-radius:28px;overflow:hidden;border:1px solid ${C.line};box-shadow:0 30px 60px -24px rgba(194,24,91,0.35);">
        <tr>
          <td>
            <a href="${esc(base)}" target="_blank" style="text-decoration:none;">
              <img src="${esc(src('hero'))}" width="600" alt="Selamat ulang tahun, ${esc(config.name)}" style="width:100%;max-width:600px;height:auto;background:${C.page};font-family:${SCRIPT};font-size:40px;color:${C.pink};text-align:center;" />
            </a>
          </td>
        </tr>
        <tr>
          <td class="px" align="center" style="padding:30px 52px 6px;">
            <p style="margin:0;font-family:${SANS};font-size:13px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${C.pink};">${esc(copy.eyebrow(age))}</p>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:22px 52px 4px;">
            <p style="margin:0 0 16px;font-family:${SCRIPT};font-size:34px;line-height:1.2;color:${C.pink};">${esc(copy.greeting)}</p>
            ${paragraphs.map(p).join('\n            ')}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:14px 24px 30px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background:#ffffff;border:1px solid ${C.line};box-shadow:0 18px 30px -16px rgba(194,24,91,0.4);transform:rotate(-2deg);">
              <tr>
                <td style="padding:14px 14px 0;">
                  <img class="photo" src="${esc(src('photo'))}" width="250" height="250" alt="${esc(photo.caption)}" style="width:250px;height:250px;object-fit:cover;background:${C.line};" />
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:14px 16px 18px;font-family:${SCRIPT};font-size:22px;line-height:1.25;color:${C.deep};">${esc(photo.caption)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" align="center" style="padding:0 52px 8px;">
            <p style="margin:0 0 24px;font-family:${SERIF};font-size:20px;line-height:1.65;color:${C.ink};">${esc(copy.invite)}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="${C.pink}" style="border-radius:999px;background:${C.pink};background-image:linear-gradient(135deg,#ff8fab 0%,${C.pink} 100%);box-shadow:0 14px 26px -10px rgba(232,69,122,0.7);">
                  <a href="${esc(base)}" target="_blank" style="display:inline-block;padding:16px 40px;font-family:${SANS};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(copy.button)} &#9825;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" align="center" style="padding:34px 52px 6px;">
            <p style="margin:0 0 18px;font-family:${SANS};font-size:16px;letter-spacing:10px;color:${C.soft};">&#9825; &#9825; &#9825;</p>
            <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:23px;line-height:1.5;color:${C.deep};">${config.letter.quote.map(esc).join('<br />')}</p>
          </td>
        </tr>
        <tr>
          <td class="px" align="right" style="padding:30px 52px 40px;">
            <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:19px;color:${C.muted};">${esc(config.letter.closing)}</p>
            <p style="margin:4px 0 0;font-family:${SCRIPT};font-size:32px;color:${C.pink};">${esc(config.letter.signature)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;font-family:${SANS};font-size:12px;letter-spacing:1px;color:${C.muted};">${esc(copy.footer)} &#9825;</p>
    </td>
  </tr>
</table>
</body>
</html>`

  const text = [
    `${copy.greeting}`,
    '',
    ...paragraphs.flatMap((t) => [t, '']),
    copy.invite,
    `${copy.button}: ${base}`,
    '',
    config.letter.quote.join('\n'),
    '',
    config.letter.closing,
    config.letter.signature,
  ].join('\n')

  return { age, isBirthday, subject, html, text, attachments }
}
