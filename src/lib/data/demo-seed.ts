import { DEFAULT_MESSAGE_TEMPLATES } from "../messaging/templates";
import { defaultPalette } from "../templates";
import type { Dietary, Guest, GuestCategory, PartyMember, RsvpStatus, Side, Wedding } from "../types";
import { l10n, mulberry32, randomId } from "../utils";

export const DEMO_WEDDING_ID = "wed_demo_noa_daniel";
export const DEMO_USER_ID = "demo-user";
export const DEMO_EMAIL = "demo@vow.app";
export const DEMO_SLUG = "daniel-and-noa";

/** The brief: 350 invited, 218 confirmed, 42 declined, 90 pending. */
export const DEMO_COUNTS = { total: 350, confirmed: 218, declined: 42, pending: 90 } as const;

type Name = readonly [en: string, he: string];

const FEMALE: Name[] = [
  ["Yael", "יעל"], ["Tamar", "תמר"], ["Maya", "מאיה"], ["Shira", "שירה"], ["Michal", "מיכל"],
  ["Adi", "עדי"], ["Roni", "רוני"], ["Hila", "הילה"], ["Liat", "ליאת"], ["Dana", "דנה"],
  ["Einav", "עינב"], ["Efrat", "אפרת"], ["Inbar", "ענבר"], ["Keren", "קרן"], ["Meital", "מיטל"],
  ["Neta", "נטע"], ["Orly", "אורלי"], ["Rachel", "רחל"], ["Sarah", "שרה"], ["Sivan", "סיון"],
  ["Talia", "טליה"], ["Vered", "ורד"], ["Yifat", "יפעת"], ["Anat", "ענת"], ["Rivka", "רבקה"],
  ["Esther", "אסתר"], ["Miriam", "מרים"], ["Hadas", "הדס"], ["Ayelet", "איילת"], ["Shani", "שני"],
  ["Moran", "מורן"], ["Nofar", "נופר"], ["Lihi", "ליהי"], ["Agam", "אגם"], ["Romi", "רומי"],
  ["Ella", "אלה"], ["Daniella", "דניאלה"], ["Carmel", "כרמל"], ["Stav", "סתיו"], ["Sapir", "ספיר"],
  ["Gali", "גלי"], ["Lior", "ליאור"], ["Noga", "נגה"], ["Ofri", "עופרי"], ["Tzipi", "ציפי"],
  ["Ruth", "רות"], ["Naomi", "נעמי"], ["Batya", "בתיה"], ["Limor", "לימור"], ["Merav", "מירב"],
];

const MALE: Name[] = [
  ["Yossi", "יוסי"], ["David", "דוד"], ["Moshe", "משה"], ["Avi", "אבי"], ["Eitan", "איתן"],
  ["Omer", "עומר"], ["Ido", "עידו"], ["Itai", "איתי"], ["Yonatan", "יונתן"], ["Nadav", "נדב"],
  ["Amit", "עמית"], ["Ori", "אורי"], ["Guy", "גיא"], ["Tomer", "תומר"], ["Roi", "רועי"],
  ["Asaf", "אסף"], ["Erez", "ארז"], ["Gil", "גיל"], ["Haim", "חיים"], ["Yaakov", "יעקב"],
  ["Shlomo", "שלמה"], ["Ronen", "רונן"], ["Dror", "דרור"], ["Eyal", "אייל"], ["Nir", "ניר"],
  ["Oren", "אורן"], ["Shai", "שי"], ["Tzvi", "צבי"], ["Yoav", "יואב"], ["Zohar", "זוהר"],
  ["Alon", "אלון"], ["Barak", "ברק"], ["Elad", "אלעד"], ["Matan", "מתן"], ["Noam", "נועם"],
  ["Raz", "רז"], ["Yair", "יאיר"], ["Lavi", "לביא"], ["Ariel", "אריאל"], ["Ben", "בן"],
  ["Yehuda", "יהודה"], ["Michael", "מיכאל"], ["Yitzhak", "יצחק"], ["Avraham", "אברהם"],
  ["Reuven", "ראובן"], ["Shimon", "שמעון"], ["Eli", "אלי"], ["Meir", "מאיר"], ["Gadi", "גדי"],
  ["Uriel", "אוריאל"],
];

const LAST: Name[] = [
  ["Mizrahi", "מזרחי"], ["Peretz", "פרץ"], ["Biton", "ביטון"], ["Dahan", "דהן"],
  ["Friedman", "פרידמן"], ["Malka", "מלכה"], ["Azoulay", "אזולאי"], ["Katz", "כץ"],
  ["Yosef", "יוסף"], ["Amar", "עמר"], ["Ohana", "אוחנה"], ["Hadad", "חדד"], ["Gabay", "גבאי"],
  ["Ben-David", "בן דוד"], ["Shapiro", "שפירא"], ["Rosenberg", "רוזנברג"], ["Goldberg", "גולדברג"],
  ["Weiss", "וייס"], ["Segal", "סגל"], ["Shalom", "שלום"], ["Navon", "נבון"], ["Sasson", "ששון"],
  ["Golan", "גולן"], ["Sharabi", "שרעבי"], ["Elkayam", "אלקיים"], ["Vaknin", "וקנין"],
  ["Stern", "שטרן"], ["Klein", "קליין"], ["Carmi", "כרמי"], ["Bar-Lev", "בר לב"], ["Regev", "רגב"],
  ["Shoham", "שוהם"], ["Zilberman", "זילברמן"], ["Harari", "הררי"], ["Nahum", "נחום"],
  ["Rothman", "רוטמן"], ["Edri", "אדרי"], ["Suissa", "סויסה"], ["Baruch", "ברוך"],
  ["Schwartz", "שוורץ"], ["Ashkenazi", "אשכנזי"], ["Dayan", "דיין"], ["Gross", "גרוס"],
  ["Yadin", "ידין"], ["Tzur", "צור"], ["Lavie", "לביא"], ["Kaplan", "קפלן"], ["Aharoni", "אהרוני"],
];

const COHEN: Name = ["Cohen", "כהן"];
const LEVI: Name = ["Levi", "לוי"];

interface GroupDef {
  en: string;
  he: string;
  category: GuestCategory;
  side: Side;
  weight: number;
  /** Family surnames to favour, most likely first. */
  surnames?: Name[];
}

const GROUPS: GroupDef[] = [
  { en: "Cohen family", he: "משפחת כהן", category: "family", side: "bride", weight: 48, surnames: [COHEN] },
  { en: "Mizrahi family", he: "משפחת מזרחי", category: "family", side: "bride", weight: 26, surnames: [LAST[0]] },
  { en: "Levi family", he: "משפחת לוי", category: "family", side: "groom", weight: 46, surnames: [LEVI] },
  { en: "Friedman family", he: "משפחת פרידמן", category: "family", side: "groom", weight: 27, surnames: [LAST[4]] },
  { en: "Noa's university friends", he: "חברים מהאוניברסיטה של נועה", category: "friends", side: "bride", weight: 34 },
  { en: "Noa's childhood friends", he: "חברי הילדות של נועה", category: "friends", side: "bride", weight: 22 },
  { en: "Daniel's army friends", he: "חברים מהצבא של דניאל", category: "friends", side: "groom", weight: 30 },
  { en: "Daniel's school friends", he: "חברים מהתיכון של דניאל", category: "friends", side: "groom", weight: 24 },
  { en: "Mutual friends", he: "חברים משותפים", category: "friends", side: "both", weight: 23 },
  { en: "Noa's colleagues", he: "עמיתים לעבודה של נועה", category: "work", side: "bride", weight: 24 },
  { en: "Daniel's colleagues", he: "עמיתים לעבודה של דניאל", category: "work", side: "groom", weight: 25 },
  { en: "Parents' friends", he: "חברים של ההורים", category: "other", side: "both", weight: 14 },
  { en: "Neighbours", he: "שכנים", category: "other", side: "both", weight: 7 },
];

const CONFIRM_PROPENSITY: Record<GuestCategory, number> = { family: 1.3, friends: 1.0, work: 0.72, other: 0.85 };
const DECLINE_PROPENSITY: Record<GuestCategory, number> = { family: 0.8, friends: 1.0, work: 1.25, other: 1.1 };

/** Days before "now" that each wave of invitations went out. */
const SENT_DAYS_AGO: Record<GuestCategory, number> = { family: 63, friends: 56, work: 49, other: 49 };

const CONFIRM_MESSAGES: Name[] = [
  ["Mazal tov! We are so excited for you both.", "מזל טוב! מתרגשים איתכם מאוד."],
  ["Wouldn't miss it for the world.", "לא מפספסים את זה בשום אופן."],
  ["Counting the days. Save us a spot on the dance floor!", "סופרים את הימים. תשמרו לנו מקום ברחבה!"],
  ["So happy for you two. See you under the chuppah.", "כל כך שמחים בשבילכם. נתראה מתחת לחופה."],
  ["Finally! It's going to be a beautiful day.", "סוף סוף! זה הולך להיות יום מושלם."],
  ["We love you both. Can't wait to celebrate.", "אוהבים אתכם. מחכים כבר לחגוג."],
  ["The whole family is coming, with bells on.", "כל המשפחה מגיעה, ובשמחה גדולה."],
];

const DECLINE_MESSAGES: Name[] = [
  ["We'll be abroad that week and are so sorry to miss it. Mazal tov!", "נהיה בחו״ל באותו שבוע ומצטערים מאוד לפספס. מזל טוב!"],
  ["Sadly we can't make it. Wishing you a lifetime of happiness.", "לצערנו לא נוכל להגיע. מאחלים לכם חיים שלמים של אושר."],
  ["A family event on the same day. We'll celebrate with you soon.", "יש לנו אירוע משפחתי באותו יום. נחגוג איתכם בקרוב."],
  ["Heartbroken to miss it. Sending all our love.", "שבורי לב שלא נהיה שם. שולחים המון אהבה."],
  ["On reserve duty that week. Have the most wonderful day.", "במילואים באותו שבוע. שיהיה לכם יום נפלא."],
];

const SPECIAL_REQUESTS: Name[] = [
  ["We will need a high chair, please.", "נצטרך כיסא תינוק, בבקשה."],
  ["Severe nut allergy, please let the kitchen know.", "אלרגיה חמורה לאגוזים, נא לעדכן את המטבח."],
  ["Wheelchair-accessible seating, please.", "נשמח למקום ישיבה נגיש לכיסא גלגלים."],
  ["We'll arrive right after the ceremony.", "נגיע מיד אחרי החופה."],
  ["Lactose-free dessert if possible.", "אם אפשר, קינוח ללא לקטוז."],
  ["Please seat us away from the speakers.", "נשמח לשבת רחוק מהרמקולים."],
  ["Pregnant, so no raw fish please.", "בהיריון, אז בלי דג נא בבקשה."],
];

const DAY = 86_400_000;
const HOUR = 3_600_000;

export function buildDemoWedding(now = Date.now()): Wedding {
  return {
    id: DEMO_WEDDING_ID,
    slug: DEMO_SLUG,
    ownerId: DEMO_USER_ID,
    bride: l10n("Noa", "נועה"),
    groom: l10n("Daniel", "דניאל"),
    brideLast: l10n("Cohen", "כהן"),
    groomLast: l10n("Levi", "לוי"),
    date: "2027-06-18",
    receptionTime: "11:00",
    ceremonyTime: "12:30",
    venue: l10n("The Gardens", "הגנים"),
    address: l10n("12 HaPardes Lane, Emek Hefer", "דרך הפרדס 12, עמק חפר"),
    language: "en",
    style: "classic",
    colors: ["gold", "ivory"],
    templateId: "classic",
    palette: defaultPalette("classic"),
    text: {
      en: {
        opening: "Together with their families",
        invitation: "invite you to celebrate their wedding",
        closing: "Lunch, dancing and a long golden afternoon to follow",
      },
      he: {
        opening: "בשמחה ובהתרגשות, יחד עם משפחותיהם",
        invitation: "מתכבדים להזמינכם לחגוג עמם את יום נישואיהם",
        closing: "נשמח לראותכם בין אורחינו",
      },
    },
    intro: l10n(
      "We met on a rainy Tuesday in Tel Aviv, sharing an umbrella that belonged to neither of us. Six years, two apartments and one very opinionated dog later, we are getting married, and we cannot imagine the day without you.",
      "נפגשנו ביום שלישי גשום בתל אביב, מתחת למטרייה שלא הייתה של אף אחד מאיתנו. שש שנים, שתי דירות וכלבה אחת עם דעות נחרצות אחר כך, אנחנו מתחתנים — ולא מסוגלים לדמיין את היום הזה בלעדיכם.",
    ),
    personalMessage: "",
    photos: ["/demo/scene-1.svg", "/demo/scene-2.svg", "/demo/scene-3.svg", "/demo/scene-4.svg"],
    rsvpDeadline: "2027-05-18",
    allowOpenRsvp: true,
    messageTemplates: DEFAULT_MESSAGE_TEMPLATES,
    createdAt: new Date(now - 75 * DAY).toISOString(),
  };
}

/**
 * Builds the demo guest list. Names, phones, parties and tokens are fully deterministic;
 * timestamps are placed relative to `now` so the activity feed always looks recent.
 */
export function buildDemoGuests(now = Date.now()): Guest[] {
  const rand = mulberry32(20270618);
  const pickOne = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)];
  const chance = (p: number) => rand() < p;
  const between = (min: number, max: number) => min + rand() * (max - min);

  const totalWeight = GROUPS.reduce((sum, g) => sum + g.weight, 0);
  const pickGroup = (): GroupDef => {
    let roll = rand() * totalWeight;
    for (const g of GROUPS) {
      roll -= g.weight;
      if (roll <= 0) return g;
    }
    return GROUPS[GROUPS.length - 1];
  };

  const usedNames = new Set<string>();
  const usedPhones = new Set<string>();
  const usedTokens = new Set<string>();

  const makePhone = (): string => {
    for (;;) {
      const prefix = pickOne(["50", "52", "53", "54", "58"]);
      let digits = "";
      for (let i = 0; i < 7; i++) digits += Math.floor(rand() * 10);
      const phone = `972${prefix}${digits}`;
      if (!usedPhones.has(phone)) {
        usedPhones.add(phone);
        return phone;
      }
    }
  };

  const makeToken = (): string => {
    for (;;) {
      const token = randomId(10, rand);
      if (!usedTokens.has(token)) {
        usedTokens.add(token);
        return token;
      }
    }
  };

  const pickMeal = (isChild: boolean): Dietary => {
    if (isChild) return chance(0.8) ? "kids" : "regular";
    const roll = rand();
    if (roll < 0.76) return "regular";
    if (roll < 0.85) return "vegetarian";
    if (roll < 0.9) return "vegan";
    if (roll < 0.94) return "gluten_free";
    if (roll < 0.97) return "kosher_mehadrin";
    return "allergy";
  };

  interface Draft {
    guest: Guest;
    confirmKey: number;
    declineKey: number;
    companions: { name: Name; isChild: boolean }[];
    hebrewSpeaker: boolean;
  }

  const drafts: Draft[] = [];

  for (let i = 0; i < DEMO_COUNTS.total; i++) {
    const group = pickGroup();
    const female = chance(0.5);

    let first: Name;
    let last: Name;
    for (;;) {
      first = pickOne(female ? FEMALE : MALE);
      last = group.surnames && chance(0.72) ? group.surnames[0] : pickOne(LAST);
      const key = `${first[0]} ${last[0]}`;
      if (!usedNames.has(key)) {
        usedNames.add(key);
        break;
      }
    }

    // Who is on the invitation.
    let invitedAdults = 1;
    let invitedChildren = 0;
    let plusOne = false;
    const roll = rand();
    if (group.category === "family") {
      if (roll < 0.45) invitedAdults = 2;
      else if (roll < 0.75) {
        invitedAdults = 2;
        invitedChildren = 1 + Math.floor(rand() * 3);
      } else if (roll < 0.9) invitedAdults = 1;
      else plusOne = true;
    } else if (group.category === "friends") {
      if (roll < 0.4) plusOne = true;
      else if (roll < 0.75) invitedAdults = 2;
      else if (roll < 0.95) invitedAdults = 1;
      else {
        invitedAdults = 2;
        invitedChildren = 1;
      }
    } else if (group.category === "work") {
      if (roll < 0.55) plusOne = true;
      else if (roll < 0.85) invitedAdults = 1;
      else invitedAdults = 2;
    } else if (roll < 0.7) invitedAdults = 2;

    const companions: Draft["companions"] = [];
    if (invitedAdults === 2) {
      const spouse = pickOne(female ? MALE : FEMALE);
      companions.push({ name: [`${spouse[0]} ${last[0]}`, `${spouse[1]} ${last[1]}`], isChild: false });
    }
    if (plusOne) {
      const partner = pickOne(female ? MALE : FEMALE);
      const partnerLast = pickOne(LAST);
      companions.push({ name: [`${partner[0]} ${partnerLast[0]}`, `${partner[1]} ${partnerLast[1]}`], isChild: false });
    }
    for (let c = 0; c < invitedChildren; c++) {
      const child = pickOne(chance(0.5) ? FEMALE : MALE);
      companions.push({ name: [`${child[0]} ${last[0]}`, `${child[1]} ${last[1]}`], isChild: true });
    }

    const sentAt = now - SENT_DAYS_AGO[group.category] * DAY + between(0, 9) * HOUR;

    drafts.push({
      confirmKey: rand() * CONFIRM_PROPENSITY[group.category],
      declineKey: rand() * DECLINE_PROPENSITY[group.category],
      companions,
      hebrewSpeaker: chance(0.55),
      guest: {
        id: `g_${String(i + 1).padStart(4, "0")}`,
        weddingId: DEMO_WEDDING_ID,
        token: makeToken(),
        name: `${first[0]} ${last[0]}`,
        nameHe: `${first[1]} ${last[1]}`,
        phone: makePhone(),
        group: group.en,
        groupHe: group.he,
        category: group.category,
        side: group.side,
        invitedAdults,
        invitedChildren,
        plusOne,
        status: "pending",
        attendees: 0,
        party: [],
        specialRequests: "",
        message: "",
        table: "",
        notes: "",
        invitationSentAt: new Date(sentAt).toISOString(),
        lastResponseAt: null,
        remindersSent: 0,
        responseCount: 0,
        source: "host",
        createdAt: new Date(now - 72 * DAY).toISOString(),
      },
    });
  }

  // Exact status counts, weighted so families confirm more and colleagues decline more.
  const byConfirm = [...drafts].sort((a, b) => b.confirmKey - a.confirmKey);
  const confirmed = new Set(byConfirm.slice(0, DEMO_COUNTS.confirmed));
  const rest = byConfirm.slice(DEMO_COUNTS.confirmed).sort((a, b) => b.declineKey - a.declineKey);
  const declined = new Set(rest.slice(0, DEMO_COUNTS.declined));

  const tableByGroup = new Map<string, number>();
  let nextTable = 1;
  const seatsAtTable = new Map<number, number>();

  for (const draft of drafts) {
    const g = draft.guest;
    const status: RsvpStatus = confirmed.has(draft) ? "confirmed" : declined.has(draft) ? "declined" : "pending";
    g.status = status;
    const sentAt = new Date(g.invitationSentAt as string).getTime();
    const elapsedDays = (now - sentAt) / DAY;

    if (status === "pending") {
      const nudge = rand();
      g.remindersSent = elapsedDays > 30 ? (nudge < 0.2 ? 2 : nudge < 0.85 ? 1 : 0) : 0;
      continue;
    }

    // When they answered: most within days, a second bump after the reminder at ~day 30.
    const roll = rand();
    let delayDays: number;
    if (roll < 0.4) delayDays = Math.pow(rand(), 1.6) * 3;
    else if (roll < 0.64) delayDays = between(3, 14);
    else if (roll < 0.78) delayDays = between(14, 30);
    else if (roll < 0.92) delayDays = between(30, 34);
    else delayDays = between(34, Math.max(35, elapsedDays - 1.5));
    delayDays = Math.min(delayDays, elapsedDays - 1.3);
    g.lastResponseAt = new Date(sentAt + delayDays * DAY).toISOString();
    g.remindersSent = delayDays > 30 ? 1 : 0;
    g.responseCount = chance(0.08) ? 2 : 1;

    const lang = draft.hebrewSpeaker ? 1 : 0;

    if (status === "declined") {
      if (chance(0.38)) g.message = pickOne(DECLINE_MESSAGES)[lang];
      continue;
    }

    // Confirmed: who is actually coming.
    let coming = draft.companions;
    if (g.plusOne && chance(0.3)) coming = coming.filter((c) => c.isChild);
    else if (g.invitedAdults === 2 && g.invitedChildren === 0 && chance(0.07)) coming = [];
    else if (g.invitedChildren > 0 && chance(0.2)) coming = coming.slice(0, -1);

    const party: PartyMember[] = [
      { name: lang ? (g.nameHe as string) : g.name, meal: pickMeal(false) },
      ...coming.map((c) => ({
        name: c.name[lang],
        meal: pickMeal(c.isChild),
        ...(c.isChild ? { isChild: true } : {}),
      })),
    ];
    g.party = party;
    g.attendees = party.length;
    if (chance(0.26)) g.message = pickOne(CONFIRM_MESSAGES)[lang];
    if (chance(0.09)) g.specialRequests = pickOne(SPECIAL_REQUESTS)[lang];

    // Seating: fill tables of ten, group by group. Two thirds are already seated.
    if (chance(0.66)) {
      let table = tableByGroup.get(g.group);
      if (!table || (seatsAtTable.get(table) ?? 0) + party.length > 10) {
        table = nextTable++;
        tableByGroup.set(g.group, table);
      }
      seatsAtTable.set(table, (seatsAtTable.get(table) ?? 0) + party.length);
      g.table = String(table);
    }
  }

  // A lively last day: the most recent answers arrived minutes and hours ago.
  const recentOffsets = [0.4, 1.6, 3.1, 5.4, 9.2, 17.5, 26];
  const responders = drafts
    .map((d) => d.guest)
    .filter((g) => g.status !== "pending")
    .sort((a, b) => (b.lastResponseAt as string).localeCompare(a.lastResponseAt as string));
  recentOffsets.forEach((hoursAgo, index) => {
    const g = responders[index];
    if (g) g.lastResponseAt = new Date(now - hoursAgo * HOUR).toISOString();
  });

  return drafts.map((d) => d.guest);
}
