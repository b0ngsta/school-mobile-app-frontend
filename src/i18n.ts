// Lightweight i18n — no libraries. To add a language: add a dictionary
// below and an entry in LANGS. Missing keys fall back to English.
// Two key styles: dotted ids ('dash.hi') defined in `en`, and plain English
// phrases (t('Save changes')) that need no `en` entry — the key IS the English.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sw_student_lang';

export const LANGS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
];

const en = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  'week.Mo': 'Mo', 'week.Tu': 'Tu', 'week.We': 'We', 'week.Th': 'Th', 'week.Fr': 'Fr', 'week.Sa': 'Sa', 'week.Su': 'Su',

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

  // ---- Phrases keyed by their English text (screens call t('English text')).
  // Missing entries simply show the English, so the app never breaks.

  // calendar
  'week.Mo': 'सोम', 'week.Tu': 'मंगल', 'week.We': 'बुध', 'week.Th': 'गुरु', 'week.Fr': 'शुक्र', 'week.Sa': 'शनि', 'week.Su': 'रवि',
  January: 'जनवरी', February: 'फ़रवरी', March: 'मार्च', April: 'अप्रैल', May: 'मई', June: 'जून',
  July: 'जुलाई', August: 'अगस्त', September: 'सितंबर', October: 'अक्टूबर', November: 'नवंबर', December: 'दिसंबर',
  Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार', Thursday: 'गुरुवार', Friday: 'शुक्रवार', Saturday: 'शनिवार', Sunday: 'रविवार',

  // roles
  Admin: 'एडमिन', Principal: 'प्रधानाचार्य', 'Sub Admin': 'सब एडमिन', Coordinator: 'कोऑर्डिनेटर',
  Teacher: 'शिक्षक', Driver: 'ड्राइवर', Student: 'छात्र',

  // home tiles & screen titles
  Home: 'होम',
  Attendance: 'उपस्थिति',
  Fees: 'फीस',
  Homework: 'गृहकार्य',
  'Exam Result': 'परीक्षा परिणाम',
  Exams: 'परीक्षाएँ',
  'Time table': 'समय सारणी',
  Timetable: 'समय सारणी',
  'My timetable': 'मेरी समय सारणी',
  'Notice Board': 'सूचना पट',
  'Report Cards': 'रिपोर्ट कार्ड',
  Message: 'संदेश',
  Holidays: 'छुट्टियाँ',
  Profile: 'प्रोफ़ाइल',
  Classes: 'कक्षाएँ',
  'My Classes': 'मेरी कक्षाएँ',
  Teachers: 'शिक्षक',
  'Mark Attendance': 'उपस्थिति दर्ज करें',
  'Marks Entry': 'अंक प्रविष्टि',
  'Fee Claims': 'फीस दावे',
  'Fee claims': 'फीस दावे',
  'Leave Requests': 'छुट्टी अनुरोध',
  'Leave requests': 'छुट्टी अनुरोध',
  'Leave Request': 'छुट्टी अनुरोध',
  'Leave request': 'छुट्टी अनुरोध',
  Salary: 'वेतन',
  'Staff Users': 'स्टाफ़ उपयोगकर्ता',
  'Staff users': 'स्टाफ़ उपयोगकर्ता',
  'Lesson Plans': 'पाठ योजनाएँ',
  'Lesson plans': 'पाठ योजनाएँ',
  Reception: 'रिसेप्शन',
  Transport: 'परिवहन',
  Payments: 'भुगतान',
  'Bulk SMS': 'बल्क SMS',
  'My Attendance': 'मेरी उपस्थिति',
  'My attendance': 'मेरी उपस्थिति',
  'Question papers': 'प्रश्न पत्र',
  Students: 'छात्र',
  Exam: 'परीक्षा',

  // home screens
  'Good morning': 'सुप्रभात',
  'Good afternoon': 'नमस्कार',
  'Good evening': 'शुभ संध्या',
  'Fees Paid': 'भुगतान की गई फीस',
  'Due Fees': 'बकाया फीस',
  'Total fees': 'कुल फीस',
  'Total Fees': 'कुल फीस',
  'Today Paid': 'आज का भुगतान',
  'Total Students': 'कुल छात्र',
  'Total Teachers': 'कुल शिक्षक',
  'Present Today': 'आज उपस्थित',
  'Designation:': 'पद:',
  'EMP ID:': 'कर्मचारी आईडी:',
  'Today Attendance': 'आज की उपस्थिति',
  'In Time': 'आने का समय',
  'Out Time': 'जाने का समय',
  'Check in': 'चेक इन',
  'Check out': 'चेक आउट',
  'Done for today': 'आज का काम पूरा',
  'Nothing here yet': 'अभी यहाँ कुछ नहीं है',
  'Loading…': 'लोड हो रहा है…',

  // common words & actions
  All: 'सभी',
  Pending: 'बकाया',
  Approved: 'स्वीकृत',
  Rejected: 'अस्वीकृत',
  Overdue: 'अतिदेय',
  Paid: 'भुगतान हुआ',
  'Paid {date}': 'भुगतान {date}',
  Today: 'आज',
  Total: 'कुल',
  Present: 'उपस्थित',
  Absent: 'अनुपस्थित',
  Leave: 'छुट्टी',
  P: 'उ',
  A: 'अ',
  L: 'छु',
  In: 'आगमन',
  Out: 'प्रस्थान',
  Edit: 'संपादित करें',
  '✏️ Edit': '✏️ संपादित करें',
  Delete: 'हटाएँ',
  Review: 'समीक्षा करें',
  '✅ Approve': '✅ स्वीकृत करें',
  '✕ Reject': '✕ अस्वीकार करें',
  'Save changes': 'बदलाव सहेजें',
  Details: 'विवरण',
  Title: 'शीर्षक',
  Body: 'विवरण',
  Remark: 'टिप्पणी',
  Remarks: 'टिप्पणियाँ',
  Reason: 'कारण',
  Notes: 'नोट्स',
  'Note (optional)': 'टिप्पणी (वैकल्पिक)',
  'Description (optional)': 'विवरण (वैकल्पिक)',
  Username: 'उपयोगकर्ता नाम',
  Email: 'ईमेल',
  Phone: 'फ़ोन',
  Address: 'पता',
  'Full name': 'पूरा नाम',
  'Password (min 6 chars)': 'पासवर्ड (कम से कम 6 अक्षर)',
  Role: 'भूमिका',
  Subject: 'विषय',
  Subjects: 'विषय',
  Qualification: 'योग्यता',
  'Joining date': 'नियुक्ति तिथि',
  Class: 'कक्षा',
  Section: 'सेक्शन',
  'Section {name}': 'सेक्शन {name}',
  'Section name': 'सेक्शन का नाम',
  'Class name': 'कक्षा का नाम',
  'Class teacher': 'कक्षा शिक्षक',
  'All classes': 'सभी कक्षाएँ',
  '🏫 All classes': '🏫 सभी कक्षाएँ',
  Roll: 'रोल',
  'Roll No.': 'रोल नं.',
  'Roll no.': 'रोल नं.',
  Month: 'महीना',
  Year: 'वर्ष',
  'Amount (₹)': 'राशि (₹)',
  'by {name}': '{name} द्वारा',
  'Reviewed by {name}': '{name} द्वारा समीक्षा',
  'Due {date}': 'अंतिम तिथि {date}',
  '{n} students': '{n} छात्र',
  '{n} subjects': '{n} विषय',
  '{n} lesson plans': '{n} पाठ योजनाएँ',
  '{n} recipients': '{n} प्राप्तकर्ता',
  '{n} seats': '{n} सीटें',
  '{n} file attached': '{n} फ़ाइल संलग्न',
  '{n} files attached': '{n} फ़ाइलें संलग्न',
  '{n} subject paper': '{n} विषय पत्र',
  '{n} subject papers': '{n} विषय पत्र',
  '{amount} fee': '{amount} फीस',
  '{p} pending · {a} approved': '{p} बकाया · {a} स्वीकृत',
  'From (YYYY-MM-DD)': 'से (YYYY-MM-DD)',
  'To (YYYY-MM-DD)': 'तक (YYYY-MM-DD)',
  'Due date (YYYY-MM-DD)': 'अंतिम तिथि (YYYY-MM-DD)',
  'Start date (YYYY-MM-DD)': 'आरंभ तिथि (YYYY-MM-DD)',
  'End date (YYYY-MM-DD)': 'समाप्ति तिथि (YYYY-MM-DD)',
  'e.g. 15000': 'उदा. 15000',
  'e.g. A': 'उदा. A',
  'e.g. Class 5': 'उदा. कक्षा 5',
  'e.g. Diwali': 'उदा. दिवाली',
  'e.g. GJ01AB1234': 'उदा. GJ01AB1234',
  'e.g. Half Yearly Exam': 'उदा. अर्धवार्षिक परीक्षा',
  'e.g. Mathematics': 'उदा. गणित',
  'e.g. Photosynthesis — The Process': 'उदा. प्रकाश संश्लेषण — प्रक्रिया',
  'e.g. Route 1 — City Centre': 'उदा. रूट 1 — सिटी सेंटर',
  'e.g. Verified against bank statement': 'उदा. बैंक स्टेटमेंट से मिलान किया',

  // attendance
  'Pick a section': 'सेक्शन चुनें',
  'No sections available to you.': 'आपके लिए कोई सेक्शन उपलब्ध नहीं।',
  'No students in this section.': 'इस सेक्शन में कोई छात्र नहीं।',
  'Attendance saved': 'उपस्थिति सहेजी गई',
  'Save attendance': 'उपस्थिति सहेजें',
  "✅ Mark today's attendance": '✅ आज की उपस्थिति दर्ज करें',
  '✔ Check in': '✔ चेक इन',
  '✔ Check out': '✔ चेक आउट',
  '✅ Attendance complete for today': '✅ आज की उपस्थिति पूरी',
  'My history': 'मेरा इतिहास',
  'Staff today': 'आज का स्टाफ़',
  'No attendance records yet.': 'अभी कोई उपस्थिति रिकॉर्ड नहीं।',
  'Nobody has checked in yet today.': 'आज अभी किसी ने चेक इन नहीं किया।',

  // classes & students
  'No classes yet — add your first class.': 'अभी कोई कक्षा नहीं — अपनी पहली कक्षा जोड़ें।',
  'No classes yet.': 'अभी कोई कक्षा नहीं।',
  'No subjects yet.': 'अभी कोई विषय नहीं।',
  '+ Add': '+ जोड़ें',
  '+ Add section': '+ सेक्शन जोड़ें',
  'Add section': 'सेक्शन जोड़ें',
  'Add class': 'कक्षा जोड़ें',
  'Standard fee (₹)': 'मानक फीस (₹)',
  'Save subjects': 'विषय सहेजें',
  'Class name is required': 'कक्षा का नाम आवश्यक है',
  'No classes assigned to you yet.': 'अभी आपको कोई कक्षा नहीं दी गई।',
  'View students ›': 'छात्र देखें ›',
  'No students in this section yet.': 'इस सेक्शन में अभी कोई छात्र नहीं।',
  'Add student': 'छात्र जोड़ें',
  'Name, username and a 6+ char password are required': 'नाम, उपयोगकर्ता नाम और कम से कम 6 अक्षरों का पासवर्ड आवश्यक है',
  '+ Add homework': '+ गृहकार्य जोड़ें',
  'Add homework': 'गृहकार्य जोड़ें',
  'No homework yet.': 'अभी कोई गृहकार्य नहीं।',
  'Homework title is required': 'गृहकार्य का शीर्षक आवश्यक है',
  '+ Add remark': '+ टिप्पणी जोड़ें',
  'Add remark': 'टिप्पणी जोड़ें',
  'No remarks yet.': 'अभी कोई टिप्पणी नहीं।',

  // teachers & staff
  'No teachers yet — add them in Staff Users.': 'अभी कोई शिक्षक नहीं — उन्हें स्टाफ़ उपयोगकर्ता में जोड़ें।',
  'Class assignments': 'कक्षा असाइनमेंट',
  'No class assignments yet.': 'अभी कोई कक्षा असाइनमेंट नहीं।',
  'Tap any period to assign a class, section and subject — e.g. Monday · P2 → Class 2-B.':
    'कक्षा, सेक्शन और विषय देने के लिए किसी भी पीरियड पर टैप करें — उदा. सोमवार · P2 → कक्षा 2-B।',
  'No staff yet.': 'अभी कोई स्टाफ़ नहीं।',
  'Add staff member': 'स्टाफ़ सदस्य जोड़ें',
  'Create account': 'खाता बनाएँ',

  // timetable
  'No timetable set yet.': 'अभी समय सारणी तय नहीं हुई।',
  'Your class timetable is not set yet.': 'आपकी कक्षा की समय सारणी अभी तय नहीं हुई।',
  'Free — tap to assign': 'खाली — असाइन करने के लिए टैप करें',
  'Period {n}': 'पीरियड {n}',
  'Pick a class and section': 'कक्षा और सेक्शन चुनें',
  'Subject (or type your own)': 'विषय (या स्वयं लिखें)',
  'Assign period': 'पीरियड असाइन करें',
  'Clear this period': 'यह पीरियड खाली करें',

  // holidays
  'Holiday · Sun': 'छुट्टी · रवि',
  Event: 'कार्यक्रम',
  'Tap a date to add or edit a holiday.': 'छुट्टी जोड़ने या बदलने के लिए किसी तारीख पर टैप करें।',
  'No holidays or events in {month}.': '{month} में कोई छुट्टी या कार्यक्रम नहीं।',
  'Add holiday': 'छुट्टी जोड़ें',
  'Edit holiday': 'छुट्टी संपादित करें',
  'Delete holiday': 'छुट्टी हटाएँ',
  'Holiday name': 'छुट्टी का नाम',
  'Holiday name is required': 'छुट्टी का नाम आवश्यक है',

  // exams
  Upcoming: 'आगामी',
  Ongoing: 'चालू',
  Completed: 'संपन्न',
  'No exams scheduled yet.': 'अभी कोई परीक्षा निर्धारित नहीं।',
  'Results published': 'परिणाम घोषित',
  'Results not published': 'परिणाम घोषित नहीं',
  'Publish results': 'परिणाम घोषित करें',
  'Unpublish results': 'परिणाम वापस लें',
  'Create exam': 'परीक्षा बनाएँ',
  'Exam name': 'परीक्षा का नाम',
  'Name, start date and end date are required (YYYY-MM-DD)': 'नाम, आरंभ तिथि और समाप्ति तिथि आवश्यक हैं (YYYY-MM-DD)',
  'Classes — tap to manage subject papers': 'कक्षाएँ — विषय पत्र प्रबंधित करने के लिए टैप करें',
  'one question paper per subject': 'हर विषय का एक प्रश्न पत्र',
  'This class has no subjects yet — add them from the Classes screen.': 'इस कक्षा में अभी कोई विषय नहीं — उन्हें कक्षाएँ स्क्रीन से जोड़ें।',
  'Not uploaded yet': 'अभी अपलोड नहीं हुआ',
  'Replace PDF': 'PDF बदलें',
  'Upload PDF': 'PDF अपलोड करें',

  // fees & payments
  Collected: 'वसूल',
  Collection: 'वसूली',
  'Payment claims': 'भुगतान दावे',
  'Parent-submitted payment proofs': 'अभिभावकों द्वारा भेजे गए भुगतान प्रमाण',
  'Fee records': 'फीस रिकॉर्ड',
  'No fee records.': 'कोई फीस रिकॉर्ड नहीं।',
  'Mark paid': 'भुगतान हुआ दर्ज करें',
  'Payment method': 'भुगतान का तरीका',
  'Confirm payment': 'भुगतान की पुष्टि करें',
  'No pending claims.': 'कोई बकाया दावा नहीं।',
  'No approved claims.': 'कोई स्वीकृत दावा नहीं।',
  'No rejected claims.': 'कोई अस्वीकृत दावा नहीं।',
  'No claims.': 'कोई दावा नहीं।',
  'View proof': 'प्रमाण देखें',
  'View proof & review': 'प्रमाण देखें और समीक्षा करें',
  'Review note (optional)': 'समीक्षा टिप्पणी (वैकल्पिक)',
  'Approving marks the fee as paid and records a transaction.': 'स्वीकृत करने पर फीस भुगतान हुई मानी जाएगी और लेन-देन दर्ज होगा।',
  'This month': 'इस महीने',
  Transactions: 'लेन-देन',
  'Success rate': 'सफलता दर',
  History: 'इतिहास',
  'No transactions yet.': 'अभी कोई लेन-देन नहीं।',

  // leaves & salary
  'All requests': 'सभी अनुरोध',
  'My requests': 'मेरे अनुरोध',
  'No leave requests yet.': 'अभी कोई छुट्टी अनुरोध नहीं।',
  'Request leave': 'छुट्टी का अनुरोध करें',
  'Submit request': 'अनुरोध भेजें',
  'From date, to date and reason are required (YYYY-MM-DD)': 'आरंभ तिथि, अंतिम तिथि और कारण आवश्यक हैं (YYYY-MM-DD)',
  'My salary': 'मेरा वेतन',
  'All staff': 'सभी स्टाफ़',
  'No salary statements yet.': 'अभी कोई वेतन विवरण नहीं।',
  'Record salary': 'वेतन दर्ज करें',
  'Staff member': 'स्टाफ़ सदस्य',
  'Save salary record': 'वेतन रिकॉर्ड सहेजें',
  'Pick a staff member and enter the amount': 'स्टाफ़ सदस्य चुनें और राशि दर्ज करें',

  // lesson plans
  'No lesson plans yet.': 'अभी कोई पाठ योजना नहीं।',
  'Add lesson plan': 'पाठ योजना जोड़ें',
  'Topic / Heading': 'विषय / शीर्षक',
  'Objective / remark': 'उद्देश्य / टिप्पणी',
  'Save lesson plan': 'पाठ योजना सहेजें',
  'Heading and class are required': 'शीर्षक और कक्षा आवश्यक हैं',
  'Tip: attach files from the web app.': 'सुझाव: फ़ाइलें वेब ऐप से संलग्न करें।',

  // reception
  New: 'नई',
  Converted: 'प्रवेश हुआ',
  'No enquiries yet.': 'अभी कोई पूछताछ नहीं।',
  'New enquiry': 'नई पूछताछ',
  'Parent name': 'अभिभावक का नाम',
  'Student name': 'छात्र का नाम',
  'Class interested': 'इच्छित कक्षा',
  Contact: 'संपर्क',
  'Add enquiry': 'पूछताछ जोड़ें',
  'Parent, student and contact are required': 'अभिभावक, छात्र और संपर्क आवश्यक हैं',

  // transport
  Vehicles: 'वाहन',
  Active: 'सक्रिय',
  Routes: 'रूट',
  Route: 'रूट',
  'No vehicles yet.': 'अभी कोई वाहन नहीं।',
  'No route set': 'कोई रूट तय नहीं',
  'Edit vehicle': 'वाहन संपादित करें',
  'Add vehicle': 'वाहन जोड़ें',
  'Vehicle number': 'वाहन नंबर',
  'Driver name': 'ड्राइवर का नाम',
  'Driver phone': 'ड्राइवर का फ़ोन',
  Capacity: 'क्षमता',
  Maintenance: 'मरम्मत में',
  'Vehicle no and driver name are required': 'वाहन नंबर और ड्राइवर का नाम आवश्यक हैं',

  // notices & SMS
  'No notices yet.': 'अभी कोई सूचना नहीं।',
  'Post notice': 'सूचना पोस्ट करें',
  'Title and body are required': 'शीर्षक और विवरण आवश्यक हैं',
  'No SMS sent yet.': 'अभी कोई SMS नहीं भेजा गया।',
  'Send bulk SMS': 'बल्क SMS भेजें',
  Recipients: 'प्राप्तकर्ता',
  'All Parents': 'सभी अभिभावक',
  'All Teachers': 'सभी शिक्षक',
  'All Staff': 'सभी स्टाफ़',
  'Send SMS': 'SMS भेजें',
  'Message is required': 'संदेश आवश्यक है',

  // more statuses for badges
  'status.approved': 'स्वीकृत',
  'status.rejected': 'अस्वीकृत',
  'status.overdue': 'अतिदेय',
  'status.new': 'नई',
  'status.follow_up': 'फ़ॉलो-अप',
  'status.converted': 'प्रवेश हुआ',
  'status.closed': 'बंद',
  'status.active': 'सक्रिय',
  'status.maintenance': 'मरम्मत में',
  'status.sent': 'भेजा गया',
  'status.failed': 'विफल',
  'status.success': 'सफल',
  'status.cancelled': 'रद्द',
  'status.class_teacher': 'कक्षा शिक्षक',
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

// Status badge text: localized if known, otherwise the raw status
// ("follow_up" -> "follow up") instead of leaking the "status.x" key.
export function statusLabel(status: string): string {
  const key = `status.${status}`;
  const s = t(key);
  return s === key ? status.replace(/_/g, ' ') : s;
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
