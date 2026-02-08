export function monthMatrix(year, month) {

  const first = new Date(year, month, 1)
  const start = new Date(first)
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(d)
  }

  const weeks = []
  for (let i = 0; i < 6; i++) weeks.push(cells.slice(i * 7, (i + 1) * 7))
  return weeks
}
