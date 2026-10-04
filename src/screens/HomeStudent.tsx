// Student/parent home — hero greeting header, floating stat card,
// notice pill and a colorful 3-column launcher grid. Grid-only navigation.
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api, photoUrl } from '../api';
import {
  Avatar,
  ErrorBox,
  Loading,
  Screen,
  TileGrid,
  UpdatesBar,
  inr,
} from '../components/ui';
import type { GridItem } from '../components/ui';
import { useI18n } from '../hooks';
import { colors, shadow } from '../theme';
import type { FeesResponse, ScreenProps, StudentDashboard } from '../types';

const GRID: GridItem[] = [
  { icon: 'calendar-check', label: 'Attendance', route: 'Attendance' },
  { icon: 'currency-inr', label: 'Fees', route: 'Fees' },
  { icon: 'book-open-variant', label: 'Homework', route: 'Homework' },
  { icon: 'school', label: 'Exam Result', route: 'Exams' },
  { icon: 'clock-outline', label: 'Time table', route: 'StudentTimetable' },
  { icon: 'bullhorn-outline', label: 'Notice Board', route: 'Notices' },
  { icon: 'chart-box-outline', label: 'Report Cards', route: 'ReportCards' },
  { icon: 'message-text-outline', label: 'Message', route: 'Remarks' },
  { icon: 'calendar-star', label: 'Holidays', route: 'Holidays' },
  { icon: 'account-circle-outline', label: 'Profile', route: 'Profile' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeStudent({ navigate }: ScreenProps) {
  const { t } = useI18n();
  const [dash, setDash] = useState<StudentDashboard | null>(null);
  const [fees, setFees] = useState<FeesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (r = false) => {
    r ? setRefreshing(true) : setLoading(true);
    try {
      setDash(await api<StudentDashboard>('/student/dashboard'));
      api<FeesResponse>('/student/fees').then(setFees).catch(() => {});
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading />;

  const p = dash?.profile;
  const paid = fees ? fees.totals.paid : null;
  const due = fees ? fees.totals.pending : null;
  const total = fees ? fees.totals.paid + fees.totals.pending : null;
  const latest = dash?.latest_notices?.[0];

  return (
    <Screen refreshing={refreshing} onRefresh={() => load(true)} padded={false}>
      <View style={{ padding: 16, paddingBottom: 90 }}>
        <ErrorBox message={error} />

        {/* hero greeting header */}
        <View style={[styles.hero, { backgroundColor: colors.brand }]}>
          <View style={[styles.heroBubble, { top: -36, right: -24, width: 140, height: 140 }]} />
          <View style={[styles.heroBubble, { bottom: -50, left: -30, width: 110, height: 110 }]} />
          <View style={styles.heroRow}>
            <Avatar name={p?.full_name} uri={photoUrl(p?.photo_path)} size={52} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.heroHello, { color: colors.onBrandSub }]}>{greeting()}</Text>
              <Text style={styles.heroName} numberOfLines={1}>{p?.full_name}</Text>
              <Text style={[styles.heroSub, { color: colors.onBrandSub }]} numberOfLines={1}>
                {p?.class_name ? `${p.class_name} · ${p.section_name || ''}` : t('dash.noClass')}
                {p?.roll_no ? `  ·  Roll ${p.roll_no}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* floating stat card */}
        <View style={[styles.statsCard, shadow.card]}>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: colors.info }]}>
              {dash?.attendance?.percent != null ? `${dash.attendance.percent}%` : '—'}
            </Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={[styles.statCell, styles.statCellMid]}>
            <Text style={[styles.statValue, { color: colors.ok }]}>{paid != null ? inr(paid) : '—'}</Text>
            <Text style={styles.statLabel}>Fees Paid</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: due ? colors.danger : colors.ink }]}>
              {due != null ? inr(due) : '—'}
            </Text>
            <Text style={styles.statLabel}>Due Fees</Text>
          </View>
        </View>
        <Text style={styles.totalLine}>
          Total fees {total != null ? inr(total) : '—'}
        </Text>

        <UpdatesBar
          text={latest ? latest.title : undefined}
          onPress={() => navigate('Notices')}
        />

        <TileGrid items={GRID} navigate={navigate} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 24,
    padding: 18,
    paddingBottom: 44,
    overflow: 'hidden',
  },
  heroBubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroHello: { fontSize: 12, fontWeight: '600' },
  heroName: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 1 },
  heroSub: { fontSize: 11.5, marginTop: 2, fontWeight: '600' },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: -28,
    marginHorizontal: 10,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statCellMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.line },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10.5, color: colors.subtle, marginTop: 3 },
  totalLine: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.subtle,
    marginTop: 8,
    marginBottom: 12,
  },
});
