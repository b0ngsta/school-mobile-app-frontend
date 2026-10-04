import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { login } from '../api';
import { ErrorBox } from '../components/ui';
import { useI18n } from '../hooks';
import { LANGS } from '../i18n';
import { colors, radius, shadow } from '../theme';
import type { Session } from '../types';

interface LoginProps {
  onLogin: (session: Session) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { t, lang, setLang } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!username || !password) return setError(t('login.missing'));
    setBusy(true);
    setError(null);
    try {
      onLogin(await login(username.trim(), password));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* language toggle */}
      <View style={styles.langRow}>
        {LANGS.map(l => (
          <TouchableOpacity
            key={l.code}
            style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
            onPress={() => setLang(l.code)}>
            <Text style={[styles.langText, lang === l.code && styles.langTextActive]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.logo, shadow.card]}>
        <MCIcon name="school-outline" size={30} color="#fff" />
      </View>
      <Text style={styles.title}>EduManage</Text>
      <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

      <View style={[styles.card, shadow.card]}>
        <ErrorBox message={error} />

        <Text style={styles.label}>{t('login.username')}</Text>
        <View style={styles.inputWrap}>
          <MCIcon name="account-outline" size={19} color={colors.faint} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            placeholder={t('login.username').toLowerCase()}
            placeholderTextColor={colors.faint}
          />
        </View>

        <Text style={styles.label}>{t('login.password')}</Text>
        <View style={styles.inputWrap}>
          <MCIcon name="lock-outline" size={19} color={colors.faint} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.faint}
            onSubmitEditing={submit}
          />
          <TouchableOpacity onPress={() => setShowPass(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MCIcon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.faint} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={busy} activeOpacity={0.8}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('login.signin')}</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center', padding: 20 },
  langRow: { flexDirection: 'row', marginBottom: 24 },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  langBtnActive: { backgroundColor: colors.brand },
  langText: { fontSize: 13, fontWeight: '600', color: colors.subtle },
  langTextActive: { color: '#fff' },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.subtle, marginTop: 4, marginBottom: 26 },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6, marginTop: 10 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.input,
    backgroundColor: colors.page,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.ink },
  btn: {
    backgroundColor: colors.brand,
    borderRadius: radius.input,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
