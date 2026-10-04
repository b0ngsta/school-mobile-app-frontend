// Design tokens with ROLE-BASED THEMES — "Option A" redesign.
//  student → violet · teacher → green · admin/principal/coordinator → blue
//  driver → amber
// `applyRoleTheme(role)` mutates the exported `colors` object, so read
// brand colors INLINE at render time (not inside StyleSheet.create).
import type { TextStyle, ViewStyle } from 'react-native';
import type { Role } from './types';

const BASE = {
  ink: '#171A26',
  subtle: '#7A8095',
  faint: '#A6ABBD',
  line: '#ECEDF3',
  page: '#F5F6FA',
  white: '#ffffff',
  ok: '#16A34A',
  okSoft: '#E8F7EE',
  warn: '#D97706',
  warnSoft: '#FCF2E3',
  info: '#0284C7',
  infoSoft: '#E5F3FB',
  danger: '#DC2640',
  dangerSoft: '#FDEBEE',
};

export interface RoleTheme {
  brand: string;
  brandDark: string;
  brandDeep: string;
  brandSoft: string;
  brandFaint: string;
  onBrandSub: string;
}

export const ROLE_THEMES: Record<Role | 'default', RoleTheme> = {
  student: { brand: '#5B3FD6', brandDark: '#4A30B8', brandDeep: '#3A2494', brandSoft: '#EEEAFB', brandFaint: '#F6F4FD', onBrandSub: '#CFC6F3' },
  teacher: { brand: '#0F9D58', brandDark: '#0C7F47', brandDeep: '#0A6238', brandSoft: '#E6F6EE', brandFaint: '#F3FBF6', onBrandSub: '#BBE7CF' },
  admin: { brand: '#2563EB', brandDark: '#1D4FC7', brandDeep: '#1A3FA0', brandSoft: '#E9EFFD', brandFaint: '#F4F7FE', onBrandSub: '#C2D4F9' },
  principal: { brand: '#1D4ED8', brandDark: '#1A40B4', brandDeep: '#173390', brandSoft: '#E9EFFD', brandFaint: '#F4F7FE', onBrandSub: '#C2D4F9' },
  sub_admin: { brand: '#2563EB', brandDark: '#1D4FC7', brandDeep: '#1A3FA0', brandSoft: '#E9EFFD', brandFaint: '#F4F7FE', onBrandSub: '#C2D4F9' },
  coordinator: { brand: '#0E7490', brandDark: '#0B5D74', brandDeep: '#094A5D', brandSoft: '#E4F3F7', brandFaint: '#F2F9FB', onBrandSub: '#B6DEE9' },
  driver: { brand: '#D97706', brandDark: '#B36205', brandDeep: '#8F4E04', brandSoft: '#FCF2E3', brandFaint: '#FDF8EF', onBrandSub: '#F4D6A8' },
  default: { brand: '#4F46E5', brandDark: '#4238C4', brandDeep: '#352CA0', brandSoft: '#ECEBFC', brandFaint: '#F5F5FE', onBrandSub: '#C9C6F5' },
};

export type ThemeColors = typeof BASE & RoleTheme;

// mutable palette — brand keys are swapped by applyRoleTheme()
export const colors: ThemeColors = { ...BASE, ...ROLE_THEMES.default };

export function applyRoleTheme(role?: Role | null): void {
  const themed = (role && ROLE_THEMES[role]) || ROLE_THEMES.default;
  colors.brand = themed.brand;
  colors.brandDark = themed.brandDark;
  colors.brandDeep = themed.brandDeep;
  colors.brandSoft = themed.brandSoft;
  colors.brandFaint = themed.brandFaint;
  colors.onBrandSub = themed.onBrandSub;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  principal: 'Principal',
  sub_admin: 'Sub Admin',
  coordinator: 'Coordinator',
  teacher: 'Teacher',
  driver: 'Driver',
  student: 'Student',
};

export const radius = { card: 18, pill: 999, input: 14 } as const;

export const shadow: Record<'card' | 'pop', ViewStyle> = {
  card: {
    shadowColor: '#3A4160',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pop: {
    shadowColor: '#3A4160',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },
};

export interface Accent {
  fg: string;
  bg: string;
}

// Accent palette used to tint tile/list icons (cycled by index).
export const ACCENTS: Accent[] = [
  { fg: '#5B3FD6', bg: '#EEEAFB' },
  { fg: '#0F766E', bg: '#E3F4F2' },
  { fg: '#C2410C', bg: '#FBEDE4' },
  { fg: '#1D4ED8', bg: '#E9EFFD' },
  { fg: '#BE185D', bg: '#FBE9F1' },
  { fg: '#B45309', bg: '#FCF2E3' },
  { fg: '#15803D', bg: '#E8F7EE' },
  { fg: '#0E7490', bg: '#E4F3F7' },
];

export const accent = (i: number): Accent => ACCENTS[i % ACCENTS.length];

export interface BadgeColor {
  fg: TextStyle['color'];
  bg: ViewStyle['backgroundColor'];
}

// map API statuses -> badge colors (extend as features grow)
export const statusColor: Record<string, BadgeColor> = {
  pending: { fg: colors.warn, bg: colors.warnSoft },
  submitted: { fg: colors.ok, bg: colors.okSoft },
  late: { fg: colors.danger, bg: colors.dangerSoft },
  paid: { fg: colors.ok, bg: colors.okSoft },
  present: { fg: colors.ok, bg: colors.okSoft },
  absent: { fg: colors.danger, bg: colors.dangerSoft },
  leave: { fg: colors.warn, bg: colors.warnSoft },
  on_leave: { fg: colors.warn, bg: colors.warnSoft },
  upcoming: { fg: colors.info, bg: colors.infoSoft },
  ongoing: { fg: colors.warn, bg: colors.warnSoft },
  completed: { fg: colors.ok, bg: colors.okSoft },
  overdue: { fg: colors.danger, bg: colors.dangerSoft },
  approved: { fg: colors.ok, bg: colors.okSoft },
  rejected: { fg: colors.danger, bg: colors.dangerSoft },
  active: { fg: colors.ok, bg: colors.okSoft },
  maintenance: { fg: colors.warn, bg: colors.warnSoft },
  success: { fg: colors.ok, bg: colors.okSoft },
  failed: { fg: colors.danger, bg: colors.dangerSoft },
  new: { fg: colors.info, bg: colors.infoSoft },
  follow_up: { fg: colors.warn, bg: colors.warnSoft },
  converted: { fg: colors.ok, bg: colors.okSoft },
  closed: { fg: colors.subtle, bg: colors.page },
  default: { fg: colors.subtle, bg: colors.page },
};

export const badge = (s?: string): BadgeColor => (s && statusColor[s]) || statusColor.default;
