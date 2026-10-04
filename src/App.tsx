// EduManage — app shell (multi-role, grid navigation like the mockups).
// The header shows the school name + academic session; the home screen is a
// role-specific tile grid and every feature is pushed on a tiny stack.
// Each stack entry renders as its own page (top bar + screen) inside
// <ScreenStack>, which animates the routes that opt in (routes.ts).
// Role themes (violet student / green teacher / blue admin) are applied at
// login via applyRoleTheme(), so brand colors are read inline on render.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ScreenStack } from './components/ScreenStack';
import { Loading } from './components/ui';
// import { SCHOOL_NAME, sessionLabel } from './config';
import { useI18n } from './hooks';
import { loadLang, t } from './i18n';
import Login from './screens/Login';
import { SCREENS, homeForRole } from './routes';
import type { RouteName, ScreenEntry } from './routes';
import { colors } from './theme';
import type { NavigateFn, RouteParams, Session } from './types';

interface StackEntry {
  /** Unique per push, so a screen keeps its identity while it animates. */
  key: string;
  route: RouteName;
  params?: RouteParams;
}

const HOME_KEY = 'home';
let lastEntryId = 0;

const entryKey = (entry: StackEntry) => entry.key;
const entryTransition = (entry: StackEntry) => {
  const screen: ScreenEntry | undefined = SCREENS[entry.route];
  return screen?.transition;
};

export default function App() {
  const [booted, setBooted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [stack, setStack] = useState<StackEntry[]>([]); // pushed on top of home

  // Re-render the whole app when the language changes (screens call t()).
  useI18n();

  useEffect(() => {
    Promise.all([loadSession(), loadLang()]).then(() => {
      setSession(getSession());
      setBooted(true);
    });
  }, []);

  const navigate = useCallback<NavigateFn>((route, params) => {
    const key = `${route}-${++lastEntryId}`;
    setStack(s => [...s, { key, route, params }]);
  }, []);
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

  // Home plus everything pushed on top of it — the stack <ScreenStack> draws.
  const homeRoute = session ? homeForRole(session.user_type) : null;
  const entries = useMemo<StackEntry[]>(
    () => (homeRoute ? [{ key: HOME_KEY, route: homeRoute }, ...stack] : []),
    [homeRoute, stack],
  );

  if (!booted) return <Loading />;
  if (!session) return <Login onLogin={handleLogin} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.brandDark }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandDark} />
      <ScreenStack
        entries={entries}
        keyOf={entryKey}
        transitionOf={entryTransition}
        backdropColor={colors.brandDark}
        screenColor={colors.page}
        renderScreen={entry => (
          <Page entry={entry} session={session} navigate={navigate} goBack={goBack} onLogout={handleLogout} />
        )}
      />
    </SafeAreaView>
  );
}

interface PageProps {
  entry: StackEntry;
  session: Session;
  navigate: NavigateFn;
  goBack: () => void;
  onLogout: () => void;
}

/** One stack entry: its top bar plus the screen itself. */
function Page({ entry, session, navigate, goBack, onLogout }: PageProps) {
  const homeRoute = homeForRole(session.user_type);
  const screen: ScreenEntry = SCREENS[entry.route] || SCREENS[homeRoute];
  const ActiveScreen = screen.component;
  const atHome = entry.key === HOME_KEY;
  const title =
    entry.params?.title || (screen.titleKey ? t(screen.titleKey) : screen.title ? t(screen.title) : 'EduManage');
  const noticeRoute: RouteName = session.user_type === 'student' ? 'Notices' : 'StaffNotices';

  return (
    <>
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
          params={entry.params}
          session={session}
          onLogout={onLogout}
        />
      </View>
    </>
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
