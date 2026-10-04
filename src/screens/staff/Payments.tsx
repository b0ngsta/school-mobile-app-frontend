// Payment transactions (managers).
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '../../api';
import {
  Badge,
  Card,
  Empty,
  ErrorBox,
  IconStat,
  Loading,
  Screen,
  SectionTitle,
  fmtDate,
  inr,
} from '../../components/ui';
import { colors } from '../../theme';
import type { Transaction, TransactionStats } from '../../types';
import { t } from '../../i18n';

export default function Payments() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [items, setItems] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setStats(await api('/transactions/stats'));
      setItems(await api('/transactions'));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!items && !error) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={() => load(true)}>
      <ErrorBox message={error} />
      <View style={styles.statRow}>
        <IconStat icon="📅" label={t('Today')} value={stats ? inr(stats.today_collection) : '—'} tint={colors.ok} soft={colors.okSoft} />
        <IconStat icon="🗓️" label={t('This month')} value={stats ? inr(stats.month_collection) : '—'} tint={colors.brand} soft={colors.brandSoft} />
      </View>
      <View style={styles.statRow}>
        <IconStat icon="🧾" label={t('Transactions')} value={stats?.total_transactions} tint={colors.info} soft={colors.infoSoft} />
        <IconStat icon="📈" label={t('Success rate')} value={stats ? `${stats.success_rate}%` : '—'} tint={colors.warn} soft={colors.warnSoft} />
      </View>

      <SectionTitle>{t('History')}</SectionTitle>
      {items?.length === 0 && <Empty icon="💳" text={t('No transactions yet.')} />}
      {items?.map(x => (
        <Card key={x.id}>
          <View style={styles.head}>
            <Text style={styles.ref}>{x.reference}</Text>
            <Badge status={x.status} />
          </View>
          <Text style={styles.sub}>
            {x.student_name || '—'}{x.fee_title ? ` · ${x.fee_title}` : ''}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.amount}>{inr(x.amount)}</Text>
            <Text style={styles.sub}>{String(x.method).toUpperCase()} · {fmtDate(x.created_at)}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ref: { fontSize: 13.5, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.ink },
});
