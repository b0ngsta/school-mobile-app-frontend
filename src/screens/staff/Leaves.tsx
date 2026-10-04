// Leave requests — staff submit + track; managers also review all requests.
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api, peek, photoUrl } from '../../api';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ChipsSkeleton,
  Empty,
  ErrorBox,
  Fab,
  Input,
  ListSkeleton,
  Screen,
  ScreenSkeleton,
  Segments,
  Sheet,
  fmtDate,
} from '../../components/ui';
import { MANAGER_ROLES } from '../../roles';
import { ROLE_LABELS, colors } from '../../theme';
import type { LeaveRequest, ScreenProps } from '../../types';
import { t } from '../../i18n';

export default function Leaves({ session }: ScreenProps) {
  const isManager = MANAGER_ROLES.includes(session.user_type);
  const [tab, setTab] = useState(isManager ? 'all' : 'mine');
  const [items, setItems] = useState<LeaveRequest[] | null>(() => peek<LeaveRequest[]>(isManager ? '/leaves' : '/leaves/mine'));
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [reviewing, setReviewing] = useState<LeaveRequest | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ from_date: '', to_date: '', reason: '' });

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setItems(await api(tab === 'mine' ? '/leaves/mine' : '/leaves'));
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
  }, [load]);

  const submit = async () => {
    if (!form.from_date || !form.to_date || !form.reason.trim()) {
      return setError(t('From date, to date and reason are required (YYYY-MM-DD)'));
    }
    setBusy(true);
    try {
      await api('/leaves', {
        method: 'POST',
        body: { from_date: form.from_date, to_date: form.to_date, reason: form.reason.trim() },
      });
      setRequesting(false);
      setForm({ from_date: '', to_date: '', reason: '' });
      setError(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const review = async (action: 'approve' | 'reject') => {
    if (!reviewing) return;
    setBusy(true);
    try {
      await api(`/leaves/${reviewing.id}/${action}`, { method: 'PUT', body: { note: note.trim() || null } });
      setReviewing(null);
      setNote('');
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
        {isManager && <ChipsSkeleton count={2} />}
        <ListSkeleton avatar={34} badge="right" lines={2} />
      </ScreenSkeleton>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={refreshing} onRefresh={() => load(true)}>
        <ErrorBox message={error} />
        {isManager && (
          <Segments
            items={[
              { value: 'all', label: `📥 ${t('All requests')}` },
              { value: 'mine', label: `🧳 ${t('My requests')}` },
            ]}
            value={tab}
            onChange={setTab}
          />
        )}
        {items?.length === 0 && <Empty icon="🧳" text={t('No leave requests yet.')} />}
        {items?.map(l => (
          <Card key={l.id}>
            <View style={styles.head}>
              {tab === 'all' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Avatar name={l.full_name} uri={photoUrl(l.photo_path)} size={34} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={styles.name}>{l.full_name}</Text>
                    <Text style={styles.sub}>{l.user_type ? t(ROLE_LABELS[l.user_type]) : ''}</Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.name, { flex: 1 }]}>{t('Leave request')}</Text>
              )}
              <Badge status={l.status} />
            </View>
            <Text style={[styles.sub, { marginTop: 8 }]}>
              🗓️ {fmtDate(l.from_date)} → {fmtDate(l.to_date)}
            </Text>
            <Text style={{ color: colors.ink, fontSize: 13, marginTop: 4 }}>{l.reason}</Text>
            {l.reviewed_by_name ? (
              <Text style={[styles.sub, { marginTop: 4 }]}>
                {t('Reviewed by {name}', { name: l.reviewed_by_name })}{l.review_note ? ` — ${l.review_note}` : ''}
              </Text>
            ) : null}
            {tab === 'all' && isManager && l.status === 'pending' && (
              <Button
                label={t('Review')}
                kind="soft"
                small
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
                onPress={() => { setReviewing(l); setNote('') }}
              />
            )}
          </Card>
        ))}
      </Screen>
      <Fab icon="🧳" onPress={() => setRequesting(true)} />

      <Sheet visible={requesting} title={t('Request leave')} onClose={() => setRequesting(false)}>
        <Input label={t('From (YYYY-MM-DD)')} placeholder="2026-07-20" value={form.from_date} onChangeText={v => setForm({ ...form, from_date: v })} />
        <Input label={t('To (YYYY-MM-DD)')} placeholder="2026-07-22" value={form.to_date} onChangeText={v => setForm({ ...form, to_date: v })} />
        <Input label={t('Reason')} multiline style={{ minHeight: 70, textAlignVertical: 'top' }} value={form.reason} onChangeText={v => setForm({ ...form, reason: v })} />
        <Button label={t('Submit request')} onPress={submit} busy={busy} />
      </Sheet>

      <Sheet
        visible={!!reviewing}
        title={reviewing ? `${reviewing.full_name} · ${fmtDate(reviewing.from_date)} → ${fmtDate(reviewing.to_date)}` : ''}
        onClose={() => setReviewing(null)}>
        {reviewing && (
          <>
            <Text style={{ color: colors.ink, fontSize: 13.5, marginBottom: 10 }}>{reviewing.reason}</Text>
            <Input label={t('Note (optional)')} value={note} onChangeText={setNote} />
            <View style={{ flexDirection: 'row' }}>
              <Button label={t('✅ Approve')} onPress={() => review('approve')} busy={busy} style={{ flex: 1, marginRight: 8 }} />
              <Button label={t('✕ Reject')} kind="danger" onPress={() => review('reject')} busy={busy} style={{ flex: 1 }} />
            </View>
          </>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 1 },
});
