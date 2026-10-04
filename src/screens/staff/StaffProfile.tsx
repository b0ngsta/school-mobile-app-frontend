// Staff profile — account details, language toggle, logout.
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logout } from '../../api';
import { Avatar, Button, Card, Screen, SectionTitle } from '../../components/ui';
import { useApi, useI18n } from '../../hooks';
import { LANGS } from '../../i18n';
import { ROLE_LABELS, colors } from '../../theme';
import type { AuthUser, ScreenProps, Session } from '../../types';

export default function StaffProfile({ session, onLogout }: ScreenProps) {
  const { t, lang, setLang } = useI18n();
  const { data } = useApi<AuthUser>('/auth/me');
  const [busy, setBusy] = useState(false);

  const confirmLogout = () =>
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('profile.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          await logout();
          onLogout();
        },
      },
    ]);

  const u: Partial<AuthUser> & Pick<Session, 'full_name' | 'user_type'> = data || session;

  return (
    <Screen>
      <Card style={styles.hero}>
        <Avatar name={u.full_name} size={60} />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={styles.name}>{u.full_name}</Text>
          <View style={[styles.rolePill, { backgroundColor: colors.brandSoft }]}>
            <Text style={{ color: colors.brand, fontSize: 12, fontWeight: '700' }}>
              {ROLE_LABELS[u.user_type] || u.user_type}
            </Text>
          </View>
        </View>
      </Card>

      <SectionTitle>{t('profile.details')}</SectionTitle>
      <Card>
        <Detail label={t('profile.username')} value={u.username || session.full_name} />
        <Detail label={t('profile.email')} value={u.email} />
        <Detail label={t('profile.phone')} value={u.phone} last />
      </Card>

      <SectionTitle>{t('profile.language')}</SectionTitle>
      <Card style={{ flexDirection: 'row' }}>
        {LANGS.map(l => (
          <TouchableOpacity
            key={l.code}
            onPress={() => setLang(l.code)}
            style={[
              styles.langBtn,
              lang === l.code && { backgroundColor: colors.brand, borderColor: colors.brand },
            ]}>
            <Text style={{ color: lang === l.code ? '#fff' : colors.subtle, fontWeight: '600', fontSize: 13 }}>
              {l.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Button label={t('profile.logout')} kind="danger" onPress={confirmLogout} busy={busy} />
    </Screen>
  );
}

function Detail({ label, value, last }: { label: string; value?: string | null; last?: boolean }) {
  return (
    <View style={[styles.detail, last && { borderBottomWidth: 0 }]}>
      <Text style={{ color: colors.subtle, fontSize: 12.5 }}>{label}</Text>
      <Text style={{ color: colors.ink, fontSize: 13.5, fontWeight: '600' }}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  name: { fontSize: 17, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  rolePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: 8,
  },
});
