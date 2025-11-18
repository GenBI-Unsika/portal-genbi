export function monthMatrix(year, month){
  // generate 6x7 matrix dates (Sun start)
  const first = new Date(year, month, 1)
  const start = new Date(first)
  const day = start.getDay() // 0-6 (Sun-Sat)
  start.setDate(start.getDate()-day) // go to Sunday before
  const cells = []
  for(let i=0;i<42;i++){
    const d = new Date(start)
    d.setDate(start.getDate()+i)
    cells.push(d)
  }
  // chunk 7
  const weeks = []
  for(let i=0;i<6;i++) weeks.push(cells.slice(i*7,(i+1)*7))
  return weeks
}
