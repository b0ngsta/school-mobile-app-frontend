// Fees overview for managers: stats, pending claims banner, fee records
// with filter + mark-paid.
import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, peek } from '../../api';
import {
  Badge,
  Button,
  Card,
  CardSkeleton,
  Chip,
  ChipsSkeleton,
  Empty,
  ErrorBox,
  IconStat,
  ListScreen,
  ListSkeleton,
  ScreenSkeleton,
  SectionTitle,
  SectionTitleSkeleton,
  Segments,
  Sheet,
  StatTilesSkeleton,
  fmtDate,
  inr,
} from '../../components/ui';
import { colors } from '../../theme';
import type { AdminFee, ClaimStats, FeeStats, ScreenProps } from '../../types';
import { t } from '../../i18n';

const METHODS = ['cash', 'card', 'upi', 'netbanking', 'wallet'];

export default function FeesAdmin({ navigate }: ScreenProps) {
  const [stats, setStats] = useState<FeeStats | null>(() => peek<FeeStats>('/fees/stats'));
  const [claimStats, setClaimStats] = useState<ClaimStats | null>(() => peek<ClaimStats>('/fees/claims/stats'));
  const [items, setItems] = useState<AdminFee[] | null>(() => peek<AdminFee[]>('/fees'));
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState<AdminFee | null>(null);
  const [method, setMethod] = useState('cash');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      const [s, list] = await Promise.all([
        api<FeeStats>('/fees/stats'),
        api<AdminFee[]>('/fees' + (filter ? `?status_filter=${filter}` : '')),
      ]);
      setStats(s);
      setItems(list);
      api('/fees/claims/stats').then(setClaimStats).catch(() => {});
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [filter]);
  useEffect(() => {
    load();
  }, [load]);

  const openPay = useCallback((f: AdminFee) => {
    setPaying(f);
    setMethod('cash');
  }, []);

  const pay = async () => {
    if (!paying) return;
    setBusy(true);
    try {
      await api(`/fees/${paying.id}/pay`, { method: 'PUT', body: { method } });
      setPaying(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!items && !error) {
    return (
      <ScreenSkeleton>
        <StatTilesSkeleton count={2} />
        <StatTilesSkeleton count={2} />
        <CardSkeleton icon lines={1} />
        <SectionTitleSkeleton />
        <ChipsSkeleton count={4} />
        <ListSkeleton badge="right" lines={1} action count={3} />
      </ScreenSkeleton>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ListScreen
        data={items}
        keyExtractor={f => f.id}
        renderItem={f => <FeeRow fee={f} onPay={openPay} />}
        empty={<Empty icon="💰" text={t('No fee records.')} />}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        header={
          <>
        <ErrorBox message={error} />

        <View style={styles.statRow}>
          <IconStat icon="💰" label={t('Collected')} value={stats ? inr(stats.collected) : '—'} tint={colors.ok} soft={colors.okSoft} />
          <IconStat icon="⏳" label={t('Pending')} value={stats ? inr(stats.pending) : '—'} tint={colors.warn} soft={colors.warnSoft} />
        </View>
        <View style={styles.statRow}>
          <IconStat icon="⚠️" label={t('Overdue')} value={stats ? inr(stats.overdue) : '—'} tint={colors.danger} soft={colors.dangerSoft} />
          <IconStat icon="📈" label={t('Collection')} value={stats ? `${stats.collection_rate}%` : '—'} tint={colors.brand} soft={colors.brandSoft} />
        </View>

        {/* claims banner */}
        <TouchableOpacity activeOpacity={0.75} onPress={() => navigate('FeeClaims')}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandSoft, borderColor: colors.brandSoft }}>
            <Text style={{ fontSize: 22, marginRight: 12 }}>🧾</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.brand, fontSize: 14 }}>{t('Payment claims')}</Text>
              <Text style={{ color: colors.subtle, fontSize: 12, marginTop: 1 }}>
                {claimStats ? t('{p} pending · {a} approved', { p: claimStats.pending, a: claimStats.approved }) : t('Parent-submitted payment proofs')}
              </Text>
            </View>
            <Text style={{ color: colors.brand, fontSize: 22 }}>›</Text>
          </Card>
        </TouchableOpacity>

        <SectionTitle>{t('Fee records')}</SectionTitle>
        <Segments
          items={[
            { value: '', label: t('All') },
            { value: 'pending', label: t('Pending') },
            { value: 'overdue', label: t('Overdue') },
            { value: 'paid', label: t('Paid') },
          ]}
          value={filter}
          onChange={setFilter}
        />
          </>
        }
      />

      <Sheet visible={!!paying} title={paying ? `${t('Mark paid')} — ${paying.student_name}` : ''} onClose={() => setPaying(null)}>
        {paying && (
          <>
            <Text style={{ color: colors.ink, fontWeight: '800', fontSize: 18, marginBottom: 10 }}>
              {inr(paying.amount)} · {paying.title}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 }}>{t('Payment method')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {METHODS.map(m => (
                <Chip key={m} label={m.toUpperCase()} active={method === m} onPress={() => setMethod(m)} />
              ))}
            </View>
            <Button label={t('Confirm payment')} onPress={pay} busy={busy} />
          </>
        )}
      </Sheet>
    </View>
  );
}

/** One fee record card; memoised so the list doesn't redraw when the sheet changes. */
const FeeRow = memo(function FeeRow({ fee: f, onPay }: { fee: AdminFee; onPay: (f: AdminFee) => void }) {
  return (
    <Card>
      <View style={styles.head}>
        <Text style={styles.student}>{f.student_name}</Text>
        <Badge status={f.effective_status} />
      </View>
      <Text style={styles.sub}>
        {f.title} · {f.class_name || '—'}{f.section_name ? ` / ${f.section_name}` : ''}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.amount}>{inr(f.amount)}</Text>
        {f.status !== 'paid' ? (
          <Button label={t('Mark paid')} kind="soft" small onPress={() => onPay(f)} />
        ) : (
          <Text style={{ color: colors.subtle, fontSize: 12 }}>{t('Paid {date}', { date: fmtDate(f.paid_date) })}</Text>
        )}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  student: { fontSize: 14.5, fontWeight: '800', color: colors.ink, flex: 1, paddingRight: 8 },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.ink },
});
