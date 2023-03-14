export const rates = [
  {
    id: 1,
    usd: 1,
    ylt: 100,
    rate: "$1/100ylt",
  },
  {
    id: 2,
    usd: 1,
    ylt: 101,
    rate: "$1/101ylt",
  },
  {
    id: 3,
    usd: 1,
    ylt: 102,
    rate: "$1/102ylt",
  },
  {
    id: 4,
    usd: 1,
    ylt: 103,
    rate: "$1/103ylt",
  },
  {
    id: 5,
    usd: 1,
    ylt: 104,
    rate: "$1/104ylt",
  },
  {
    id: 6,
    usd: 1,
    ylt: 105,
    rate: "$1/105ylt",
  },
  {
    id: 7,
    usd: 1,
    ylt: 106,
    rate: "$1/106ylt",
  },
  {
    id: 8,
    usd: 1,
    ylt: 107,
    rate: "$1/107ylt",
  },
  {
    id: 9,
    usd: 1,
    ylt: 108,
    rate: "$1/108ylt",
  },
  {
    id: 10,
    usd: 1,
    ylt: 109,
    rate: "$1/109ylt",
  },
];

export function shortenAddress(fullAddress) {
  return fullAddress.substring(0, 6) + "..." + fullAddress.substring(fullAddress.length - 4);
}

export function dateFormat(dateString) {
  // Create a new date object from the date string
  let date = new Date(dateString);

  // Get the day, month, and year
  let day = date.getDate();
  let month = date.getMonth() + 1; // GetMonth returns a zero-based month, so we need to add 1 to get the actual month number
  let year = date.getFullYear();

  // Get the hour and minute
  let hour = date.getHours();
  let minute = date.getMinutes();

  // Pad single-digit day and month with leading zeros
  if (day < 10) {
  day = `0${day}`;
  }
  if (month < 10) {
  month = `0${month}`;
  }

  // Use template literals to create the new date string
  return `${day}/${month}/${year} ${hour}:${minute}`;
}