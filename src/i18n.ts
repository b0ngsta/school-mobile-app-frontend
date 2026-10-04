// Lightweight i18n — no libraries. To add a language: add a dictionary
// below and an entry in LANGS. Missing keys fall back to English.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sw_student_lang';

export const LANGS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

const en = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  // titles & tabs
  'title.Dashboard': 'Dashboard',
  'title.Homework': 'Homework',
  'title.Attendance': 'Attendance',
  'title.Exams': 'Exams',
  'title.More': 'More',
  'title.ReportCards': 'Report cards',
  'title.Fees': 'Fees',
  'title.Remarks': 'Remarks',
  'title.Notices': 'Notices',
  'title.Profile': 'My profile',
  'tab.home': 'Home',
  'tab.homework': 'Homework',
  'tab.attendance': 'Attendance',
  'tab.exams': 'Exams',
  'tab.more': 'More',

  // statuses (badges)
  'status.pending': 'pending',
  'status.submitted': 'submitted',
  'status.late': 'late',
  'status.paid': 'paid',
  'status.present': 'present',
  'status.absent': 'absent',
  'status.leave': 'leave',
  'status.on_leave': 'leave',
  'status.upcoming': 'upcoming',
  'status.ongoing': 'ongoing',
  'status.completed': 'completed',

  // login
  'login.subtitle': 'Sign in — students, teachers, admins & staff',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.signin': 'Sign in',
  'login.missing': 'Enter username and password',

  // fee claims (parent)
  'claim.submit': 'Submit payment proof',
  'claim.sheetTitle': 'Payment proof',
  'claim.help': 'Paid this fee already? Attach the payment screenshot and the school will verify and approve it.',
  'claim.attach': 'Attach payment screenshot',
  'claim.reattach': 'Choose a different screenshot',
  'claim.method': 'Payment method',
  'claim.ref': 'Reference no. (optional)',
  'claim.note': 'Note (optional)',
  'claim.send': 'Submit claim',
  'claim.needShot': 'Please attach the payment screenshot first',
  'claim.underReview': 'Payment proof under review',
  'claim.rejected': 'Claim rejected — please contact the school',

  // api errors
  'err.network': 'Cannot reach server. Check API_URL in src/config.js and your network.',
  'err.studentsOnly': 'This app is for students. Please use a student account.',
  'err.request': 'Request failed ({code})',

  // dashboard
  'dash.hi': 'Hi, {name}',
  'dash.noClass': 'No class assigned',
  'dash.roll': 'Roll {n}',
  'dash.attendance': 'Attendance',
  'dash.pendingHomework': 'Pending homework',
  'dash.feesDue': 'Fees due',
  'dash.nextExam': 'Next exam',
  'dash.none': 'None',
  'dash.upcomingExam': 'Upcoming exam',
  'dash.latestNotices': 'Latest notices',
  'dash.noNotices': 'No notices yet',

  // homework
  'hw.empty': 'No homework assigned',
  'hw.due': 'Due {date} · by {name}',

  // attendance
  'att.overall': 'Overall',
  'att.noRecords': 'No records yet',
  'att.present': '{n} present',
  'att.absent': '{n} absent',
  'att.leave': '{n} leave',
  'att.last90': 'Last 90 days',
  'att.notMarked': 'No attendance marked yet',

  // exams
  'exam.empty': 'No exams scheduled',
  'exam.result': 'Result',
  'exam.marks': '{n} marks',
  'exam.notEntered': 'Not entered',
  'exam.grade': 'Grade {g}',
  'exam.notPublished': 'Results not published yet',

  // fees
  'fees.pending': 'Pending',
  'fees.paid': 'Paid',
  'fees.records': 'Fee records',
  'fees.empty': 'No fee records',
  'fees.paidOn': 'Paid {date}',
  'fees.via': ' via {method}',
  'fees.dueOn': 'Due {date}',

  // report cards
  'rc.empty': 'No report cards yet',
  'rc.issued': 'Issued {date} by {name}',

  // notices & remarks
  'notice.empty': 'No notices',
  'remark.empty': 'No remarks',

  // profile
  'profile.details': 'Details',
  'profile.family': 'Family',
  'profile.username': 'Username',
  'profile.admission': 'Admission no.',
  'profile.dob': 'Date of birth',
  'profile.email': 'Email',
  'profile.phone': 'Phone',
  'profile.father': "Father's name",
  'profile.mother': "Mother's name",
  'profile.guardianPhone': 'Guardian phone',
  'profile.address': 'Address',
  'profile.language': 'Language',
  'profile.logout': 'Log out',
  'profile.logoutConfirm': 'Are you sure you want to log out?',
  'profile.cancel': 'Cancel',

  // more
  'more.reportCards': 'Report cards',
  'more.reportCardsDesc': 'Term-wise grades & remarks',
  'more.fees': 'Fees',
  'more.feesDesc': 'Pending & paid fee records',
  'more.remarks': 'Remarks',
  'more.remarksDesc': 'Notes from your teachers',
  'more.notices': 'Notices',
  'more.noticesDesc': 'School announcements',
  'more.profile': 'My profile',
  'more.profileDesc': 'Personal details & logout',
};

const hi = {
  months: ['जन॰', 'फ़र॰', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल॰', 'अग॰', 'सित॰', 'अक्टू॰', 'नव॰', 'दिस॰'],

  'title.Dashboard': 'डैशबोर्ड',
  'title.Homework': 'गृहकार्य',
  'title.Attendance': 'उपस्थिति',
  'title.Exams': 'परीक्षाएँ',
  'title.More': 'अधिक',
  'title.ReportCards': 'रिपोर्ट कार्ड',
  'title.Fees': 'फीस',
  'title.Remarks': 'टिप्पणियाँ',
  'title.Notices': 'सूचनाएँ',
  'title.Profile': 'मेरी प्रोफ़ाइल',
  'tab.home': 'होम',
  'tab.homework': 'गृहकार्य',
  'tab.attendance': 'उपस्थिति',
  'tab.exams': 'परीक्षाएँ',
  'tab.more': 'अधिक',

  'status.pending': 'बकाया',
  'status.submitted': 'जमा',
  'status.late': 'देरी से',
  'status.paid': 'भुगतान हुआ',
  'status.present': 'उपस्थित',
  'status.absent': 'अनुपस्थित',
  'status.leave': 'छुट्टी',
  'status.on_leave': 'छुट्टी',
  'status.upcoming': 'आगामी',
  'status.ongoing': 'चालू',
  'status.completed': 'संपन्न',

  'login.subtitle': 'साइन इन करें — छात्र, शिक्षक, एडमिन और स्टाफ़',
  'login.username': 'उपयोगकर्ता नाम',
  'login.password': 'पासवर्ड',
  'login.signin': 'साइन इन करें',
  'login.missing': 'उपयोगकर्ता नाम और पासवर्ड दर्ज करें',

  'claim.submit': 'भुगतान प्रमाण भेजें',
  'claim.sheetTitle': 'भुगतान प्रमाण',
  'claim.help': 'फीस भर दी है? भुगतान का स्क्रीनशॉट संलग्न करें — स्कूल जाँच कर स्वीकृत करेगा।',
  'claim.attach': 'भुगतान स्क्रीनशॉट संलग्न करें',
  'claim.reattach': 'दूसरा स्क्रीनशॉट चुनें',
  'claim.method': 'भुगतान का तरीका',
  'claim.ref': 'संदर्भ क्रमांक (वैकल्पिक)',
  'claim.note': 'टिप्पणी (वैकल्पिक)',
  'claim.send': 'दावा भेजें',
  'claim.needShot': 'कृपया पहले भुगतान स्क्रीनशॉट संलग्न करें',
  'claim.underReview': 'भुगतान प्रमाण की समीक्षा हो रही है',
  'claim.rejected': 'दावा अस्वीकृत — कृपया स्कूल से संपर्क करें',

  'err.network': 'सर्वर से संपर्क नहीं हो पा रहा। src/config.js में API_URL और अपना नेटवर्क जाँचें।',
  'err.studentsOnly': 'यह ऐप केवल छात्रों के लिए है। कृपया छात्र खाते का उपयोग करें।',
  'err.request': 'अनुरोध विफल ({code})',

  'dash.hi': 'नमस्ते, {name}',
  'dash.noClass': 'कोई कक्षा निर्धारित नहीं',
  'dash.roll': 'रोल {n}',
  'dash.attendance': 'उपस्थिति',
  'dash.pendingHomework': 'बकाया गृहकार्य',
  'dash.feesDue': 'बकाया फीस',
  'dash.nextExam': 'अगली परीक्षा',
  'dash.none': 'कोई नहीं',
  'dash.upcomingExam': 'आगामी परीक्षा',
  'dash.latestNotices': 'नवीनतम सूचनाएँ',
  'dash.noNotices': 'अभी कोई सूचना नहीं',

  'hw.empty': 'कोई गृहकार्य नहीं मिला',
  'hw.due': 'अंतिम तिथि {date} · {name} द्वारा',

  'att.overall': 'कुल उपस्थिति',
  'att.noRecords': 'अभी कोई रिकॉर्ड नहीं',
  'att.present': '{n} उपस्थित',
  'att.absent': '{n} अनुपस्थित',
  'att.leave': '{n} छुट्टी',
  'att.last90': 'पिछले 90 दिन',
  'att.notMarked': 'अभी उपस्थिति दर्ज नहीं हुई',

  'exam.empty': 'कोई परीक्षा निर्धारित नहीं',
  'exam.result': 'परिणाम',
  'exam.marks': '{n} अंक',
  'exam.notEntered': 'दर्ज नहीं',
  'exam.grade': 'ग्रेड {g}',
  'exam.notPublished': 'परिणाम अभी घोषित नहीं हुए',

  'fees.pending': 'बकाया',
  'fees.paid': 'भुगतान हुआ',
  'fees.records': 'फीस रिकॉर्ड',
  'fees.empty': 'कोई फीस रिकॉर्ड नहीं',
  'fees.paidOn': 'भुगतान {date}',
  'fees.via': ' ({method} से)',
  'fees.dueOn': 'देय तिथि {date}',

  'rc.empty': 'अभी कोई रिपोर्ट कार्ड नहीं',
  'rc.issued': '{name} द्वारा {date} को जारी',

  'notice.empty': 'कोई सूचना नहीं',
  'remark.empty': 'कोई टिप्पणी नहीं',

  'profile.details': 'विवरण',
  'profile.family': 'परिवार',
  'profile.username': 'उपयोगकर्ता नाम',
  'profile.admission': 'प्रवेश क्रमांक',
  'profile.dob': 'जन्म तिथि',
  'profile.email': 'ईमेल',
  'profile.phone': 'फ़ोन',
  'profile.father': 'पिता का नाम',
  'profile.mother': 'माता का नाम',
  'profile.guardianPhone': 'अभिभावक का फ़ोन',
  'profile.address': 'पता',
  'profile.language': 'भाषा',
  'profile.logout': 'लॉग आउट',
  'profile.logoutConfirm': 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
  'profile.cancel': 'रद्द करें',

  'more.reportCards': 'रिपोर्ट कार्ड',
  'more.reportCardsDesc': 'हर टर्म के ग्रेड और टिप्पणियाँ',
  'more.fees': 'फीस',
  'more.feesDesc': 'बकाया और भुगतान की गई फीस',
  'more.remarks': 'टिप्पणियाँ',
  'more.remarksDesc': 'शिक्षकों की ओर से नोट्स',
  'more.notices': 'सूचनाएँ',
  'more.noticesDesc': 'स्कूल की घोषणाएँ',
  'more.profile': 'मेरी प्रोफ़ाइल',
  'more.profileDesc': 'व्यक्तिगत विवरण और लॉग आउट',
};

type Dict = Record<string, string | string[]>;

const DICTS: Record<LangCode, Dict> = { en, hi };

export type LangCode = 'en' | 'hi';
export type TVars = Record<string, string | number | null | undefined>;

let current: LangCode = 'en';
const listeners = new Set<(code: LangCode) => void>();

export const getLang = (): LangCode => current;

export async function loadLang(): Promise<LangCode> {
  try {
    const saved = await AsyncStorage.getItem(KEY);
    if (saved && saved in DICTS) current = saved as LangCode;
  } catch {}
  return current;
}

export async function setLang(code: LangCode): Promise<void> {
  if (!DICTS[code]) return;
  current = code;
  listeners.forEach(fn => fn(code));
  try {
    await AsyncStorage.setItem(KEY, code);
  } catch {}
}

export function subscribe(fn: (code: LangCode) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// t('dash.hi', {name: 'Asha'}) -> 'Hi, Asha' / 'नमस्ते, Asha'
// t('months') returns the localized month-name array.
export function t(key: 'months'): string[];
export function t(key: string, vars?: TVars): string;
export function t(key: string, vars?: TVars): string | string[] {
  let s = DICTS[current][key] ?? DICTS.en[key] ?? key;
  if (typeof s === 'string' && vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v ?? ''));
  }
  return s;
}
