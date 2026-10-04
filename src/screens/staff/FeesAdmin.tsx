// Fees overview for managers: stats, pending claims banner, fee records
// with filter + mark-paid.
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../api';
import {
  Badge,
  Button,
  Card,
  Chip,
  Empty,
  ErrorBox,
  IconStat,
  Loading,
  Screen,
  SectionTitle,
  Segments,
  Sheet,
  fmtDate,
  inr,
} from '../../components/ui';
import { colors } from '../../theme';
import type { AdminFee, ClaimStats, FeeStats, ScreenProps } from '../../types';

const METHODS = ['cash', 'card', 'upi', 'netbanking', 'wallet'];

export default function FeesAdmin({ navigate }: ScreenProps) {
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [claimStats, setClaimStats] = useState<ClaimStats | null>(null);
  const [items, setItems] = useState<AdminFee[] | null>(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState<AdminFee | null>(null);
  const [method, setMethod] = useState('cash');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setStats(await api('/fees/stats'));
      setItems(await api('/fees' + (filter ? `?status_filter=${filter}` : '')));
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

  if (!items && !error) return <Loading />;

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={refreshing} onRefresh={() => load(true)}>
        <ErrorBox message={error} />

        <View style={styles.statRow}>
          <IconStat icon="💰" label="Collected" value={stats ? inr(stats.collected) : '—'} tint={colors.ok} soft={colors.okSoft} />
          <IconStat icon="⏳" label="Pending" value={stats ? inr(stats.pending) : '—'} tint={colors.warn} soft={colors.warnSoft} />
        </View>
        <View style={styles.statRow}>
          <IconStat icon="⚠️" label="Overdue" value={stats ? inr(stats.overdue) : '—'} tint={colors.danger} soft={colors.dangerSoft} />
          <IconStat icon="📈" label="Collection" value={stats ? `${stats.collection_rate}%` : '—'} tint={colors.brand} soft={colors.brandSoft} />
        </View>

        {/* claims banner */}
        <TouchableOpacity activeOpacity={0.75} onPress={() => navigate('FeeClaims')}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandSoft, borderColor: colors.brandSoft }}>
            <Text style={{ fontSize: 22, marginRight: 12 }}>🧾</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.brand, fontSize: 14 }}>Payment claims</Text>
              <Text style={{ color: colors.subtle, fontSize: 12, marginTop: 1 }}>
                {claimStats ? `${claimStats.pending} pending · ${claimStats.approved} approved` : 'Parent-submitted payment proofs'}
              </Text>
            </View>
            <Text style={{ color: colors.brand, fontSize: 22 }}>›</Text>
          </Card>
        </TouchableOpacity>

        <SectionTitle>Fee records</SectionTitle>
        <Segments
          items={[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'paid', label: 'Paid' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        {items?.length === 0 && <Empty icon="💰" text="No fee records." />}
        {items?.map(f => (
          <Card key={f.id}>
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
                <Button label="Mark paid" kind="soft" small onPress={() => { setPaying(f); setMethod('cash') }} />
              ) : (
                <Text style={{ color: colors.subtle, fontSize: 12 }}>Paid {fmtDate(f.paid_date)}</Text>
              )}
            </View>
          </Card>
        ))}
      </Screen>

      <Sheet visible={!!paying} title={paying ? `Mark paid — ${paying.student_name}` : ''} onClose={() => setPaying(null)}>
        {paying && (
          <>
            <Text style={{ color: colors.ink, fontWeight: '800', fontSize: 18, marginBottom: 10 }}>
              {inr(paying.amount)} · {paying.title}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 }}>Payment method</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {METHODS.map(m => (
                <Chip key={m} label={m.toUpperCase()} active={method === m} onPress={() => setMethod(m)} />
              ))}
            </View>
            <Button label="Confirm payment" onPress={pay} busy={busy} />
          </>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  student: { fontSize: 14.5, fontWeight: '800', color: colors.ink, flex: 1, paddingRight: 8 },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.ink },
});
