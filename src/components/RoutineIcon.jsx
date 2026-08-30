import React from 'react';

const paths = {
  wake_up: <><path d="M12 3v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="M5 18h14"/><path d="M7 15a5 5 0 0 1 10 0"/></>,
  clean_sala: <><path d="M4 20l8-8"/><path d="M10 4l10 10"/><path d="M8 6l10 10"/><path d="M3 21l4-1 1-4"/></>,
  receive_alms_items: <><path d="M5 9h14l-1 10H6L5 9Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/></>,
  offer_meal: <><path d="M4 13h16"/><path d="M6 13a6 6 0 0 1 12 0"/><path d="M12 4v3"/><path d="M5 17h14"/></>,
  clear_room: <><path d="M6 3v7"/><path d="M18 3v7"/><path d="M8 10h8"/><path d="M9 14h6v7H9z"/><path d="M4 21h16"/></>,
  leave_for_school: <><path d="M3 11l9-6 9 6"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/><path d="M2 21h20"/></>,
  return_from_school: <><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
  prepare_uniform: <><path d="M9 4l3 2 3-2 4 3-3 4v9H8v-9L5 7l4-3Z"/><path d="M10 9h4"/></>,
  homework_done: <><path d="M4 5a3 3 0 0 1 3-2h5v18H7a3 3 0 0 0-3 2V5Z"/><path d="M20 5a3 3 0 0 0-3-2h-5v18h5a3 3 0 0 1 3 2V5Z"/><path d="M7 8h2"/><path d="M15 8h2"/></>,
  dinner: <><path d="M7 3v8"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M7 11v10"/><path d="M16 3c2 3 2 7 0 10v8"/></>,
  shower: <><path d="M4 7a5 5 0 0 1 9-3"/><path d="M13 4l4 4"/><path d="M15 8h5"/><path d="M15 12v.01"/><path d="M18 13v.01"/><path d="M12 13v.01"/><path d="M15 16v.01"/><path d="M18 17v.01"/><path d="M12 17v.01"/></>,
  bedtime: <><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></>,
  assignment: <><path d="M9 5h6"/><path d="M9 3h6v4H9z"/><path d="M6 5H4v16h16V5h-2"/><path d="M8 12l2 2 5-5"/></>,
  message: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/></>,
  home: <><path d="M3 11l9-8 9 8"/><path d="M5 10v11h14V10"/><path d="M9 21v-7h6v7"/></>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  check: <path d="M5 12l4 4L19 6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  alert: <><path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4M12 17v.01"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3a7 7 0 0 0-1.7 1L5 6 3 9.5 5.1 11a7 7 0 0 0 0 2L3 14.5 5 18l2.5-1a7 7 0 0 0 1.7 1l.3 3h5l.3-3a7 7 0 0 0 1.7-1l2.5 1 2-3.5-2.1-1.5c.1-.3.1-.7.1-1Z"/></>
};

export default function RoutineIcon({ type, size = 24, strokeWidth = 1.8, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      {paths[type] || paths.assignment}
    </svg>
  );
}
