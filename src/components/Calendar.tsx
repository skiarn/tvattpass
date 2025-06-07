import React, { useState } from 'react';
import './Calendar.css';

enum Timeslot {
  Morning = "06:00-10:00",
  Midday = "10:00-14:00",
  Afternoon = "14:00-18:00",
  Evening = "18:00-22:00",
}

const timeslots = Object.values(Timeslot); // Use Timeslot enum values

interface CalendarComponentProps {
  user: any;
  maxBookingsPerUser?: number;
}

interface Booking {
  timeslot: Timeslot; // Use Timeslot enum
  user: string;
  apartment: string;
}

type Bookings = {
  [date: number]: Booking[]; // Changed date key to number
};

const startOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
  return newDate;
};

//maybe use only keeping one month back in time
//only make it possible to schedule for next 3months.

//how many 

const CalendarComponent: React.FC<CalendarComponentProps> = ({ user, maxBookingsPerUser = 1 }) => {
  
  const onedayAgo = new Date();
  onedayAgo.setDate(onedayAgo.getDate() - 1);
  onedayAgo.setHours(0, 0, 0, 0);
  const onedayAgoNumb = Math.floor(onedayAgo.getTime() / 1000);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);
  const twoDaysAgoNumb = Math.floor(twoDaysAgo.getTime()
  / 1000);
  const [bookings, setBookings] = useState<Bookings>({
    [onedayAgoNumb]: [
      { timeslot: Timeslot.Morning, user: 'User1', apartment: 'A1' },
      { timeslot: Timeslot.Midday, user: 'User2', apartment: 'A2' },
      { timeslot: Timeslot.Afternoon, user: 'User3', apartment: 'A3' },
      { timeslot: Timeslot.Evening, user: 'User4', apartment: 'A4' },
    ],
    [twoDaysAgoNumb]: [
      { timeslot: Timeslot.Midday, user: 'User2', apartment: 'A2' },
      { timeslot: Timeslot.Afternoon, user: 'User3', apartment: 'A3' },
      { timeslot: Timeslot.Evening, user: 'User4', apartment: 'A4' },
    ]
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const handleBooking = (timeslot: Timeslot) => { // Update parameter type
    const dateKey = Math.floor(startOfDay(selectedDate).getTime() / 1000); // Use startOfDay
    if (!bookings[dateKey]) {
      bookings[dateKey] = [];
    }
    if (bookings[dateKey].some((booking) => booking.timeslot === timeslot && booking.user === user.name)) {
      handleUnbooking(timeslot);
      return;
    }
    if (bookings[dateKey].some((booking) => booking.timeslot === timeslot)) {
      setError('This timeslot is already booked.');
      return;
    }
    const userBookings = bookings[dateKey].filter((booking) => booking.user === user.name);
    if (userBookings.length >= maxBookingsPerUser) {
      setError(`Max ${maxBookingsPerUser} timeslot(s) per day.`);
      return;
    }
    bookings[dateKey].push({ timeslot, user: user.name, apartment: user.apartment });
    setBookings({ ...bookings });
    setError(null);
  };

  const handleUnbooking = (timeslot: Timeslot) => { // Update parameter type
    const dateKey = Math.floor(startOfDay(selectedDate).getTime() / 1000); // Use startOfDay
    bookings[dateKey] = bookings[dateKey].filter((booking) => !(booking.timeslot === timeslot && booking.user === user.name));
    setBookings({ ...bookings });
    setError(null);
  };

  const isFullyBooked = (date: Date) => {
    const dateKey = Math.floor(startOfDay(date).getTime() / 1000); // Use startOfDay
    return bookings[dateKey] && bookings[dateKey].length >= timeslots.length;
  };

  const isPastDate = (date: Date) => {
    const today = startOfDay(new Date()); // Use startOfDay
    return date.getTime() < today.getTime();
  };

  const userHasBooking = (date: Date) => {
    const dateKey = Math.floor(startOfDay(date).getTime() / 1000); // Use startOfDay
    return bookings[dateKey]?.some((booking) => booking.user === user.name);
  };

  const startOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return startOfDay(new Date(date.setDate(diff))); // Use startOfDay
  };

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(new Date(date));
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(startOfDay(new Date(start))); // Use startOfDay
      start.setDate(start.getDate() + 1);
    }
    return weekDays;
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedDate(nextWeek);
  };

  const handlePreviousWeek = () => {
    const previousWeek = new Date(selectedDate);
    previousWeek.setDate(previousWeek.getDate() - 7);
    setSelectedDate(previousWeek);
  };

  const weekDays = getWeekDays(selectedDate);

  console.log('bookings', bookings);
  return (
    <div className="calendar-container">
      <div className="week-navigation">
        <button className="nav-button" onClick={handlePreviousWeek}>&lt;</button>
        <div className="week-calendar">
          {weekDays.map((date) => {
            const dateKey = Math.floor(date.getTime() / 1000); // Convert to seconds since 1970
            const fullyBooked = isFullyBooked(date);
            const userBooking = userHasBooking(date);
            return (
              <div
                key={dateKey}
                className={`day-card ${selectedDate.toDateString() === date.toDateString() ? 'selected' : ''} ${fullyBooked ? 'fully-booked' : ''} ${userBooking ? 'user-booked' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="day-name">{date.toLocaleDateString('sv-SE', { weekday: 'short' })}</div>
                <div className="day-number">{date.getDate()}</div>
              </div>
            );
          })}
        </div>
        <button className="nav-button" onClick={handleNextWeek}>&gt;</button>
      </div>
      <div className="booking-details">
        {error && <div className="error-message">{error}</div>}
        <h3>Bookings for {selectedDate.toDateString()}</h3>
        <ul className="timeslot-list">
          {timeslots.map((timeslot) => {
            const dateKey = Math.floor(selectedDate.getTime() / 1000); // Convert to seconds since 1970
            const booking = bookings[dateKey]?.find((booking) => booking.timeslot === timeslot);
            return (
              <li key={timeslot} className={`timeslot-item ${booking ? 'booked' : 'available'}`}>
                <input
                  type="checkbox"
                  checked={!!booking}
                  disabled={isPastDate(selectedDate) || (!!booking && booking.user !== user.name)}
                  onChange={() => handleBooking(timeslot)}
                />
                <span className="timeslot-text">
                  {timeslot} {booking ? `- ${booking.user} (${booking.apartment})` : '- Available'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CalendarComponent;
