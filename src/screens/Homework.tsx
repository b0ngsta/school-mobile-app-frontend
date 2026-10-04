import React from 'react';
import { Text } from 'react-native';
import { Badge, Card, Empty, ErrorBox, Loading, Screen, fmtDate } from '../components/ui';
import { useApi, useI18n } from '../hooks';
import { colors } from '../theme';
import type { HomeworkItem } from '../types';

export default function Homework() {
  const { t } = useI18n();
  const { data, error, loading, refreshing, refresh } = useApi<HomeworkItem[]>('/student/homework');
  if (loading) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ErrorBox message={error} />
      {!data?.length && <Empty text={t('hw.empty')} />}
      {data?.map(h => (
        <Card key={h.id}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 6 }}>{h.title}</Text>
          {h.note ? <Text style={{ color: colors.subtle, fontSize: 13, marginBottom: 8 }}>{h.note}</Text> : null}
          <Text style={{ color: colors.subtle, fontSize: 12, marginBottom: 8 }}>
            {t('hw.due', { date: fmtDate(h.due_date), name: h.assigned_by })}
          </Text>
          <Badge status={h.status} />
        </Card>
      ))}
    </Screen>
  );
}
