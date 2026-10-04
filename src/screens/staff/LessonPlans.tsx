// Lesson plans — teachers see + create their own; managers browse all.
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api, peek } from '../../api';
import {
  Button,
  Card,
  Chip,
  Empty,
  ErrorBox,
  Fab,
  Input,
  ListSkeleton,
  Screen,
  ScreenSkeleton,
  Sheet,
  fmtDate,
} from '../../components/ui';
import { colors } from '../../theme';
import type { Assignment, LessonPlan, ScreenProps } from '../../types';
import { t } from '../../i18n';

interface LessonPlanForm {
  heading: string;
  assignment: Assignment | null;
  duration_start: string;
  duration_end: string;
  final_remark: string;
}

export default function LessonPlans({ session }: ScreenProps) {
  const isTeacher = session.user_type === 'teacher';
  const [items, setItems] = useState<LessonPlan[] | null>(() => peek<LessonPlan[]>('/lessons'));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<LessonPlanForm>({ heading: '', assignment: null, duration_start: '', duration_end: '', final_remark: '' });

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setItems(await api('/lessons'));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    load();
    if (isTeacher) api('/assignments/mine').then(setAssignments).catch(() => {});
  }, [load, isTeacher]);

  const create = async () => {
    if (!form.heading.trim() || !form.assignment) return setError(t('Heading and class are required'));
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('heading', form.heading.trim());
      fd.append('class_id', String(form.assignment.class_id));
      fd.append('section_id', String(form.assignment.section_id));
      if (form.duration_start) fd.append('duration_start', form.duration_start);
      if (form.duration_end) fd.append('duration_end', form.duration_end);
      if (form.final_remark) fd.append('final_remark', form.final_remark);
      await api('/lessons', { method: 'POST', formData: fd });
      setCreating(false);
      setForm({ heading: '', assignment: null, duration_start: '', duration_end: '', final_remark: '' });
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
        <ListSkeleton lines={3} />
      </ScreenSkeleton>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={refreshing} onRefresh={() => load(true)}>
        <ErrorBox message={error} />
        {items?.length === 0 && <Empty icon="📚" text={t('No lesson plans yet.')} />}
        {items?.map(p => (
          <Card key={p.id}>
            <Text style={styles.heading}>{p.heading}</Text>
            <Text style={styles.sub}>
              {p.class_name}{p.section_name ? ` — ${p.section_name}` : ''}
              {!isTeacher ? ` · ${p.teacher_name}` : ''}
            </Text>
            {(p.duration_start || p.duration_end) && (
              <Text style={styles.sub}>🗓️ {fmtDate(p.duration_start)} – {fmtDate(p.duration_end)}</Text>
            )}
            {p.final_remark ? <Text style={[styles.sub, { marginTop: 4 }]}>{p.final_remark}</Text> : null}
            {p.files?.length ? (
              <Text style={[styles.sub, { marginTop: 4, color: colors.brand, fontWeight: '700' }]}>
                📎 {p.files.length > 1 ? t('{n} files attached', { n: p.files.length }) : t('{n} file attached', { n: p.files.length })}
              </Text>
            ) : null}
          </Card>
        ))}
      </Screen>
      {isTeacher && <Fab onPress={() => setCreating(true)} />}

      <Sheet visible={creating} title={t('Add lesson plan')} onClose={() => setCreating(false)}>
        <Input label={t('Topic / Heading')} placeholder={t('e.g. Photosynthesis — The Process')} value={form.heading} onChangeText={v => setForm({ ...form, heading: v })} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 }}>{t('Class')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {assignments.map(a => (
            <Chip
              key={a.id}
              label={`${a.class_name} — ${a.section_name}`}
              active={form.assignment?.id === a.id}
              onPress={() => setForm({ ...form, assignment: a })}
            />
          ))}
        </View>
        <Input label={t('From (YYYY-MM-DD)')} placeholder="2026-07-14" value={form.duration_start} onChangeText={v => setForm({ ...form, duration_start: v })} />
        <Input label={t('To (YYYY-MM-DD)')} placeholder="2026-07-18" value={form.duration_end} onChangeText={v => setForm({ ...form, duration_end: v })} />
        <Input label={t('Objective / remark')} multiline style={{ minHeight: 70, textAlignVertical: 'top' }} value={form.final_remark} onChangeText={v => setForm({ ...form, final_remark: v })} />
        <Button label={t('Save lesson plan')} onPress={create} busy={busy} />
        <Text style={{ color: colors.subtle, fontSize: 11.5, marginTop: 8, textAlign: 'center' }}>
          {t('Tip: attach files from the web app.')}
        </Text>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 15, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 3 },
});
