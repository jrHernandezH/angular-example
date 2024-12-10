import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  year!: number;
  months: Array<{ name: string; days: any[] }> = [];
  events: any[] = [
    {
      start: '2024-06-23',
      end: '2024-06-25',
      type: 'vacation',
      status: 'approved',
    },
    {
      start: '2024-07-10',
      end: '2024-07-12',
      type: 'vacation',
      status: 'pending',
    },
    {
      start: '2024-01-05',
      end: '2024-01-09',
      type: 'vacation',
      status: 'rejected',
    },
    { start: '2024-07-20', end: '2024-07-21', type: 'permission' },
    { date: '2024-01-01', type: 'holiday', name: 'Año Nuevo' },
    { date: '2024-07-04', type: 'holiday', name: 'Independencia' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.year = new Date().getFullYear();
    this.generateCalendar(this.year);
  }

  generateCalendar(year: number) {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    this.months = monthNames.map((name, index) => {
      const firstDay = new Date(year, index, 1).getDay();
      const daysInMonth = new Date(year, index + 1, 0).getDate();
      const emptyDays = Array.from({ length: (firstDay + 6) % 7 }, () => null);
      const days = Array.from({ length: daysInMonth }, (_, i) => {
        const dateStr = `${year}-${(index + 1).toString().padStart(2, '0')}-${(
          i + 1
        )
          .toString()
          .padStart(2, '0')}`;
        return {
          day: i + 1,
          date: new Date(year, index, i + 1),
          events: this.getEvents(dateStr),
        };
      });

      return { name, days: [...emptyDays, ...days] };
    });
  }

  getEvents(dateStr: string) {
    const dateEvents = this.events.filter((event) => {
      if (event.date) return event.date === dateStr;
      if (event.start && event.end)
        return this.isDateInRange(dateStr, event.start, event.end);
      return false;
    });

    return dateEvents.map((event) => ({
      type: event.type,
      status: event.status,
    }));
  }

  isDateInRange(date: string, start: string, end: string): boolean {
    const dateValue = new Date(date).getTime();
    const startValue = new Date(start).getTime();
    const endValue = new Date(end).getTime();
    return dateValue >= startValue && dateValue <= endValue;
  }

  getDayClasses(day: any): { [key: string]: boolean } {
    if (!day) return { empty: true };

    const vacations = this.events.filter((event) => event.type === 'vacation');
    let isStart = false;
    let isEnd = false;
    let isIntermediate = false;
    let isRejected = false;

    vacations.forEach((vacation) => {
      const dateStr = day.date.toISOString().split('T')[0];
      if (vacation.start === dateStr) {
        isStart = true;
        isRejected = vacation.status === 'rejected';
      } else if (vacation.end === dateStr) {
        isEnd = true;
      } else if (this.isDateInRange(dateStr, vacation.start, vacation.end)) {
        isIntermediate = true;
        isRejected = vacation.status === 'rejected';
      }
    });

    return {
      'has-event': day.events?.length > 0,
      'vacation-start': isStart && !isRejected,
      'vacation-end': isEnd && !isRejected,
      'vacation-intermediate': isIntermediate && !isRejected,
      'vacation-pending': day.events?.some(
        (e: any) => e.type === 'vacation' && e.status === 'pending'
      ),
      'vacation-rejected': isRejected,
      permission: day.events?.some((e: any) => e.type === 'permission'),
      holiday: day.events?.some((e: any) => e.type === 'holiday'),
    };
  }
}
