/**
 * Major Indian Festivals for 2026
 * These are used to calculate the "Festival Bonus" discount.
 */
export const INDIAN_FESTIVALS_2026 = [
  { name: "Makar Sankranti", date: "2026-01-14" },
  { name: "Republic Day", date: "2026-01-26" },
  { name: "Maha Shivaratri", date: "2026-02-15" },
  { name: "Holi", date: "2026-03-04" },
  { name: "Eid al-Fitr", date: "2026-03-20" }, // Approx
  { name: "Rama Navami", date: "2026-03-26" },
  { name: "Good Friday", date: "2026-04-03" },
  { name: "Vishu / Baisakhi", date: "2026-04-14" },
  { name: "Buddha Purnima", date: "2026-05-01" },
  { name: "Independence Day", date: "2026-08-15" },
  { name: "Janmashtami", date: "2026-09-04" },
  { name: "Ganesh Chaturthi", date: "2026-09-14" },
  { name: "Gandhi Jayanti", date: "2026-10-02" },
  { name: "Dussehra", date: "2026-10-20" },
  { name: "Diwali", date: "2026-11-08" },
  { name: "Guru Nanak Jayanti", date: "2026-11-24" },
  { name: "Christmas", date: "2026-12-25" }
];

/**
 * Checks if a date is within +/- 3 days of a major Indian festival.
 */
export const getNearbyFestival = (dateStr) => {
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  for (const festival of INDIAN_FESTIVALS_2026) {
    const festDate = new Date(festival.date);
    festDate.setHours(0, 0, 0, 0);

    const diffInDays = Math.abs(targetDate - festDate) / (1000 * 60 * 60 * 24);
    if (diffInDays <= 3) {
      return festival.name;
    }
  }
  return null;
};

/**
 * Calculates the discount percentage based on attendees and festival proximity.
 * Tiered logic:
 * - Near Festival: 2+ (5%), 5+ (15%), 10+ (25%)
 * - Standard: 5+ (5%), 10+ (10%)
 */
export const calculateDiscount = (dateStr, numAttendees) => {
  const festival = getNearbyFestival(dateStr);
  let discountPercent = 0;

  if (festival) {
    if (numAttendees >= 10) discountPercent = 25;
    else if (numAttendees >= 5) discountPercent = 15;
    else if (numAttendees >= 2) discountPercent = 5;
  } else {
    if (numAttendees >= 10) discountPercent = 10;
    else if (numAttendees >= 5) discountPercent = 5;
  }

  return {
    festival,
    percent: discountPercent
  };
};
