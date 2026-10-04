// Bulk SMS (managers) — compose + history. Sending is simulated server-side.
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
  Sheet,
  fmtDate,
} from '../../components/ui';
import { colors } from '../../theme';
import type { SmsLog } from '../../types';

const GROUPS = [
  { value: 'all_parents', label: 'All Parents' },
  { value: 'all_teachers', label: 'All Teachers' },
  { value: 'all_staff', label: 'All Staff' },
];

export default function BulkSMS() {
  const [items, setItems] = useState<SmsLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [group, setGroup] = useState('all_parents');
  const [message, setMessage] = useState('');

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setItems(await api('/sms'));
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

  const send = async () => {
    if (!message.trim()) return setError('Message is required');
    setBusy(true);
    try {
      await api('/sms', { method: 'POST', body: { recipient_group: group, message: message.trim() } });
      setComposing(false);
      setMessage('');
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
        {items?.length === 0 && <Empty icon="💬" text="No SMS sent yet." />}
        {items?.map(m => (
          <Card key={m.id}>
            <View style={styles.head}>
              <Text style={styles.group}>{m.recipient_group}</Text>
              <Badge status={m.status === 'sent' ? 'completed' : 'failed'} label={m.status} />
            </View>
            <Text style={styles.msg}>{m.message}</Text>
            <Text style={styles.sub}>👥 {m.recipients_count} recipients · {fmtDate(m.created_at)}</Text>
          </Card>
        ))}
      </Screen>
      <Fab icon="✉️" onPress={() => setComposing(true)} />

      <Sheet visible={composing} title="Send bulk SMS" onClose={() => setComposing(false)}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 }}>Recipients</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {GROUPS.map(g => (
            <Chip key={g.value} label={g.label} active={group === g.value} onPress={() => setGroup(g.value)} />
          ))}
        </View>
        <Input
          label="Message"
          multiline
          style={{ minHeight: 90, textAlignVertical: 'top' }}
          value={message}
          onChangeText={setMessage}
          maxLength={1000}
        />
        <Button label="Send SMS" onPress={send} busy={busy} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  group: { fontSize: 14, fontWeight: '800', color: colors.ink },
  msg: { fontSize: 13, color: colors.ink, marginTop: 6 },
  sub: { fontSize: 11.5, color: colors.subtle, marginTop: 6 },
});
