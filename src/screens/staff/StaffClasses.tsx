// Classes & sections (managers). Tap a section → students.
// Managers can add classes (with SUBJECTS), add sections, edit subjects.
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../api';
import {
  Button,
  Card,
  Chip,
  Empty,
  ErrorBox,
  Fab,
  Input,
  Loading,
  Screen,
  Sheet,
  inr,
} from '../../components/ui';
import { MANAGER_ROLES } from '../../roles';
import { colors } from '../../theme';
import type { AdminClass, ScreenProps } from '../../types';

function SubjectEditor({ subjects, setSubjects }: { subjects: string[]; setSubjects: (s: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const name = draft.trim();
    if (!name) return;
    if (!subjects.some(s => s.toLowerCase() === name.toLowerCase())) setSubjects([...subjects, name]);
    setDraft('');
  };
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Input placeholder="e.g. Mathematics" value={draft} onChangeText={setDraft} onSubmitEditing={add} />
        </View>
        <Button label="+ Add" kind="soft" small onPress={add} style={{ marginLeft: 8, marginTop: 2 }} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {subjects.map(s => (
          <Chip key={s} label={`${s} ✕`} active onPress={() => setSubjects(subjects.filter(x => x !== s))} />
        ))}
      </View>
    </View>
  );
}

export default function StaffClasses({ navigate, session }: ScreenProps) {
  const isManager = MANAGER_ROLES.includes(session.user_type);
  const [classes, setClasses] = useState<AdminClass[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [fee, setFee] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [sectionFor, setSectionFor] = useState<AdminClass | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [subjectsFor, setSubjectsFor] = useState<AdminClass | null>(null);
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setClasses(await api('/classes'));
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

  const addClass = async () => {
    if (!name.trim()) return setError('Class name is required');
    setBusy(true);
    try {
      await api('/classes', {
        method: 'POST',
        body: { name: name.trim(), fee_amount: fee ? Number(fee) : null, subjects },
      });
      setAdding(false);
      setName(''); setFee(''); setSubjects([]);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const addSection = async () => {
    if (!sectionFor || !sectionName.trim()) return;
    setBusy(true);
    try {
      await api(`/classes/${sectionFor.id}/sections`, { method: 'POST', body: { name: sectionName.trim() } });
      setSectionFor(null);
      setSectionName('');
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveSubjects = async () => {
    if (!subjectsFor) return;
    setBusy(true);
    try {
      await api(`/classes/${subjectsFor.id}/subjects`, { method: 'PUT', body: { subjects: editSubjects } });
      setSubjectsFor(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!classes && !error) return <Loading />;

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={refreshing} onRefresh={() => load(true)}>
        <ErrorBox message={error} />
        {classes?.length === 0 && <Empty icon="🏫" text="No classes yet — add your first class." />}
        {classes?.map(c => (
          <Card key={c.id}>
            <View style={styles.head}>
              <Text style={styles.name}>{c.name}</Text>
              {c.fee_amount != null && (
                <View style={[styles.feePill, { backgroundColor: colors.okSoft }]}>
                  <Text style={{ color: colors.ok, fontSize: 12, fontWeight: '700' }}>{inr(c.fee_amount)} fee</Text>
                </View>
              )}
            </View>

            {/* subjects */}
            <View style={styles.subjRow}>
              {(c.subjects || []).map(s => (
                <View key={s} style={[styles.subj, { backgroundColor: colors.brandSoft }]}>
                  <Text style={{ color: colors.brand, fontSize: 12, fontWeight: '600' }}>{s}</Text>
                </View>
              ))}
              {(c.subjects || []).length === 0 && (
                <Text style={{ color: colors.subtle, fontSize: 12 }}>No subjects yet.</Text>
              )}
              {isManager && (
                <TouchableOpacity onPress={() => { setSubjectsFor(c); setEditSubjects(c.subjects || []) }}>
                  <Text style={{ color: colors.brand, fontSize: 12, fontWeight: '700', padding: 4 }}>✏️ Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* sections */}
            {c.sections.map(s => (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.65}
                onPress={() =>
                  navigate('SectionStudents', {
                    classId: c.id,
                    sectionId: s.id,
                    className: c.name,
                    sectionName: s.name,
                    title: `${c.name} — ${s.name}`,
                  })
                }>
                <View style={styles.section}>
                  <Text style={{ fontWeight: '700', color: colors.ink, fontSize: 13.5 }}>Section {s.name}</Text>
                  <Text style={{ color: colors.subtle, fontSize: 12 }}>
                    🧑‍🎓 {s.student_count}{s.class_teacher ? ` · ${s.class_teacher}` : ''}  ›
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {isManager && (
              <Button label="+ Add section" kind="soft" small onPress={() => setSectionFor(c)} style={{ marginTop: 8 }} />
            )}
          </Card>
        ))}
      </Screen>
      {isManager && <Fab onPress={() => setAdding(true)} />}

      <Sheet visible={adding} title="Add class" onClose={() => setAdding(false)}>
        <Input label="Class name" placeholder="e.g. Class 5" value={name} onChangeText={setName} />
        <Input label="Standard fee (₹)" placeholder="e.g. 15000" keyboardType="numeric" value={fee} onChangeText={setFee} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 }}>Subjects</Text>
        <SubjectEditor subjects={subjects} setSubjects={setSubjects} />
        <Button label="Add class" onPress={addClass} busy={busy} />
      </Sheet>

      <Sheet visible={!!sectionFor} title={`Add section — ${sectionFor?.name}`} onClose={() => setSectionFor(null)}>
        <Input label="Section name" placeholder="e.g. A" value={sectionName} onChangeText={setSectionName} />
        <Button label="Add section" onPress={addSection} busy={busy} />
      </Sheet>

      <Sheet visible={!!subjectsFor} title={`Subjects — ${subjectsFor?.name}`} onClose={() => setSubjectsFor(null)}>
        <SubjectEditor subjects={editSubjects} setSubjects={setEditSubjects} />
        <Button label="Save subjects" onPress={saveSubjects} busy={busy} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '800', color: colors.ink },
  feePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  subjRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  subj: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
