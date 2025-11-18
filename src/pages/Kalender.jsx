
import React, { useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { parse, startOfWeek, getDay, format } from 'date-fns'
import id from 'date-fns/locale/id'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'id': id }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales })

export default function Kalender(){
  const [events] = useState([
    { title:'Rapat Koordinasi', start: new Date('2025-02-12T13:00:00'), end: new Date('2025-02-12T15:00:00') },
    { title:'Pelatihan Literasi', start: new Date('2025-03-02T09:00:00'), end: new Date('2025-03-02T11:30:00') },
    { title:'Bakti Sosial', start: new Date('2025-03-15T08:00:00'), end: new Date('2025-03-15T12:00:00') },
  ])
  return (
    <div className="space-y-4">
      <h3>Kalender GenBI Unsika</h3>
      <div className="card p-2 shadow-soft overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 580, padding: '4px' }}
          popup
        />
      </div>
    </div>
  )
}
