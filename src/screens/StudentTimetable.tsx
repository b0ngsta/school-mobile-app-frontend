// Student view: their section's weekly timetable with teacher names.
import React, { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { api } from '../api';
import { TimetableView } from '../components/Timetable';
import { Empty, ErrorBox, Loading, Screen } from '../components/ui';
import { colors } from '../theme';
import type { TimetableSlot } from '../types';
import { t } from '../i18n';

export default function StudentTimetable() {
  const [slots, setSlots] = useState<TimetableSlot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setSlots(await api<TimetableSlot[]>('/student/timetable'));
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

  if (!slots && !error) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={() => load(true)}>
      <ErrorBox message={error} />
      {slots?.length === 0 ? (
        <Empty icon="🕐" text={t('Your class timetable is not set yet.')} />
      ) : (
        <TimetableView
          slots={slots}
          renderExtra={s => (
            <Text style={{ fontSize: 11.5, color: colors.subtle, marginTop: 1 }}>
              🧑‍🏫 {s.teacher_name}
            </Text>
          )}
        />
      )}
    </Screen>
  );
}
