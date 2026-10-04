// Reception — admission enquiries (managers).
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
  IconStat,
  Input,
  Loading,
  Screen,
  Sheet,
  fmtDate,
} from '../../components/ui';
import { colors } from '../../theme';
import type { Enquiry, EnquiryStats } from '../../types';

const STATUSES = ['new', 'follow_up', 'converted', 'closed'];

export default function Reception() {
  const [stats, setStats] = useState<EnquiryStats | null>(null);
  const [items, setItems] = useState<Enquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ parent_name: '', student_name: '', class_interested: '', contact: '', notes: '' });

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setStats(await api('/enquiries/stats'));
      setItems(await api('/enquiries'));
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

  const add = async () => {
    if (!form.parent_name.trim() || !form.student_name.trim() || form.contact.length < 5) {
      return setError('Parent, student and contact are required');
    }
    setBusy(true);
    try {
      await api('/enquiries', {
        method: 'POST',
        body: {
          parent_name: form.parent_name.trim(),
          student_name: form.student_name.trim(),
          class_interested: form.class_interested || null,
          contact: form.contact,
          notes: form.notes || null,
        },
      });
      setAdding(false);
      setForm({ parent_name: '', student_name: '', class_interested: '', contact: '', notes: '' });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (enq: Enquiry, status: string) => {
    try {
      await api(`/enquiries/${enq.id}`, { method: 'PUT', body: { status } });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!items && !error) return <Loading />;

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={refreshing} onRefresh={() => load(true)}>
        <ErrorBox message={error} />
        <View style={styles.statRow}>
          <IconStat icon="🛎️" label="Today" value={stats?.today} tint={colors.brand} soft={colors.brandSoft} />
          <IconStat icon="🆕" label="New" value={stats?.pending} tint={colors.info} soft={colors.infoSoft} />
          <IconStat icon="✅" label="Converted" value={stats?.converted} tint={colors.ok} soft={colors.okSoft} />
        </View>

        {items?.length === 0 && <Empty icon="🛎️" text="No enquiries yet." />}
        {items?.map(e => (
          <Card key={e.id}>
            <View style={styles.head}>
              <Text style={styles.name}>{e.student_name}</Text>
              <Badge status={e.status} />
            </View>
            <Text style={styles.sub}>
              👪 {e.parent_name} · 📞 {e.contact}
              {e.class_interested ? ` · 🏫 ${e.class_interested}` : ''}
            </Text>
            {e.notes ? <Text style={[styles.sub, { marginTop: 3 }]}>{e.notes}</Text> : null}
            <Text style={[styles.sub, { marginTop: 3 }]}>{fmtDate(e.created_at)}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {STATUSES.filter(s => s !== e.status).map(s => (
                <Chip key={s} label={`→ ${s.replace('_', ' ')}`} onPress={() => setStatus(e, s)} />
              ))}
            </View>
          </Card>
        ))}
      </Screen>
      <Fab onPress={() => setAdding(true)} />

      <Sheet visible={adding} title="New enquiry" onClose={() => setAdding(false)}>
        <Input label="Parent name" value={form.parent_name} onChangeText={v => setForm({ ...form, parent_name: v })} />
        <Input label="Student name" value={form.student_name} onChangeText={v => setForm({ ...form, student_name: v })} />
        <Input label="Class interested" placeholder="e.g. Class 5" value={form.class_interested} onChangeText={v => setForm({ ...form, class_interested: v })} />
        <Input label="Contact" keyboardType="phone-pad" value={form.contact} onChangeText={v => setForm({ ...form, contact: v })} />
        <Input label="Notes" multiline style={{ minHeight: 60, textAlignVertical: 'top' }} value={form.notes} onChangeText={v => setForm({ ...form, notes: v })} />
        <Button label="Add enquiry" onPress={add} busy={busy} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 14.5, fontWeight: '800', color: colors.ink, flex: 1, paddingRight: 8 },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 4 },
});
