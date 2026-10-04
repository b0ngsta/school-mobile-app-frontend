// Teachers directory (admin/principal/coordinator) — profile cards; tap →
// teacher profile with Details + Timetable tabs.
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, photoUrl } from '../../api';
import { Avatar, Card, Empty, ErrorBox, Loading, Screen } from '../../components/ui';
import { colors } from '../../theme';
import type { ScreenProps, StaffUser } from '../../types';
import { t } from '../../i18n';

export default function Teachers({ navigate, params }: ScreenProps) {
  const [items, setItems] = useState<StaffUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setItems(await api('/users/teachers'));
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
      {items?.length === 0 && <Empty icon="🧑‍🏫" text={t('No teachers yet — add them in Staff Users.')} />}
      {items?.map(tc => (
        <TouchableOpacity
          key={tc.id}
          activeOpacity={0.7}
          onPress={() =>
            navigate('TeacherProfile', { teacher: tc, title: tc.full_name, hint: params?.hint })
          }>
          <Card style={styles.row}>
            <Avatar name={tc.full_name} uri={photoUrl(tc.photo_path)} size={48} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{tc.full_name}</Text>
              <Text style={styles.sub}>
                {tc.subject ? `📘 ${tc.subject}` : t('Teacher')}
                {tc.phone ? ` · 📞 ${tc.phone}` : ''}
              </Text>
              <Text style={styles.sub}>📚 {t('{n} lesson plans', { n: tc.lesson_plan_count })}</Text>
            </View>
            <Text style={{ color: colors.subtle, fontSize: 22 }}>›</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 2 },
});
