const ICONS = {
  mic: (
    <>
      <path d='M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z' />
      <path d='M19 10v2a7 7 0 0 1-14 0v-2' />
      <line x1='12' y1='19' x2='12' y2='23' />
      <line x1='8' y1='23' x2='16' y2='23' />
    </>
  ),
  square: <><rect x='3' y='3' width='18' height='18' rx='2' ry='2' /></>,
  send: (
    <>
      <line x1='22' y1='2' x2='11' y2='13' />
      <polygon points='22 2 15 22 11 13 2 9 22 2' />
    </>
  ),
  message: <><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' /></>,
  messageSquare: <><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' /></>,
  tag: (
    <>
      <path d='M12 2H2v10l9.29 9.29c.94.94 2.46.94 3.41 0l7.59-7.59c.94-.94.94-2.46 0-3.41L12 2Z' />
      <path d='M7 7h.01' />
    </>
  ),
  play: <><polygon points='5 3 19 12 5 21 5 3' /></>,
  headphones: (
    <>
      <path d='M3 14v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2Z' />
      <path d='M17 14v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2Z' />
      <path d='M21 12V8a9 9 0 0 0-18 0v4' />
    </>
  ),
  check: <><polyline points='20 6 9 17 4 12' /></>,
  x: (
    <>
      <line x1='18' y1='6' x2='6' y2='18' />
      <line x1='6' y1='6' x2='18' y2='18' />
    </>
  ),
  loader: (
    <>
      <line x1='12' y1='2' x2='12' y2='6' />
      <line x1='12' y1='18' x2='12' y2='23' />
      <line x1='4.93' y1='4.93' x2='7.76' y2='7.76' />
      <line x1='16.24' y1='16.24' x2='19.07' y2='19.07' />
      <line x1='2' y1='12' x2='6' y2='12' />
      <line x1='18' y1='12' x2='22' y2='12' />
      <line x1='4.93' y1='19.07' x2='7.76' y2='16.24' />
      <line x1='16.24' y1='7.76' x2='19.07' y2='4.93' />
    </>
  ),
  alertCircle: (
    <>
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='8' x2='12' y2='12' />
      <line x1='12' y1='16' x2='12.01' y2='16' />
    </>
  ),
  alertTriangle: (
    <>
      <path d='M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z' />
      <line x1='12' y1='9' x2='12' y2='13' />
      <line x1='12' y1='17' x2='12.01' y2='17' />
    </>
  ),
  user: (
    <>
      <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
      <circle cx='12' cy='7' r='4' />
    </>
  ),
  monitor: (
    <>
      <rect x='2' y='3' width='20' height='14' rx='2' ry='2' />
      <line x1='8' y1='21' x2='16' y2='21' />
      <line x1='12' y1='17' x2='12' y2='21' />
    </>
  ),
  activity: <><polyline points='22 12 18 12 15 21 9 3 6 12 2 12' /></>,
  robot: (
    <>
      <rect x='3' y='11' width='18' height='10' rx='2' />
      <circle cx='12' cy='5' r='2' />
      <path d='M12 7v4' />
      <line x1='8' y1='16' x2='8.01' y2='16' />
      <line x1='16' y1='16' x2='16.01' y2='16' />
    </>
  ),
  clock: (
    <>
      <circle cx='12' cy='12' r='10' />
      <polyline points='12 6 12 12 16 14' />
    </>
  ),
  settings: (
    <>
      <circle cx='12' cy='12' r='3' />
      <path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' />
    </>
  ),
  wave: (
    <>
      <path d='M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0' />
      <path d='M2 17c2-4 4-4 6 0s4 4 6 0 4-4 6 0' opacity='0.5' />
    </>
  ),
  sparkles: (
    <>
      <path d='M12 3l1.2 4.2L17 8.5l-3.8 1.3L12 14l-1.2-4.2L7 8.5l3.8-1.3L12 3z' />
      <path d='M5 16l.6 2.1L7.5 19l-1.9.7L5 22l-.6-2.3L2.5 19l1.9-.7L5 16z' />
      <path d='M19 14l.5 1.8L21 17l-1.5.5L19 19l-.5-1.5L17 17l1.5-.5L19 14z' />
    </>
  ),
  volume: (
    <>
      <polygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5' />
      <path d='M15.54 8.46a5 5 0 0 1 0 7.07' />
      <path d='M19.07 4.93a10 10 0 0 1 0 14.14' />
    </>
  ),
}

export default function Icon({ name, size = 20, className = '' }) {
  const content = ICONS[name]
  if (!content) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`icon ${className}`}
      aria-hidden='true'
    >
      {content}
    </svg>
  )
}
