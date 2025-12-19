/**
 * Helper functions for generating recurring event instances
 */

export interface RecurrencePattern {
  frequency: "daily" | "weekly" | "monthly";
  interval: number; // e.g., 1 = every day/week/month, 2 = every 2 days/weeks/months
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday (for weekly)
  endDate?: Date;
  occurrences?: number; // Alternative to endDate
}

export interface RecurringEventData {
  startDate: Date;
  endDate?: Date; // For single event duration
  pattern: RecurrencePattern;
}

/**
 * Generate dates for recurring events
 */
export function generateRecurringDates(data: RecurringEventData): Date[] {
  const { startDate, pattern } = data;
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  let count = 0;
  const maxOccurrences = pattern.occurrences || 100; // Safety limit
  const endDate = pattern.endDate || new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

  while (count < maxOccurrences && currentDate <= endDate) {
    // Add current date
    dates.push(new Date(currentDate));
    count++;

    // Calculate next date based on frequency
    switch (pattern.frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + pattern.interval);
        break;

      case "weekly":
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          // Find next matching day of week
          let daysToAdd = 1;
          let nextDay = new Date(currentDate);
          nextDay.setDate(nextDay.getDate() + daysToAdd);
          
          while (!pattern.daysOfWeek.includes(nextDay.getDay()) && daysToAdd < 7) {
            daysToAdd++;
            nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + daysToAdd);
          }
          
          currentDate = nextDay;
        } else {
          // Default to weekly interval
          currentDate.setDate(currentDate.getDate() + (7 * pattern.interval));
        }
        break;

      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + pattern.interval);
        break;
    }
  }

  return dates;
}

/**
 * Generate event instances from a recurring pattern
 */
export function generateEventInstances(
  baseEventData: any,
  recurringData: RecurringEventData
): any[] {
  const dates = generateRecurringDates(recurringData);
  const duration = baseEventData.endDate
    ? new Date(baseEventData.endDate).getTime() - new Date(baseEventData.startDate).getTime()
    : 0;

  return dates.map((date, index) => {
    const startDate = new Date(date);
    const endDate = duration > 0 ? new Date(date.getTime() + duration) : null;

    return {
      ...baseEventData,
      startDate: startDate.toISOString(),
      endDate: endDate ? endDate.toISOString() : null,
      isRecurring: 1,
      recurringGroupId: baseEventData.recurringGroupId || `recurring-${Date.now()}`,
      recurringIndex: index,
    };
  });
}

/**
 * Preview recurring dates (for UI display)
 */
export function previewRecurringDates(
  startDate: Date,
  pattern: RecurrencePattern,
  limit: number = 10
): string[] {
  const dates = generateRecurringDates({
    startDate,
    pattern: {
      ...pattern,
      occurrences: Math.min(pattern.occurrences || limit, limit),
    },
  });

  return dates.map(date => 
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );
}
