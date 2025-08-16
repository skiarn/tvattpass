import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { useFirebase } from './firebase'; // Adjust the import based on your project structure

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
  associations?: any[];
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

const CalendarComponent: React.FC<CalendarComponentProps> = ({ user, maxBookingsPerUser = 1, associations }) => {
  const firebase = useFirebase();
  const [bookings, setBookings] = useState<Bookings>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const activeAssociation = associations && associations.length > 0 ? associations[0] : null;

  // Fetch bookings from Firestore for the selected association and date
  useEffect(() => {
    const fetchBookings = async () => {
      if (!firebase || !activeAssociation) return;
      const dateKey = Math.floor(startOfDay(selectedDate).getTime() / 1000);
      const snapshot = await firebase.firestore().collection('bookings')
        .where('associationId', '==', activeAssociation.id)
        .where('date', '==', dateKey)
        .get();
      const data: Booking[] = snapshot.docs.map(doc => doc.data() as Booking);
      setBookings({ [dateKey]: data });
    };
    fetchBookings();
  }, [firebase, activeAssociation, selectedDate]);

  const handleBooking = async (timeslot: Timeslot) => {
    if (!firebase || !activeAssociation) return;
    const dateKey = Math.floor(startOfDay(selectedDate).getTime() / 1000);
    const currentBookings = bookings[dateKey] || [];
    if (currentBookings.some((booking) => booking.timeslot === timeslot && booking.user === user.name)) {
      await handleUnbooking(timeslot);
      return;
    }
    if (currentBookings.some((booking) => booking.timeslot === timeslot)) {
      setError('This timeslot is already booked.');
      return;
    }
    const userBookings = currentBookings.filter((booking) => booking.user === user.name);
    if (userBookings.length >= maxBookingsPerUser) {
      setError('You have reached your booking limit.');
      return;
    }
    // Add booking to Firestore
    await firebase.firestore().collection('bookings').add({
      associationId: activeAssociation.id,
      date: dateKey,
      timeslot,
      user: user.displayName || user.email || user.uid,
      apartment: user.apartment || '',
      userId: user.uid,
    });
    setError(null);
    // Refetch bookings
    const snapshot = await firebase.firestore().collection('bookings')
      .where('associationId', '==', activeAssociation.id)
      .where('date', '==', dateKey)
      .get();
    const data: Booking[] = snapshot.docs.map(doc => doc.data() as Booking);
    setBookings({ [dateKey]: data });
  };

  const handleUnbooking = async (timeslot: Timeslot) => {
    if (!firebase || !activeAssociation) return;
    const dateKey = Math.floor(startOfDay(selectedDate).getTime() / 1000);
    // Find the booking document to delete
    const snapshot = await firebase.firestore().collection('bookings')
      .where('associationId', '==', activeAssociation.id)
      .where('date', '==', dateKey)
      .where('timeslot', '==', timeslot)
      .where('userId', '==', user.uid)
      .get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
    setError(null);
    // Refetch bookings
    const newSnapshot = await firebase.firestore().collection('bookings')
      .where('associationId', '==', activeAssociation.id)
      .where('date', '==', dateKey)
      .get();
    const data: Booking[] = newSnapshot.docs.map(doc => doc.data() as Booking);
    setBookings({ [dateKey]: data });
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
