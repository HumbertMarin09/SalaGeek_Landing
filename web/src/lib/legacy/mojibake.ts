import iconv from 'iconv-lite';

const MARKER = /Ã.|Â.|├|│|┤/;

function tryRepair(value: string, encoding: 'latin1' | 'cp437' | 'cp850'): string | null {
  const bytes =
    encoding === 'latin1' ? Buffer.from(value, 'latin1') : iconv.encode(value, encoding);
  const repaired = bytes.toString('utf8');
  if (!repaired || repaired.includes('\uFFFD') || repaired === value) return null;
  return repaired;
}

export function repairMojibake(value: string): string {
  if (!MARKER.test(value)) return value;
  for (const encoding of ['latin1', 'cp437', 'cp850'] as const) {
    const repaired = tryRepair(value, encoding);
    if (repaired && !MARKER.test(repaired)) return repaired;
  }
  return value;
}
