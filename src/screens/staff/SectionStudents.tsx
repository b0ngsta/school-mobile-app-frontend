// Students of a section. Tap → student detail. Managers/class teacher can
// add students and jump straight into attendance marking.
import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, peek, photoUrl } from '../../api';
import {
  Avatar,
  Bone,
  Button,
  Card,
  Empty,
  ErrorBox,
  Fab,
  HeroSkeleton,
  Input,
  ListScreen,
  ListSkeleton,
  ScreenSkeleton,
  Sheet,
} from '../../components/ui';
import { MANAGER_ROLES } from '../../roles';
import { colors } from '../../theme';
import type { NavigateFn, ScreenProps, StudentListItem } from '../../types';
import { t } from '../../i18n';

export default function SectionStudents({ navigate, params, session }: ScreenProps) {
  const { classId, sectionId, className, sectionName, canEdit } = params || {};
  const mayEdit = MANAGER_ROLES.includes(session.user_type) || canEdit;
  const [items, setItems] = useState<StudentListItem[] | null>(() => peek<StudentListItem[]>(`/students?class_id=${classId}&section_id=${sectionId}`));
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ full_name: '', username: '', password: '', roll_no: '' });

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setItems(await api(`/students?class_id=${classId}&section_id=${sectionId}`));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [classId, sectionId]);
  useEffect(() => {
    load();
  }, [load]);

  const addStudent = async () => {
    if (!form.full_name.trim() || !form.username.trim() || form.password.length < 6) {
      return setError(t('Name, username and a 6+ char password are required'));
    }
    setBusy(true);
    try {
      await api('/students', {
        method: 'POST',
        body: {
          full_name: form.full_name.trim(),
          username: form.username.trim(),
          password: form.password,
          roll_no: form.roll_no || null,
          class_id: classId,
          section_id: sectionId,
        },
      });
      setAdding(false);
      setForm({ full_name: '', username: '', password: '', roll_no: '' });
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
        <HeroSkeleton />
        <Bone height={44} radius={14} style={{ marginBottom: 12 }} />
        <ListSkeleton avatar={42} lines={1} count={6} />
      </ScreenSkeleton>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ListScreen
        data={items}
        keyExtractor={s => s.id}
        renderItem={s => <StudentRow student={s} navigate={navigate} />}
        empty={<Empty icon="🧑‍🎓" text={t('No students in this section yet.')} />}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        header={
          <>
        <ErrorBox message={error} />

        <View style={[styles.hero, { backgroundColor: colors.brand }]}>
          <Text style={styles.heroTitle}>{className} — {t('Section {name}', { name: sectionName })}</Text>
          <Text style={styles.heroSub}>{t('{n} students', { n: items?.length ?? 0 })}</Text>
        </View>

        <Button
          label={t("✅ Mark today's attendance")}
          kind="soft"
          onPress={() =>
            navigate('MarkAttendance', { classId, sectionId, className, sectionName })
          }
          style={{ marginBottom: 12 }}
        />
          </>
        }
      />
      {mayEdit && <Fab onPress={() => setAdding(true)} />}

      <Sheet visible={adding} title={t('Add student')} onClose={() => setAdding(false)}>
        <Input label={t('Full name')} value={form.full_name} onChangeText={v => setForm({ ...form, full_name: v })} />
        <Input label={t('Username')} autoCapitalize="none" value={form.username} onChangeText={v => setForm({ ...form, username: v })} />
        <Input label={t('Password (min 6 chars)')} secureTextEntry value={form.password} onChangeText={v => setForm({ ...form, password: v })} />
        <Input label={t('Roll no.')} keyboardType="numeric" value={form.roll_no} onChangeText={v => setForm({ ...form, roll_no: v })} />
        <Button label={t('Add student')} onPress={addStudent} busy={busy} />
      </Sheet>
    </View>
  );
}

/** One student card; memoised so typing in the "Add student" sheet doesn't redraw the list. */
const StudentRow = memo(function StudentRow({ student: s, navigate }: { student: StudentListItem; navigate: NavigateFn }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigate('StudentDetail', { studentId: s.id, title: s.full_name })}>
      <Card style={styles.row}>
        <Avatar name={s.full_name} uri={photoUrl(s.photo_path)} size={42} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{s.full_name}</Text>
          <Text style={styles.sub}>{t('Roll No.')} {s.roll_no || '—'}</Text>
        </View>
        <Text style={{ color: colors.subtle, fontSize: 22 }}>›</Text>
      </Card>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  hero: { borderRadius: 18, padding: 16, marginBottom: 12 },
  heroTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 14.5, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 2 },
});
