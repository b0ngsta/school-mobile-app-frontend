// Salary statements — staff view their own; managers can also record
// monthly salaries for any staff member.
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '../../api';
import {
  Badge,
  Button,
  Card,
  Chip,
  Empty,
  ErrorBox,
  Fab,
  Input,
  Loading,
  Screen,
  Segments,
  Sheet,
  inr,
} from '../../components/ui';
import { MANAGER_ROLES } from '../../roles';
import { ROLE_LABELS, colors } from '../../theme';
import type { SalaryRecord, ScreenProps, StaffUser } from '../../types';

interface SalaryForm {
  userId: number | null;
  month: number;
  year: string;
  amount: string;
  note: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Salary({ session }: ScreenProps) {
  const isManager = MANAGER_ROLES.includes(session.user_type);
  const [tab, setTab] = useState('mine');
  const [items, setItems] = useState<SalaryRecord[] | null>(null);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const now = new Date();
  const [form, setForm] = useState<SalaryForm>({
    userId: null,
    month: now.getMonth() + 1,
    year: String(now.getFullYear()),
    amount: '',
    note: '',
  });

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setItems(await api(tab === 'mine' ? '/salaries/mine' : '/salaries'));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [tab]);
  useEffect(() => {
    setItems(null);
    load();
    if (isManager) api('/users').then(setStaffList).catch(() => {});
  }, [load, isManager]);

  const save = async () => {
    if (!form.userId || !form.amount) return setError('Pick a staff member and enter the amount');
    setBusy(true);
    try {
      await api('/salaries', {
        method: 'POST',
        body: {
          user_id: form.userId,
          month: form.month,
          year: Number(form.year),
          amount: Number(form.amount),
          note: form.note.trim() || null,
        },
      });
      setAdding(false);
      setError(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!items && !error) return <Loading />;

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={refreshing} onRefresh={() => load(true)}>
        <ErrorBox message={error} />
        {isManager && (
          <Segments
            items={[
              { value: 'mine', label: '💵 My salary' },
              { value: 'all', label: '👥 All staff' },
            ]}
            value={tab}
            onChange={setTab}
          />
        )}
        {items?.length === 0 && <Empty icon="💵" text="No salary statements yet." />}
        {items?.map(s => (
          <Card key={s.id}>
            <View style={styles.head}>
              <Text style={styles.month}>
                {MONTHS[s.month - 1]} {s.year}
                {tab === 'all' ? ` — ${s.full_name}` : ''}
              </Text>
              <Badge status={s.status} />
            </View>
            {tab === 'all' && (
              <Text style={styles.sub}>{s.user_type ? ROLE_LABELS[s.user_type] : ''}</Text>
            )}
            <Text style={styles.amount}>{inr(s.amount)}</Text>
            {s.note ? <Text style={styles.sub}>{s.note}</Text> : null}
          </Card>
        ))}
      </Screen>
      {isManager && <Fab icon="💵" onPress={() => setAdding(true)} />}

      <Sheet visible={adding} title="Record salary" onClose={() => setAdding(false)}>
        <Text style={styles.label}>Staff member</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {staffList.map(u => (
            <Chip
              key={u.id}
              label={u.full_name}
              active={form.userId === u.id}
              onPress={() => setForm({ ...form, userId: u.id })}
            />
          ))}
        </View>
        <Text style={styles.label}>Month</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {MONTHS.map((m, i) => (
            <Chip key={m} label={m} active={form.month === i + 1} onPress={() => setForm({ ...form, month: i + 1 })} />
          ))}
        </View>
        <Input label="Year" keyboardType="numeric" value={form.year} onChangeText={v => setForm({ ...form, year: v })} />
        <Input label="Amount (₹)" keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />
        <Input label="Note (optional)" value={form.note} onChangeText={v => setForm({ ...form, note: v })} />
        <Button label="Save salary record" onPress={save} busy={busy} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: 14.5, fontWeight: '800', color: colors.ink, flex: 1, paddingRight: 8 },
  amount: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 6 },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 },
});
