// Staff exams list. Tap an exam → classes → subject-wise papers.
// Managers can create exams (for one class or ALL classes).
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, peek } from '../../api';
import {
  Badge,
  Button,
  Card,
  Chip,
  Empty,
  ErrorBox,
  Fab,
  IconStat,
  Input,
  ListSkeleton,
  Screen,
  ScreenSkeleton,
  Sheet,
  StatTilesSkeleton,
  fmtDate,
} from '../../components/ui';
import { MANAGER_ROLES } from '../../roles';
import { colors } from '../../theme';
import type { AdminClass, AdminExam, ExamStats, ScreenProps } from '../../types';
import { t } from '../../i18n';

export default function StaffExams({ navigate, session }: ScreenProps) {
  const isManager = MANAGER_ROLES.includes(session.user_type);
  const [stats, setStats] = useState<ExamStats | null>(() => peek<ExamStats>('/exams/stats'));
  const [items, setItems] = useState<AdminExam[] | null>(() => peek<AdminExam[]>('/exams'));
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ name: string; class_id: number | 'all'; start_date: string; end_date: string }>({ name: '', class_id: 'all', start_date: '', end_date: '' });

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      const [s, list] = await Promise.all([api('/exams/stats'), api('/exams')]);
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
    api('/classes').then(setClasses).catch(() => {});
  }, [load]);

  const create = async () => {
    if (!form.name.trim() || !form.start_date || !form.end_date) {
      return setError(t('Name, start date and end date are required (YYYY-MM-DD)'));
    }
    setBusy(true);
    try {
      await api('/exams', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          class_id: form.class_id === 'all' ? null : Number(form.class_id),
          start_date: form.start_date,
          end_date: form.end_date,
        },
      });
      setCreating(false);
      setForm({ name: '', class_id: 'all', start_date: '', end_date: '' });
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
        <StatTilesSkeleton count={3} />
        <ListSkeleton badge="right" lines={2} count={3} />
      </ScreenSkeleton>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={refreshing} onRefresh={() => load(true)}>
        <ErrorBox message={error} />

        <View style={styles.statRow}>
          <IconStat icon="🗓️" label={t('Upcoming')} value={stats?.upcoming} tint={colors.info} soft={colors.infoSoft} />
          <IconStat icon="✍️" label={t('Ongoing')} value={stats?.ongoing} tint={colors.warn} soft={colors.warnSoft} />
          <IconStat icon="✅" label={t('Completed')} value={stats?.completed} tint={colors.ok} soft={colors.okSoft} />
        </View>

        {items?.length === 0 && <Empty icon="📝" text={t('No exams scheduled yet.')} />}
        {items?.map(x => (
          <TouchableOpacity
            key={x.id}
            activeOpacity={0.7}
            onPress={() => navigate('StaffExamDetail', { examId: x.id, title: x.name })}>
            <Card>
              <View style={styles.head}>
                <Text style={styles.name}>{x.name}</Text>
                <Badge status={x.status} />
              </View>
              <Text style={styles.sub}>
                🏫 {x.class_name || t('All classes')} · {fmtDate(x.start_date)} – {fmtDate(x.end_date)}
              </Text>
              <View style={styles.footer}>
                <Text style={{ color: colors.brand, fontSize: 12.5, fontWeight: '700' }}>
                  📄 {x.paper_count === 1 ? t('{n} subject paper', { n: 1 }) : t('{n} subject papers', { n: x.paper_count || 0 })} ›
                </Text>
                {!!x.results_published && (
                  <Text style={{ color: colors.ok, fontSize: 12, fontWeight: '700' }}>{t('Results published')}</Text>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </Screen>
      {isManager && <Fab onPress={() => setCreating(true)} />}

      <Sheet visible={creating} title={t('Create exam')} onClose={() => setCreating(false)}>
        <Input label={t('Exam name')} placeholder={t('e.g. Half Yearly Exam')} value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 }}>{t('Class')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
          <Chip label={t('🏫 All classes')} active={form.class_id === 'all'} onPress={() => setForm({ ...form, class_id: 'all' })} />
          {classes.map(c => (
            <Chip key={c.id} label={c.name} active={form.class_id === c.id} onPress={() => setForm({ ...form, class_id: c.id })} />
          ))}
        </View>
        <Input label={t('Start date (YYYY-MM-DD)')} placeholder="2026-08-01" value={form.start_date} onChangeText={v => setForm({ ...form, start_date: v })} />
        <Input label={t('End date (YYYY-MM-DD)')} placeholder="2026-08-10" value={form.end_date} onChangeText={v => setForm({ ...form, end_date: v })} />
        <Button label={t('Create exam')} onPress={create} busy={busy} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: '800', color: colors.ink, flex: 1, paddingRight: 8 },
  sub: { fontSize: 12.5, color: colors.subtle, marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
});
