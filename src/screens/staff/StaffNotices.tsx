// Notices for staff & drivers. Admin/principal can post + delete.
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '../../api';
import {
  Button,
  Card,
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
import type { Notice, ScreenProps } from '../../types';

export default function StaffNotices({ session }: ScreenProps) {
  const canPost = ['admin', 'principal'].includes(session.user_type);
  const [items, setItems] = useState<Notice[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setItems(await api('/notices'));
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

  const post = async () => {
    if (!title.trim() || !body.trim()) return setError('Title and body are required');
    setBusy(true);
    try {
      await api('/notices', { method: 'POST', body: { title: title.trim(), body: body.trim() } });
      setComposing(false);
      setTitle('');
      setBody('');
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await api(`/notices/${id}`, { method: 'DELETE' });
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
        {items?.length === 0 && <Empty icon="📢" text="No notices yet." />}
        {items?.map(n => (
          <Card key={n.id}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.body}>{n.body}</Text>
            <View style={styles.footer}>
              <Text style={styles.sub}>{n.posted_by} · {fmtDate(n.created_at)}</Text>
              {canPost && <Button label="Delete" kind="danger" small onPress={() => remove(n.id)} />}
            </View>
          </Card>
        ))}
      </Screen>
      {canPost && <Fab icon="📢" onPress={() => setComposing(true)} />}

      <Sheet visible={composing} title="Post notice" onClose={() => setComposing(false)}>
        <Input label="Title" value={title} onChangeText={setTitle} />
        <Input
          label="Body"
          multiline
          style={{ minHeight: 100, textAlignVertical: 'top' }}
          value={body}
          onChangeText={setBody}
        />
        <Button label="Post notice" onPress={post} busy={busy} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '800', color: colors.ink },
  body: { fontSize: 13, color: colors.ink, marginTop: 6, lineHeight: 19 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  sub: { fontSize: 11.5, color: colors.subtle },
});
