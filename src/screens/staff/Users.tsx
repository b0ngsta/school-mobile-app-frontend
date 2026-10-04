// Staff users (managers): list + add staff accounts (any role).
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api, photoUrl } from '../../api';
import {
  Avatar,
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
} from '../../components/ui';
import { ROLE_LABELS, colors } from '../../theme';
import type { Role, StaffUser } from '../../types';
import { t } from '../../i18n';

const CREATABLE: Role[] = ['teacher', 'coordinator', 'driver', 'sub_admin', 'principal', 'admin'];

export default function Users() {
  const [items, setItems] = useState<StaffUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ full_name: string; username: string; password: string; phone: string; user_type: Role }>({ full_name: '', username: '', password: '', phone: '', user_type: 'teacher' });

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setItems(await api('/users'));
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
    if (!form.full_name.trim() || !form.username.trim() || form.password.length < 6) {
      return setError(t('Name, username and a 6+ char password are required'));
    }
    setBusy(true);
    try {
      await api('/users', {
        method: 'POST',
        body: {
          full_name: form.full_name.trim(),
          username: form.username.trim(),
          password: form.password,
          phone: form.phone || null,
          user_type: form.user_type,
        },
      });
      setAdding(false);
      setForm({ full_name: '', username: '', password: '', phone: '', user_type: 'teacher' });
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
        {items?.length === 0 && <Empty icon="👥" text={t('No staff yet.')} />}
        {items?.map(u => (
          <Card key={u.id} style={styles.row}>
            <Avatar name={u.full_name} uri={photoUrl(u.photo_path)} size={42} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{u.full_name}</Text>
              <Text style={styles.sub}>
                @{u.username}{u.phone ? ` · 📞 ${u.phone}` : ''}
              </Text>
            </View>
            <View style={[styles.rolePill, { backgroundColor: colors.brandSoft }]}>
              <Text style={{ color: colors.brand, fontSize: 11.5, fontWeight: '700' }}>
                {u.user_type ? t(ROLE_LABELS[u.user_type]) : ''}
              </Text>
            </View>
          </Card>
        ))}
      </Screen>
      <Fab onPress={() => setAdding(true)} />

      <Sheet visible={adding} title={t('Add staff member')} onClose={() => setAdding(false)}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 }}>{t('Role')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {CREATABLE.map(r => (
            <Chip key={r} label={t(ROLE_LABELS[r])} active={form.user_type === r} onPress={() => setForm({ ...form, user_type: r })} />
          ))}
        </View>
        <Input label={t('Full name')} value={form.full_name} onChangeText={v => setForm({ ...form, full_name: v })} />
        <Input label={t('Username')} autoCapitalize="none" value={form.username} onChangeText={v => setForm({ ...form, username: v })} />
        <Input label={t('Password (min 6 chars)')} secureTextEntry value={form.password} onChangeText={v => setForm({ ...form, password: v })} />
        <Input label={t('Phone')} keyboardType="phone-pad" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} />
        <Button label={t('Create account')} onPress={add} busy={busy} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 14.5, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 12, color: colors.subtle, marginTop: 2 },
  rolePill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
});
