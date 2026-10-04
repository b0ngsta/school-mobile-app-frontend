// API base URL.
//  - Android emulator:            http://10.0.2.2:8000  (maps to host machine's localhost)
//  - Real device, same Wi-Fi:     http://<your-laptop-LAN-IP>:8000  e.g. http://192.168.1.5:8000
//  - Deployed server:             http://<server-ip-or-domain>:8000
// export const API_URL = 'http://10.0.2.2:8000';
export const API_URL = 'https://school-app-docker-v1.onrender.com';

// School branding shown in the app header.
export const SCHOOL_NAME = 'EduManage School';
export const SCHOOL_CITY = '';

// Academic session label, e.g. "2026-2027" (April–March).
export function sessionLabel(d: Date = new Date()): string {
  const y = d.getFullYear();
  return d.getMonth() + 1 >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}
