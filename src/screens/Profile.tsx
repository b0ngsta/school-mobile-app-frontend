import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logout, photoUrl } from '../api';
import { Avatar, Card, ErrorBox, Loading, Screen, SectionTitle, fmtDate } from '../components/ui';
import { useApi, useI18n } from '../hooks';
import { LANGS } from '../i18n';
import { colors, radius } from '../theme';
import type { ScreenProps, StudentProfile } from '../types';

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || '—'}</Text>
  </View>
);

export default function Profile({ onLogout }: ScreenProps) {
  const { t, lang, setLang } = useI18n();
  const { data: p, error, loading, refreshing, refresh } = useApi<StudentProfile>('/student/me');
  if (loading) return <Loading />;

  const confirmLogout = () =>
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('profile.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: async () => { await logout(); onLogout(); } },
    ]);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ErrorBox message={error} />
      {p && (
        <>
          <Card style={styles.hero}>
            <Avatar name={p.full_name} uri={photoUrl(p.photo_path)} size={64} />
            <Text style={styles.name}>{p.full_name}</Text>
            <Text style={styles.meta}>
              {p.class_name ? `${p.class_name} · ${p.section_name || ''}` : ''}
              {p.roll_no ? ` · ${t('dash.roll', { n: p.roll_no })}` : ''}
            </Text>
          </Card>

          <SectionTitle>{t('profile.details')}</SectionTitle>
          <Card>
            <Field label={t('profile.username')} value={p.username} />
            <Field label={t('profile.admission')} value={p.admission_no} />
            <Field label={t('profile.dob')} value={p.dob ? fmtDate(p.dob) : null} />
            <Field label={t('profile.email')} value={p.email} />
            <Field label={t('profile.phone')} value={p.phone} />
          </Card>

          <SectionTitle>{t('profile.family')}</SectionTitle>
          <Card>
            <Field label={t('profile.father')} value={p.father_name} />
            <Field label={t('profile.mother')} value={p.mother_name} />
            <Field label={t('profile.guardianPhone')} value={p.guardian_phone} />
            <Field label={t('profile.address')} value={p.address} />
          </Card>
        </>
      )}

      <SectionTitle>{t('profile.language')}</SectionTitle>
      <Card style={styles.langCard}>
        {LANGS.map(l => (
          <TouchableOpacity
            key={l.code}
            style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
            onPress={() => setLang(l.code)}>
            <Text style={[styles.langText, lang === l.code && styles.langTextActive]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <TouchableOpacity style={styles.logout} onPress={confirmLogout}>
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 22 },
  name: { fontSize: 18, fontWeight: '800', color: colors.ink, marginTop: 10 },
  meta: { fontSize: 12, color: colors.subtle, marginTop: 2 },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  fieldLabel: { fontSize: 13, color: colors.subtle },
  fieldValue: { fontSize: 13, fontWeight: '600', color: colors.ink, flexShrink: 1, textAlign: 'right', paddingLeft: 12 },
  langCard: { flexDirection: 'row' },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  langBtnActive: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  langText: { fontSize: 14, fontWeight: '600', color: colors.subtle },
  langTextActive: { color: colors.brand },
  logout: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.input,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { color: colors.danger, fontWeight: '700' },
});
