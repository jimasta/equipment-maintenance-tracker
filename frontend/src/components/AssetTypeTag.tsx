import styles from './AssetTypeTag.module.css';

const ICONS: Record<string, JSX.Element> = {
  bomba: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="13" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M11 7V4M17 9l3-2M4 15h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  gerador: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="7" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 11l2 2-2 2M14 11h2M14 15h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  veiculo: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 16V12l2-4h9l3 4h1a1 1 0 0 1 1 1v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="16.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="16.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 16h1.4M14.6 16h2.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  maquinario: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 4l1.2 2.2 2.4-.6.3 2.4 2.4.3-.6 2.4L19 12l-2.3 1.3.6 2.4-2.4.3-.3 2.4-2.4-.6L11 20l-1.2-2.2-2.4.6-.3-2.4-2.4-.3.6-2.4L3 12l2.3-1.3-.6-2.4 2.4-.3.3-2.4 2.4.6L11 4z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="5" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 9h8M8 13h8M8 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

function normalize(tipo: string) {
  return tipo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function AssetTypeIcon({ tipo }: { tipo: string }) {
  return ICONS[normalize(tipo)] ?? DEFAULT_ICON;
}

export function AssetTypeTag({ tipo }: { tipo: string }) {
  return (
    <span className={styles.tag}>
      <span className={styles.iconWrap}>
        <AssetTypeIcon tipo={tipo} />
      </span>
      {tipo}
    </span>
  );
}
