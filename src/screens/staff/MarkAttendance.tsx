// Attendance marking — pick a section (teachers: from assignments; managers:
// from all classes), then one-tap Present/Absent/Leave per student. Styled
// like the attendance mockup (summary tiles + toggles).
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '../../api';
import {
  Button,
  Card,
  Chip,
  Empty,
  ErrorBox,
  Loading,
  Screen,
  SectionTitle,
} from '../../components/ui';
import { MANAGER_ROLES } from '../../roles';
import { colors } from '../../theme';
import type { AdminClass, Assignment, MarkAttendanceRow, ScreenProps, SectionPick } from '../../types';
import { t } from '../../i18n';

const today = () => new Date().toISOString().slice(0, 10);

export default function MarkAttendance({ params, session }: ScreenProps) {
  const isManager = MANAGER_ROLES.includes(session.user_type);
  const [sections, setSections] = useState<SectionPick[] | null>(null);
  const [sel, setSel] = useState<SectionPick | null>(
    params?.sectionId
      ? { classId: params.classId, sectionId: params.sectionId, label: `${params.className} — ${params.sectionName}` }
      : null,
  );
  const [rows, setRows] = useState<MarkAttendanceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // load pickable sections
  useEffect(() => {
    (async () => {
      try {
        if (isManager) {
          const classes = await api<AdminClass[]>('/classes');
          const out: SectionPick[] = [];
          classes.forEach(c =>
            c.sections.forEach(s =>
              out.push({ classId: c.id, sectionId: s.id, label: `${c.name} — ${s.name}` }),
            ),
          );
          setSections(out);
        } else {
          const mine = await api<Assignment[]>('/assignments/mine');
          const seen = new Set<number>();
          const out: SectionPick[] = [];
          mine.forEach(a => {
            if (!seen.has(a.section_id)) {
              seen.add(a.section_id);
              out.push({ classId: a.class_id, sectionId: a.section_id, label: `${a.class_name} — ${a.section_name}` });
            }
          });
          setSections(out);
        }
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [isManager]);

  const load = useCallback(async (r = false) => {
    if (!sel) return;
    r && setRefreshing(true);
    try {
      const data = await api<MarkAttendanceRow[]>(`/attendance?section_id=${sel.sectionId}&day=${today()}`);
      setRows(data.map(x => ({ ...x, status: x.status || 'present' })));
      setError(null);
      setSavedAt(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [sel]);
  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const setStatus = (id: number, status: string) =>
    setRows(rs => (rs ? rs.map(r => (r.student_id === id ? { ...r, status } : r)) : rs));

  const save = async () => {
    if (!sel || !rows) return;
    setSaving(true);
    try {
      await api('/attendance', {
        method: 'POST',
        body: {
          section_id: sel.sectionId,
          date: today(),
          records: rows.map(r => ({ student_id: r.student_id, status: r.status })),
        },
      });
      setSavedAt(new Date());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!sections && !error) return <Loading />;

  const counts = rows
    ? {
        present: rows.filter(r => r.status === 'present').length,
        absent: rows.filter(r => r.status === 'absent').length,
        leave: rows.filter(r => r.status === 'leave').length,
      }
    : null;

  return (
    <Screen refreshing={refreshing} onRefresh={() => load(true)}>
      <ErrorBox message={error} />

      <SectionTitle>{t('Pick a section')} · {today()}</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {sections?.map(s => (
          <Chip key={s.sectionId} label={s.label} active={sel?.sectionId === s.sectionId} onPress={() => setSel(s)} />
        ))}
        {sections?.length === 0 && <Empty icon="🏫" text={t('No sections available to you.')} />}
      </View>

      {sel && rows && (
        <>
          <View style={styles.summaryRow}>
            <Card style={[styles.sumCard, { backgroundColor: colors.brandSoft, borderColor: colors.brandSoft }]}>
              <Text style={[styles.sumNum, { color: colors.brand }]}>{rows.length}</Text>
              <Text style={styles.sumLbl}>{t('Total')}</Text>
            </Card>
            <Card style={[styles.sumCard, { backgroundColor: colors.okSoft, borderColor: colors.okSoft }]}>
              <Text style={[styles.sumNum, { color: colors.ok }]}>{counts?.present}</Text>
              <Text style={styles.sumLbl}>{t('Present')}</Text>
            </Card>
            <Card style={[styles.sumCard, { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }]}>
              <Text style={[styles.sumNum, { color: colors.danger }]}>{counts?.absent}</Text>
              <Text style={styles.sumLbl}>{t('Absent')}</Text>
            </Card>
            <Card style={[styles.sumCard, { backgroundColor: colors.warnSoft, borderColor: colors.warnSoft }]}>
              <Text style={[styles.sumNum, { color: colors.warn }]}>{counts?.leave}</Text>
              <Text style={styles.sumLbl}>{t('Leave')}</Text>
            </Card>
          </View>

          {rows.length === 0 && <Empty icon="🧑‍🎓" text={t('No students in this section.')} />}
          {rows.map(r => (
            <Card key={r.student_id} style={{ paddingVertical: 10 }}>
              <View style={styles.rowHead}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.name}>{r.full_name}</Text>
                  <Text style={styles.roll}>{t('Roll No.')} {r.roll_no || '—'}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Chip label={t('P')} tone="ok" active={r.status === 'present'} onPress={() => setStatus(r.student_id, 'present')} />
                  <Chip label={t('A')} tone="danger" active={r.status === 'absent'} onPress={() => setStatus(r.student_id, 'absent')} />
                  <Chip label={t('L')} active={r.status === 'leave'} onPress={() => setStatus(r.student_id, 'leave')} />
                </View>
              </View>
            </Card>
          ))}

          {rows.length > 0 && (
            <>
              {savedAt && (
                <Text style={{ color: colors.ok, fontWeight: '700', textAlign: 'center', marginBottom: 6 }}>
                  ✅ {t('Attendance saved')}
                </Text>
              )}
              <Button label={t('Save attendance')} onPress={save} busy={saving} />
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', marginHorizontal: -3, marginBottom: 10 },
  sumCard: { flex: 1, marginHorizontal: 3, alignItems: 'center', paddingVertical: 10, marginBottom: 0 },
  sumNum: { fontSize: 18, fontWeight: '800' },
  sumLbl: { fontSize: 11, color: colors.subtle, marginTop: 2 },
  rowHead: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: colors.ink },
  roll: { fontSize: 11.5, color: colors.subtle, marginTop: 1 },
});
