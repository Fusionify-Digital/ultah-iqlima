const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

// `birthDate` format: YYYY-MM-DD
export function getBirthdayInfo(birthDate, now = new Date()) {
  const [year, month, day] = birthDate.split('-').map(Number)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let last = new Date(today.getFullYear(), month - 1, day)
  if (last > today) last = new Date(today.getFullYear() - 1, month - 1, day)

  return {
    age: last.getFullYear() - year,
    dayMonth: `${day} ${MONTHS[month - 1]}`,
    fullDate: `${day} ${MONTHS[month - 1]} ${year}`,
  }
}
