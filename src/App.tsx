// EduManage — app shell (multi-role, grid navigation like the mockups).
// The header shows the school name + academic session; the home screen is a
// role-specific tile grid and every feature is pushed on a tiny stack.
// Role themes (violet student / green teacher / blue admin) are applied at
// login via applyRoleTheme(), so brand colors are read inline on render.
import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getSession, loadSession } from './api';
import { Loading } from './components/ui';
// import { SCHOOL_NAME, sessionLabel } from './config';
import { useI18n } from './hooks';
import { loadLang } from './i18n';
import Login from './screens/Login';
import { SCREENS, homeForRole } from './routes';
import type { RouteName, ScreenEntry } from './routes';
import { colors } from './theme';
import type { NavigateFn, RouteParams, Session } from './types';

interface StackEntry {
  route: RouteName;
  params?: RouteParams;
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [stack, setStack] = useState<StackEntry[]>([]); // pushed on top of home

  const { t } = useI18n();

  useEffect(() => {
    Promise.all([loadSession(), loadLang()]).then(() => {
      setSession(getSession());
      setBooted(true);
    });
  }, []);

  const navigate = useCallback<NavigateFn>((route, params) => setStack(s => [...s, { route, params }]), []);
  const goBack = useCallback(() => setStack(s => s.slice(0, -1)), []);

  // Android hardware back: pop the stack before exiting
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, goBack]);

  const handleLogin = (s: Session) => {
    setStack([]);
    setSession(s);
  };

  const handleLogout = () => {
    setStack([]);
    setSession(null);
  };

  if (!booted) return <Loading />;
  if (!session) return <Login onLogin={handleLogin} />;

  const homeRoute = homeForRole(session.user_type);
  const top: StackEntry = stack.length ? stack[stack.length - 1] : { route: homeRoute };
  const screen: ScreenEntry = SCREENS[top.route] || SCREENS[homeRoute];
  const ActiveScreen = screen.component;
  const atHome = stack.length === 0;
  const title =
    top.params?.title || (screen.titleKey ? t(screen.titleKey) : screen.title ? t(screen.title) : 'EduManage');
  const noticeRoute: RouteName = session.user_type === 'student' ? 'Notices' : 'StaffNotices';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.brandDark }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandDark} />

      {/* top bar — school branding on home, back+title inside */}
      <View style={[styles.topbar, { backgroundColor: colors.brand }]}>
        {!atHome && (
          <TouchableOpacity onPress={goBack} style={styles.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MCIcon name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        {atHome ? (
          <>
            <View style={styles.logo}>
              <MCIcon name="school-outline" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              {/* <Text style={styles.topTitle}>{SCHOOL_NAME}</Text> */}
              {/* <Text style={styles.topSub}>{sessionLabel()}</Text> */}
            </View>
            <TouchableOpacity
              onPress={() => navigate(noticeRoute)}
              style={styles.bell}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MCIcon name="bell-outline" size={19} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.topTitle, { flex: 1 }]} numberOfLines={1}>{title}</Text>
        )}
      </View>

      {/* screen */}
      <View style={{ flex: 1, backgroundColor: colors.page }}>
        <ActiveScreen
          navigate={navigate}
          goBack={goBack}
          params={top.params}
          session={session}
          onLogout={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { marginRight: 12 },
  bell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { color: '#fff', fontSize: 16.5, fontWeight: '800' },
  topSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11.5, marginTop: 1 },
});
