import axios from "axios";

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export const getErrorMessage = (error) => {
  if (!error.response) return 'Network error - check connectivity';

  if (error.response.status === 400) return error.response.data.message;
  if (error.response.status === 401) return 'You do not have permission to access this page';
  if (error.response.status === 403) return 'Session expired';
  if (error.response.status === 404) return 'Page Not Found';
  if (error.response.status === 500) return 'Server error';

  return 'Unknown error occurred';
};

export const convertStrToCamelCase = (str) => {
  const tokens = str.split(`_`);
  return tokens.map(t => convertWordToCamelCase(t)).join(` `);
}

export const convertWordToCamelCase = (word) => {
  if (word.length <= 2) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export const convertDateArrayToDate = (dateArray) => {
  return new Date(dateArray[0], dateArray[1], dateArray[2]);
}

/**
 * Helper to convert [YYYY, M, D, h, m, s] arrays into a readable date string.
 * Handles both LocalDate (3 elements) and LocalDateTime (7 elements).
 */
export /**
 * Advanced Date Helper: Returns relative time (e.g., "3 hours ago") 
 * if within 24 hours, otherwise returns formatted date.
 */
  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
      return 'N/A';
    }

    // Destructure array: [Year, Month, Day, Hour, Minute, Second]
    // Note: Month is 1-indexed from Java, JS Date needs 0-indexed.
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    const submittedDate = new Date(year, month - 1, day, hour, minute, second);
    const now = new Date();

    // Difference in milliseconds
    const diffInMs = now - submittedDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    // 1. If less than 1 hour ago
    if (diffInMinutes < 60 && diffInMinutes >= 0) {
      return `${diffInMinutes === 0 ? 'Just now' : `${diffInMinutes}m ago`}`;
    }

    // 2. If less than 24 hours ago
    if (diffInHours < 24 && diffInHours >= 0) {
      return `${diffInHours}h ago`;
    }

    // 3. Fallback: Standard Date Format
    return submittedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  export const formatApiDateTime = (v) => {
  if (v === null || v === undefined) return "—";

  // If backend returns ISO string
  if (typeof v === "string") {
    // show "YYYY-MM-DD HH:mm:ss" if it looks like ISO
    if (v.includes("T")) return v.slice(0, 19).replace("T", " ");
    return v; // already formatted
  }

  // If backend returns epoch seconds (number) or numeric-like
  // Your payload shows seconds with decimals: 1753325877.000000000
  if (typeof v === "number") {
    const ms = v < 1e12 ? v * 1000 : v; // seconds -> ms, or already ms
    const d = new Date(ms);
    if (isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 19).replace("T", " ");
  }

  // Some APIs serialize BigDecimal as something else; try to coerce
  const n = Number(v as any);
  if (!Number.isNaN(n) && Number.isFinite(n)) {
    const ms = n < 1e12 ? n * 1000 : n;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 19).replace("T", " ");
  }

  return "—";
};