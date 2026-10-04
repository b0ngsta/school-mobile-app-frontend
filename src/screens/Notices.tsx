import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card, Empty, ErrorBox, ListSkeleton, Screen, ScreenSkeleton, fmtDate } from '../components/ui';
import { useApi, useI18n } from '../hooks';
import { colors } from '../theme';
import type { Notice } from '../types';

export default function Notices() {
  const { t } = useI18n();
  const { data, error, loading, refreshing, refresh } = useApi<Notice[]>('/student/notices');
  if (loading) {
    return (
      <ScreenSkeleton>
        <ListSkeleton lines={3} />
      </ScreenSkeleton>
    );
  }

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ErrorBox message={error} />
      {!data?.length && <Empty text={t('notice.empty')} />}
      {data?.map(n => (
        <Card key={n.id}>
          <Text style={styles.title}>{n.title}</Text>
          <Text style={styles.meta}>
            {n.posted_by} · {fmtDate(n.created_at)}
          </Text>
          <Text style={styles.body}>{n.body}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 12, color: colors.subtle, marginTop: 2, marginBottom: 8 },
  body: { fontSize: 13, color: colors.ink, lineHeight: 19 },
});
