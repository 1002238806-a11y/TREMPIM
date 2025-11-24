
import { BusLine, CombinedTransportItem, Ride } from "./types";

export const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const getMinutesDiff = (targetTime: string): number => {
  const now = new Date();
  const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
  
  const target = new Date();
  target.setHours(targetHours, targetMinutes, 0, 0);
  
  // If target is earlier today, assume it's for tomorrow (or passed)
  // For this app context (daily view), negative means passed.
  const diffMs = target.getTime() - now.getTime();
  return Math.floor(diffMs / 1000 / 60);
};

export const getGoogleMapsLink = (origin: string, destination: string, mode: 'driving' | 'transit') => {
  const baseUrl = "https://www.google.com/maps/dir/?api=1";
  const originParam = `&origin=${encodeURIComponent(origin)}`;
  const destParam = `&destination=${encodeURIComponent(destination)}`;
  const modeParam = `&travelmode=${mode}`;
  return `${baseUrl}${originParam}${destParam}${modeParam}`;
};

// New Helper for Hebrew Dates
export const formatHebrewDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      calendar: 'hebrew'
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

export const mergeAndSortTransport = (
  rides: Ride[],
  buses: BusLine[],
  filterDest: string,
  timeRange: { start: string, end: string },
  selectedDateStr: string // YYYY-MM-DD
): CombinedTransportItem[] => {
  
  const results: CombinedTransportItem[] = [];
  const selectedDate = new Date(selectedDateStr);
  const dayOfWeek = selectedDate.getDay(); // 0-6

  // Helper to check time range
  const isInRange = (time: string) => {
    return time >= timeRange.start && time <= timeRange.end;
  };

  // 1. Process Rides
  rides.forEach(ride => {
    // Basic filter logic
    const matchesDest = filterDest === 'הכל' || ride.destination.includes(filterDest) || ride.origin.includes(filterDest);
    
    // Date Logic
    let matchesDate = false;
    if (ride.isRecurring && ride.recurringDays) {
      matchesDate = ride.recurringDays.includes(dayOfWeek);
    } else {
      matchesDate = ride.date === selectedDateStr;
    }

    // Time Logic
    const matchesTime = isInRange(ride.time);

    if (matchesDest && matchesDate && matchesTime) {
      results.push({
        id: ride.id,
        type: 'ride',
        data: ride,
        sortTime: ride.time
      });
    }
  });

  // 2. Process Buses
  buses.forEach(bus => {
    const matchesDest = filterDest === 'הכל' || bus.destination.includes(filterDest) || bus.origin.includes(filterDest);
    
    if (matchesDest) {
      // Filter bus schedule based on the selected time range
      const scheduleInWindow = bus.schedule.filter(time => isInRange(time));
      
      scheduleInWindow.forEach(time => {
        results.push({
          id: `bus-${bus.line}-${time}`,
          type: 'bus',
          data: { line: bus, departureTime: time },
          sortTime: time
        });
      });
    }
  });

  // 3. Sort by Time
  return results.sort((a, b) => a.sortTime.localeCompare(b.sortTime));
};
