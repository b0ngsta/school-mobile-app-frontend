// Teacher's own weekly timetable (read-only; managers edit it from the
// teacher's profile or the web app).
import React from 'react';
import { TimetableEditor } from '../../components/Timetable';
import { Screen } from '../../components/ui';
import type { ScreenProps } from '../../types';

export default function MyTimetable({ session }: ScreenProps) {
  return (
    <Screen>
      <TimetableEditor teacherId={session.user_id} canEdit={false} mine />
    </Screen>
  );
}
