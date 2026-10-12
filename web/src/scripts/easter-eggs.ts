export const EGG_KEYS = [
  'konami',
  'logo',
  'matrix',
  'retro',
  'thanos',
  'corners',
  'shake',
  'combo',
  'scroll',
] as const;

export type EggKey = (typeof EGG_KEYS)[number];
export type EggProgress = Record<EggKey, boolean>;

const EMPTY: EggProgress = {
  konami: false,
  logo: false,
  matrix: false,
  retro: false,
  thanos: false,
  corners: false,
  shake: false,
  combo: false,
  scroll: false,
};

export function readProgress(): EggProgress {
  try {
    const stored = JSON.parse(localStorage.getItem('easterEggProgress') || '{}') as Partial<EggProgress>;
    return { ...EMPTY, ...stored };
  } catch {
    return { ...EMPTY };
  }
}

export function unlock(progress: EggProgress, key: EggKey): EggProgress {
  return { ...progress, [key]: true };
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function mountEasterEggs(root: Document): void {
  if (root.body.dataset.easterEggs !== 'on') return;
  let progress = readProgress();
  let typed = '';
  let konami: string[] = [];
  let audioReady = false;
  const corners = new Set<string>();

  root.addEventListener('pointerdown', () => {
    audioReady = true;
  }, { once: true });

  const mark = (key: EggKey) => {
    progress = unlock(progress, key);
    localStorage.setItem('easterEggProgress', JSON.stringify(progress));
    if (audioReady) beep();
    const note = root.createElement('p');
    note.textContent = `Canal secreto: ${key}`;
    note.setAttribute('role', 'status');
    root.body.append(note);
    window.setTimeout(() => note.remove(), 2400);
  };

  root.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'g') mark('combo');
    konami = [...konami, event.key.toLowerCase()].slice(-KONAMI.length);
    if (KONAMI.every((key, index) => konami[index] === key)) mark('konami');
    if (event.key.length === 1) {
      typed = `${typed}${event.key.toLowerCase()}`.slice(-8);
      if (typed.endsWith('matrix')) mark('matrix');
      if (typed.endsWith('retro')) mark('retro');
      if (typed.endsWith('thanos')) mark('thanos');
    }
  });

  root.querySelector('.logo')?.addEventListener('dblclick', () => mark('logo'));
  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const x = event.clientX < 24 ? 'l' : event.clientX > window.innerWidth - 24 ? 'r' : '';
    const y = event.clientY < 24 ? 't' : event.clientY > window.innerHeight - 24 ? 'b' : '';
    if (x && y) {
      corners.add(`${x}${y}`);
      if (corners.size === 4) mark('corners');
    }
    if (target.closest('#copyright') && event.detail === 2) mark('thanos');
  });
  root.addEventListener('scroll', () => {
    if (window.scrollY + window.innerHeight >= root.documentElement.scrollHeight - 8) mark('scroll');
  }, { passive: true });

  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  if (hour === 3 && minute === 33) {
    const scare = root.createElement('p');
    scare.textContent = 'Señal perdida.';
    root.body.prepend(scare);
  }
}

function beep(): void {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 440;
  gain.gain.value = 0.03;
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.08);
}
