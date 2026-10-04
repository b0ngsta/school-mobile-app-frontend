// Weekly timetable, mobile-friendly: grouped by day, one row per period.
// TimetableEditor fetches slots for a teacher and (for managers) lets them
// add/edit/clear any (day, period) via a bottom sheet.
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../api';
import { colors } from '../theme';
import type { ClassInfo, TimetableSlot } from '../types';
import { Button, Card, Chip, Empty, ErrorBox, Input, Loading, Sheet } from './ui';
import { t } from '../i18n';

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS = [0, 1, 2, 3, 4, 5]; // Mon–Sat
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

type CellPressHandler = (day: number, period: number, slot?: TimetableSlot) => void;

interface TimetableViewProps {
  slots?: TimetableSlot[] | null;
  onCellPress?: CellPressHandler;
  canEdit?: boolean;
  renderExtra?: (slot: TimetableSlot) => ReactNode;
}

/** Read-only day-by-day rendering. slots: rows from /timetable. */
export function TimetableView({ slots, onCellPress, canEdit, renderExtra }: TimetableViewProps) {
  const byCell: Record<string, TimetableSlot> = {};
  for (const s of slots || []) byCell[`${s.day}-${s.period}`] = s;
  return (
    <View>
      {DAYS.map(day => {
        const daySlots = PERIODS.map(p => ({ period: p, slot: byCell[`${day}-${p}`] }));
        const hasAny = daySlots.some(x => x.slot);
        if (!hasAny && !canEdit) return null;
        return (
          <Card key={day}>
            <Text style={styles.day}>{t(DAY_NAMES[day])}</Text>
            {daySlots.map(({ period, slot }) => {
              if (!slot && !canEdit) return null;
              return (
                <TouchableOpacity
                  key={period}
                  disabled={!canEdit}
                  activeOpacity={0.65}
                  onPress={() => onCellPress?.(day, period, slot)}>
                  <View style={styles.row}>
                    <View style={[styles.periodPill, { backgroundColor: slot ? colors.brand : colors.page }]}>
                      <Text style={{ color: slot ? '#fff' : colors.subtle, fontWeight: '800', fontSize: 12 }}>
                        P{period}
                      </Text>
                    </View>
                    {slot ? (
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.slotMain}>
                          {slot.class_name} — {slot.section_name}
                          {slot.subject ? ` · ${slot.subject}` : ''}
                        </Text>
                        {renderExtra ? renderExtra(slot) : null}
                      </View>
                    ) : (
                      <Text style={{ flex: 1, marginLeft: 10, color: colors.subtle, fontSize: 12.5 }}>
                        {t('Free — tap to assign')}
                      </Text>
                    )}
                    {canEdit && <Text style={{ color: colors.subtle, fontSize: 18 }}>›</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>
        );
      })}
    </View>
  );
}

interface EditingCell {
  day: number;
  period: number;
  slot?: TimetableSlot;
}

interface SlotForm {
  classId: number | null;
  sectionId: number | null;
  subject: string;
}

const EMPTY_FORM: SlotForm = { classId: null, sectionId: null, subject: '' };

interface TimetableEditorProps {
  teacherId?: number;
  canEdit?: boolean;
  mine?: boolean;
}

/** Fetch + (optionally) edit a teacher's weekly timetable. */
export function TimetableEditor({ teacherId, canEdit, mine = false }: TimetableEditorProps) {
  const [slots, setSlots] = useState<TimetableSlot[] | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [form, setForm] = useState<SlotForm>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setSlots(await api<TimetableSlot[]>(mine ? '/timetable/mine' : `/timetable?teacher_id=${teacherId}`));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [teacherId, mine]);

  useEffect(() => {
    load();
    if (canEdit) api<ClassInfo[]>('/classes').then(setClasses).catch(() => {});
  }, [load, canEdit]);

  const openCell: CellPressHandler = (day, period, slot) => {
    setForm(
      slot
        ? { classId: slot.class_id, sectionId: slot.section_id, subject: slot.subject || '' }
        : EMPTY_FORM,
    );
    setEditing({ day, period, slot });
  };

  const save = async () => {
    if (!editing) return;
    if (!form.classId || !form.sectionId) return setError(t('Pick a class and section'));
    setBusy(true);
    try {
      await api('/timetable', {
        method: 'PUT',
        body: {
          teacher_id: teacherId,
          day: editing.day,
          period: editing.period,
          class_id: form.classId,
          section_id: form.sectionId,
          subject: form.subject.trim() || null,
        },
      });
      setEditing(null);
      setError(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!editing?.slot) return;
    setBusy(true);
    try {
      await api(`/timetable/${editing.slot.id}`, { method: 'DELETE' });
      setEditing(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!slots && !error) return <Loading />;
  const selClass = classes.find(c => c.id === form.classId);

  return (
    <View>
      <ErrorBox message={error} />
      {slots?.length === 0 && !canEdit && <Empty icon="calendar-star" text={t('No timetable set yet.')} />}
      <TimetableView slots={slots} canEdit={canEdit} onCellPress={openCell} />

      <Sheet
        visible={!!editing}
        title={editing ? `${t(DAY_NAMES[editing.day])} · ${t('Period {n}', { n: editing.period })}` : ''}
        onClose={() => setEditing(null)}>
        {editing && (
          <>
            <Text style={styles.label}>{t('Class')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {classes.map(c => (
                <Chip
                  key={c.id}
                  label={c.name}
                  active={form.classId === c.id}
                  onPress={() => setForm({ ...form, classId: c.id, sectionId: null })}
                />
              ))}
            </View>
            {selClass && (
              <>
                <Text style={styles.label}>{t('Section')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {selClass.sections.map(s => (
                    <Chip
                      key={s.id}
                      label={t('Section {name}', { name: s.name })}
                      active={form.sectionId === s.id}
                      onPress={() => setForm({ ...form, sectionId: s.id })}
                    />
                  ))}
                </View>
                {selClass.subjects?.length ? (
                  <>
                    <Text style={styles.label}>{t('Subject')}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {selClass.subjects.map(s => (
                        <Chip key={s} label={s} active={form.subject === s} onPress={() => setForm({ ...form, subject: s })} />
                      ))}
                    </View>
                  </>
                ) : null}
              </>
            )}
            <Input label={t('Subject (or type your own)')} placeholder={t('e.g. Mathematics')} value={form.subject} onChangeText={v => setForm({ ...form, subject: v })} />
            <Button label={editing.slot ? t('Save changes') : t('Assign period')} onPress={save} busy={busy} />
            {editing.slot && (
              <Button label={t('Clear this period')} kind="danger" onPress={clear} busy={busy} style={{ marginTop: 8 }} />
            )}
          </>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  day: { fontSize: 14.5, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  periodPill: {
    width: 38,
    paddingVertical: 5,
    borderRadius: 9,
    alignItems: 'center',
  },
  slotMain: { fontSize: 13.5, fontWeight: '700', color: colors.ink },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6, marginTop: 4 },
});
