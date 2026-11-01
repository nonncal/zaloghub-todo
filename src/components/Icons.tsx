const common = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const CheckIcon = () => (
  <svg {...common} width={12} height={12} strokeWidth={2.5}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export const PencilIcon = () => (
  <svg {...common}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
)

export const TrashIcon = () => (
  <svg {...common}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
)
