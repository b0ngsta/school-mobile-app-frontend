// Transport — vehicles & routes. Managers manage; drivers see their fleet.
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
} from '../../components/ui';
import { MANAGER_ROLES } from '../../roles';
import { colors } from '../../theme';
import type { ScreenProps, Vehicle, VehicleStats } from '../../types';

const EMPTY = { vehicle_no: '', driver_name: '', driver_phone: '', route_name: '', capacity: '', status: 'active' };

export default function Transport({ session }: ScreenProps) {
  const canEdit = MANAGER_ROLES.includes(session.user_type);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [items, setItems] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<{ id?: number; form: typeof EMPTY } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (r = false) => {
    r && setRefreshing(true);
    try {
      setStats(await api('/vehicles/stats'));
      setItems(await api('/vehicles'));
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

  const save = async () => {
    if (!editing) return;
    const f = editing.form;
    if (!f.vehicle_no.trim() || !f.driver_name.trim()) return setError('Vehicle no and driver name are required');
    setBusy(true);
    try {
      const body = {
        ...f,
        vehicle_no: f.vehicle_no.trim(),
        driver_name: f.driver_name.trim(),
        driver_phone: f.driver_phone || null,
        route_name: f.route_name || null,
        capacity: f.capacity ? Number(f.capacity) : null,
      };
      if (editing.id) await api(`/vehicles/${editing.id}`, { method: 'PUT', body });
      else await api('/vehicles', { method: 'POST', body });
      setEditing(null);
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
        <View style={styles.statRow}>
          <IconStat icon="🚌" label="Vehicles" value={stats?.total} tint={colors.brand} soft={colors.brandSoft} />
          <IconStat icon="🟢" label="Active" value={stats?.active} tint={colors.ok} soft={colors.okSoft} />
          <IconStat icon="🗺️" label="Routes" value={stats?.routes} tint={colors.info} soft={colors.infoSoft} />
        </View>

        {items?.length === 0 && <Empty icon="🚌" text="No vehicles yet." />}
        {items?.map(v => (
          <Card key={v.id}>
            <View style={styles.head}>
              <Text style={styles.no}>{v.vehicle_no}</Text>
              <Badge status={v.status} />
            </View>
            <Text style={styles.sub}>🧑‍✈️ {v.driver_name}{v.driver_phone ? ` · 📞 ${v.driver_phone}` : ''}</Text>
            <Text style={styles.sub}>🗺️ {v.route_name || 'No route set'}{v.capacity ? ` · 🪑 ${v.capacity} seats` : ''}</Text>
            {canEdit && (
              <Button
                label="Edit"
                kind="soft"
                small
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
                onPress={() =>
                  setEditing({
                    id: v.id,
                    form: {
                      vehicle_no: v.vehicle_no,
                      driver_name: v.driver_name,
                      driver_phone: v.driver_phone || '',
                      route_name: v.route_name || '',
                      capacity: v.capacity ? String(v.capacity) : '',
                      status: v.status,
                    },
                  })
                }
              />
            )}
          </Card>
        ))}
      </Screen>
      {canEdit && <Fab onPress={() => setEditing({ form: { ...EMPTY } })} />}

      <Sheet visible={!!editing} title={editing?.id ? 'Edit vehicle' : 'Add vehicle'} onClose={() => setEditing(null)}>
        {editing && (
          <>
            <Input label="Vehicle number" placeholder="e.g. GJ01AB1234" value={editing.form.vehicle_no} onChangeText={v => setEditing({ ...editing, form: { ...editing.form, vehicle_no: v } })} />
            <Input label="Driver name" value={editing.form.driver_name} onChangeText={v => setEditing({ ...editing, form: { ...editing.form, driver_name: v } })} />
            <Input label="Driver phone" keyboardType="phone-pad" value={editing.form.driver_phone} onChangeText={v => setEditing({ ...editing, form: { ...editing.form, driver_phone: v } })} />
            <Input label="Route" placeholder="e.g. Route 1 — City Centre" value={editing.form.route_name} onChangeText={v => setEditing({ ...editing, form: { ...editing.form, route_name: v } })} />
            <Input label="Capacity" keyboardType="numeric" value={editing.form.capacity} onChangeText={v => setEditing({ ...editing, form: { ...editing.form, capacity: v } })} />
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Chip label="Active" tone="ok" active={editing.form.status === 'active'} onPress={() => setEditing({ ...editing, form: { ...editing.form, status: 'active' } })} />
              <Chip label="Maintenance" active={editing.form.status === 'maintenance'} onPress={() => setEditing({ ...editing, form: { ...editing.form, status: 'maintenance' } })} />
            </View>
            <Button label={editing.id ? 'Save changes' : 'Add vehicle'} onPress={save} busy={busy} />
          </>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', marginHorizontal: -4, marginBottom: 8 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  no: { fontSize: 15, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 12.5, color: colors.subtle, marginTop: 4 },
});
