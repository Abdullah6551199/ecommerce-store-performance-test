import type { ReviewerStyle } from "../shared/types";

const PAKISTANI_FIRST_NAMES = [
  "Muhammad", "Ali", "Ahmed", "Usman", "Bilal", "Hamza", "Zubair", "Omer", "Tariq", "Hassan",
  "Fatima", "Ayesha", "Zainab", "Sana", "Mariam", "Hira", "Anum", "Sadia", "Mahnoor", "Iqra",
  "Khurram", "Danish", "Shahzaib", "Farhan", "Adnan", "Nimra", "Rabia", "Bushra", "Mehwish", "Zunaira"
];

const PAKISTANI_LAST_NAMES = [
  "Khan", "Malik", "Chaudhry", "Sheikh", "Bhatti", "Qureshi", "Siddiqui", "Abbasi", "Raza", "Shah",
  "Ansari", "Mirza", "Farooqi", "Awan", "Butt", "Jutt", "Memon", "Alvi", "Dar", "Hashmi"
];

const INTL_FIRST_NAMES = [
  "James", "Emma", "Liam", "Olivia", "Noah", "Sophia", "Lucas", "Isabella", "Mason", "Mia",
  "Ethan", "Ava", "Alexander", "Charlotte", "Daniel", "Amelia", "Henry", "Harper", "Sebastian", "Evelyn",
  "David", "Emily", "Joseph", "Abigail", "Samuel", "Ella", "Julian", "Grace", "Leo", "Chloe"
];

const INTL_LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Anderson", "Taylor",
  "Thomas", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez"
];

export function getRandomName(style: ReviewerStyle): string {
  let firstNames = INTL_FIRST_NAMES;
  let lastNames = INTL_LAST_NAMES;

  if (style === "pakistani") {
    firstNames = PAKISTANI_FIRST_NAMES;
    lastNames = PAKISTANI_LAST_NAMES;
  } else if (style === "mix") {
    if (Math.random() > 0.5) {
      firstNames = PAKISTANI_FIRST_NAMES;
      lastNames = PAKISTANI_LAST_NAMES;
    }
  }

  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

export function generateFakeEmail(authorName: string): string {
  const clean = authorName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const num = Math.floor(10 + Math.random() * 90);
  const domains = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "proton.me"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${clean}${num}@${domain}`;
}
