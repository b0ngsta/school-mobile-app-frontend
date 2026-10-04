// Reusable design-system pieces — "Option A" redesign.
// NOTE: role themes mutate `colors.brand*` at login — always read brand
// colors inline in JSX, never freeze them inside StyleSheet.create.
import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { statusLabel, t } from '../i18n';
import { accent, Accent, badge, colors, radius, shadow } from '../theme';
import type { NavigateFn, RouteParams } from '../types';

/* ------------------------------------------------------------------ */
/* Icons — screens may still pass legacy emoji; we map them to vector  */
/* icons here so every screen upgrades without edits.                  */
/* ------------------------------------------------------------------ */
const EMOJI_ICON: Record<string, string> = {
  '📅': 'calendar-check',
  '🗓️': 'calendar-star',
  '₹': 'currency-inr',
  '💰': 'cash-multiple',
  '💵': 'cash',
  '💳': 'credit-card-outline',
  '🧾': 'receipt',
  '📚': 'book-open-variant',
  '📖': 'book-open-variant',
  '🎓': 'school',
  '🕐': 'clock-outline',
  '📢': 'bullhorn-outline',
  '📊': 'chart-box-outline',
  '💬': 'message-text-outline',
  '📝': 'note-edit-outline',
  '👤': 'account-circle-outline',
  '👥': 'account-group-outline',
  '🏫': 'office-building-outline',
  '🧑‍🏫': 'human-male-board',
  '✅': 'check-circle-outline',
  '🧳': 'briefcase-outline',
  '🛎️': 'bell-ring-outline',
  '🚌': 'bus',
  '🗂️': 'folder-open-outline',
  '🏖️': 'beach',
  '📤': 'upload-outline',
  '🖼️': 'image-outline',
  '🔁': 'refresh',
  '📁': 'folder-open-outline',
  '🔔': 'bell-outline',
  '🏠': 'home-outline',
  '⚙️': 'cog-outline',
  '📞': 'phone-outline',
  '✉️': 'email-outline',
};

const iconName = (icon?: string): string | null => {
  if (!icon) return null;
  if (EMOJI_ICON[icon]) return EMOJI_ICON[icon];
  if (/^[a-z0-9-]+$/.test(icon)) return icon; // already an MCI name
  return null;
};

interface IconProps {
  icon?: string;
  size?: number;
  color?: string;
}

/** Vector icon with emoji fallback. */
export function Icon({ icon, size = 20, color }: IconProps) {
  const name = iconName(icon);
  if (name) return <MCIcon name={name} size={size} color={color || colors.brand} />;
  return <Text style={{ fontSize: size * 0.85 }}>{icon}</Text>;
}

/* ------------------------------------------------------------------ */

interface ScreenViewProps {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
}

export function Screen({ children, refreshing, onRefresh, padded = true }: ScreenViewProps) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.page }}
      contentContainerStyle={padded ? styles.pad : null}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} colors={[colors.brand]} tintColor={colors.brand} />
        ) : undefined
      }>
      {children}
    </ScrollView>
  );
}

interface CardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, style }: CardProps) => <View style={[styles.card, style]}>{children}</View>;

/** Brand hero header block (rounded card on the brand color). */
export function Hero({ children, style }: CardProps) {
  return (
    <View style={[styles.hero, { backgroundColor: colors.brand }, style]}>
      <View style={[styles.heroBubble, { top: -34, right: -26, width: 140, height: 140 }]} />
      <View style={[styles.heroBubble, { bottom: -46, left: -34, width: 110, height: 110 }]} />
      {children}
    </View>
  );
}

export function Badge({ status, label }: { status?: string; label?: string }) {
  const c = badge(status);
  const text = label ? t(label) : status ? statusLabel(status) : '';
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{String(text).replace(/_/g, ' ')}</Text>
    </View>
  );
}

interface StatProps {
  label: string;
  value?: string | number | null;
  tint?: string;
  soft?: string;
}

export function StatCard({ label, value, tint = colors.brand, soft = colors.brandSoft }: StatProps) {
  return (
    <Card style={styles.stat}>
      <View style={[styles.statDot, { backgroundColor: soft }]}>
        <View style={[styles.statDotInner, { backgroundColor: tint }]} />
      </View>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

/** Icon stat tile (icon bubble + big number). */
export function IconStat({ icon, label, value, tint = colors.brand, soft = colors.brandSoft }: StatProps & { icon?: string }) {
  return (
    <Card style={styles.iconStat}>
      <View style={[styles.iconBubble, { backgroundColor: soft }]}>
        <Icon icon={icon} size={19} color={tint} />
      </View>
      <Text style={[styles.iconStatValue, { color: tint }]}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

interface RowProps {
  left: ReactNode;
  right?: ReactNode;
  sub?: ReactNode;
  onPress?: () => void;
}

export function Row({ left, right, sub, onPress }: RowProps) {
  const inner = (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={styles.rowTitle}>{left}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.65}>{inner}</TouchableOpacity>;
  }
  return inner;
}

interface ListItemProps {
  icon?: string;
  label: string;
  desc?: string | null;
  onPress?: () => void;
  right?: ReactNode;
  tint?: Accent;
}

/** Tappable list card: icon bubble + title + description + chevron. */
export function ListItem({ icon, label, desc, onPress, right, tint }: ListItemProps) {
  const a = tint || { fg: colors.brand, bg: colors.brandSoft };
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <Card style={styles.listItem}>
        {icon ? (
          <View style={[styles.iconBubble, { backgroundColor: a.bg, marginBottom: 0, marginRight: 12 }]}>
            <Icon icon={icon} size={19} color={a.fg} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.listLabel}>{label}</Text>
          {desc ? <Text style={styles.listDesc}>{desc}</Text> : null}
        </View>
        {right || (onPress ? <MCIcon name="chevron-right" size={22} color={colors.faint} /> : null)}
      </Card>
    </TouchableOpacity>
  );
}

type ButtonKind = 'primary' | 'soft' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  kind?: ButtonKind;
  busy?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, kind = 'primary', busy, disabled, small, style }: ButtonProps) {
  const off = disabled || busy;
  const base: StyleProp<ViewStyle>[] = [styles.btn, small && styles.btnSmall, style];
  if (kind === 'primary') base.push({ backgroundColor: off ? colors.faint : colors.brand });
  if (kind === 'soft') base.push({ backgroundColor: colors.brandSoft });
  if (kind === 'ghost') base.push({ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line });
  if (kind === 'danger') base.push({ backgroundColor: colors.dangerSoft });
  const fg =
    kind === 'primary' ? '#fff' : kind === 'danger' ? colors.danger : kind === 'soft' ? colors.brand : colors.ink;
  return (
    <TouchableOpacity style={base} onPress={onPress} disabled={off} activeOpacity={0.75}>
      {busy ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <Text style={[styles.btnText, small && { fontSize: 13 }, { color: fg }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Input({ label, style, ...props }: TextInputProps & { label?: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput style={[styles.input, style]} placeholderTextColor={colors.faint} {...props} />
    </View>
  );
}

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: 'danger' | 'ok';
}

/** Horizontal selectable chip. */
export function Chip({ label, active, onPress, tone }: ChipProps) {
  const activeBg = tone === 'danger' ? colors.danger : tone === 'ok' ? colors.ok : colors.brand;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        active
          ? { backgroundColor: activeBg, borderColor: activeBg, ...shadow.card }
          : { backgroundColor: colors.white, borderColor: colors.line },
      ]}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : colors.subtle }}>{label}</Text>
    </TouchableOpacity>
  );
}

export interface SegmentItem<V extends string = string> {
  value: V;
  label: string;
}

/** Row of chips used as segmented tabs. */
export function Segments<V extends string>({ items, value, onChange }: { items: SegmentItem<V>[]; value: V; onChange: (v: V) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
      {items.map(it => (
        <Chip key={it.value} label={it.label} active={value === it.value} onPress={() => onChange(it.value)} />
      ))}
    </View>
  );
}

interface SheetProps {
  visible?: boolean;
  title?: string;
  onClose: () => void;
  children?: ReactNode;
}

/** Bottom-sheet style modal. */
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  return (
    <Modal visible={!!visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.sheetGrab} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.sheetClose}>
              <MCIcon name="close" size={18} color={colors.subtle} />
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 520 }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/** Floating action button. */
export function Fab({ onPress, icon = 'plus' }: { onPress?: () => void; icon?: string }) {
  const name = iconName(icon);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.fab, { backgroundColor: colors.brand }, shadow.pop]}>
      {name ? (
        <MCIcon name={name} size={26} color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontSize: 26, lineHeight: 30, fontWeight: '600' }}>{icon}</Text>
      )}
    </TouchableOpacity>
  );
}

interface TileProps {
  icon?: string;
  label: string;
  onPress?: () => void;
  tint?: Accent;
}

/** Raised home-grid tile (3-column launcher). */
export function Tile({ icon, label, onPress, tint }: TileProps) {
  const a = tint || { fg: colors.brand, bg: colors.brandSoft };
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.72} style={styles.tileWrap}>
      <View style={[styles.tile, shadow.card]}>
        <View style={[styles.tileIcon, { backgroundColor: a.bg }]}>
          <Icon icon={icon} size={23} color={a.fg} />
        </View>
        <Text style={styles.tileLabel} numberOfLines={1}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export interface GridItem {
  icon: string;
  label: string;
  route: string;
  params?: RouteParams;
}

/** 3-column grid of Tiles. */
export function TileGrid({ items, navigate }: { items: GridItem[]; navigate: NavigateFn }) {
  return (
    <View style={styles.tileGrid}>
      {items.map((it, i) => (
        <Tile
          key={it.label}
          icon={it.icon}
          label={t(it.label)}
          tint={accent(i)}
          onPress={() => navigate(it.route as Parameters<NavigateFn>[0], it.params)}
        />
      ))}
    </View>
  );
}

interface MiniStatProps {
  label: string;
  value?: string | number | null;
  tint?: string;
  accent?: string;
}

/** Small money/stat tile used on home headers (Total Fees, Due Fees…). */
export function MiniStat({ label, value, tint = colors.ink, accent: accentColor }: MiniStatProps) {
  return (
    <View style={styles.miniStat}>
      {accentColor ? <View style={[styles.miniStatDot, { backgroundColor: accentColor }]} /> : null}
      <Text style={[styles.miniStatValue, { color: tint }]} numberOfLines={1}>{value ?? '—'}</Text>
      <Text style={styles.miniStatLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

/** Latest-notice pill (replaces the old "UPDATES!" bar). */
export function UpdatesBar({ text, onPress }: { text?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} disabled={!onPress}>
      <View style={[styles.updates, { backgroundColor: colors.brandSoft }]}>
        <View style={[styles.updatesIcon, { backgroundColor: colors.white }]}>
          <MCIcon name="bullhorn-outline" size={15} color={colors.brand} />
        </View>
        <Text style={[styles.updatesText, { color: colors.brandDeep }]} numberOfLines={1}>
          {text || t('dash.noNotices')}
        </Text>
        <MCIcon name="chevron-right" size={18} color={colors.brand} />
      </View>
    </TouchableOpacity>
  );
}

export function Empty({ text, icon = 'folder-open-outline' }: { text?: string; icon?: string }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
      <View style={[styles.iconBubble, { backgroundColor: colors.page, width: 46, height: 46, borderRadius: 15 }]}>
        <Icon icon={icon} size={23} color={colors.faint} />
      </View>
      <Text style={{ color: colors.subtle, marginTop: 4 }}>{text ?? t('Nothing here yet')}</Text>
    </Card>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.page }}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );
}

export function ErrorBox({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.error}>
      <MCIcon name="alert-circle-outline" size={16} color={colors.danger} style={{ marginRight: 8 }} />
      <Text style={{ color: colors.danger, fontSize: 13, flex: 1 }}>{message}</Text>
    </View>
  );
}

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.brandSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: colors.brand, fontWeight: '700', fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

export const fmtDate = (d?: string | Date | null): string => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  const months = t('months');
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
};

export const inr = (n?: number | null): string => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 90 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
    ...shadow.card,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroBubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  stat: { flex: 1, marginHorizontal: 4 },
  statDot: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statDotInner: { width: 12, height: 12, borderRadius: 6 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.ink },
  statLabel: { fontSize: 12, color: colors.subtle, marginTop: 2 },
  iconStat: { flex: 1, marginHorizontal: 4, alignItems: 'flex-start' },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconStatValue: { fontSize: 21, fontWeight: '800' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowTitle: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  rowSub: { color: colors.subtle, fontSize: 12, marginTop: 2 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  listLabel: { fontSize: 15, fontWeight: '700', color: colors.ink },
  listDesc: { fontSize: 12, color: colors.subtle, marginTop: 2 },
  btn: {
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12, marginTop: 0 },
  btnText: { fontWeight: '700', fontSize: 15 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(23,26,38,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
    paddingBottom: 26,
  },
  sheetGrab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 12,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: colors.ink, flex: 1, paddingRight: 8 },
  sheetClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  tileWrap: { width: '33.333%', padding: 5 },
  tile: {
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  tileLabel: { fontSize: 11.5, fontWeight: '700', color: colors.ink },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  miniStat: {
    flex: 1,
    backgroundColor: colors.page,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 11,
    marginHorizontal: 3,
  },
  miniStatDot: { width: 18, height: 3, borderRadius: 2, marginBottom: 5 },
  miniStatValue: { fontSize: 15, fontWeight: '800' },
  miniStatLabel: { fontSize: 10.5, color: colors.subtle, marginTop: 1 },
  updates: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 8,
    paddingRight: 10,
    marginBottom: 14,
  },
  updatesIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  updatesText: { fontSize: 12.5, fontWeight: '600', flex: 1 },
});
