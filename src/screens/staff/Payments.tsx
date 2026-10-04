// Payment transactions (managers).
import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api, peek } from '../../api';
import {
  Badge,
  Card,
  Empty,
  ErrorBox,
  IconStat,
  ListSkeleton,
  ListScreen,
  ScreenSkeleton,
  SectionTitle,
  SectionTitleSkeleton,
  StatTilesSkeleton,
  fmtDate,
  inr,
} from '../../components/ui';
import { colors } from '../../theme';
import type { Transaction, TransactionStats } from '../../types';
import { t } from '../../i18n';

export default function Payments() {
  const [stats, setStats] = useState<TransactionStats | null>(() => peek<TransactionStats>('/transactions/stats'));
  const [items, setItems] = useState<Transaction[] | null>(() => peek<Transaction[]>('/transactions'));
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      const [s, list] = await Promise.all([api('/transactions/stats'), api('/transactions')]);
      setStats(s);
      setItems(list);
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

  if (!items && !error) {
    return (
      <ScreenSkeleton>
        <StatTilesSkeleton count={2} />
        <StatTilesSkeleton count={2} />
        <SectionTitleSkeleton />
        <ListSkeleton badge="right" lines={2} count={3} />
      </ScreenSkeleton>
    );
  }

  return (
    <ListScreen
      data={items}
      keyExtractor={x => x.id}
      renderItem={x => <TxRow tx={x} />}
      empty={<Empty icon="💳" text={t('No transactions yet.')} />}
      refreshing={refreshing}
      onRefresh={() => load(true)}
      header={
        <>
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
        </>
      }
    />
  );
}

/** One transaction card. */
const TxRow = memo(function TxRow({ tx: x }: { tx: Transaction }) {
  return (
    <Card>
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
  );
});

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ref: { fontSize: 13.5, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.ink },
});
