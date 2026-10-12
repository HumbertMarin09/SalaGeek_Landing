const DESTRUCTIVE = [
  { name: 'DROP', pattern: /\bDROP\b/i },
  { name: 'TRUNCATE', pattern: /\bTRUNCATE\b/i },
  { name: 'DELETE FROM', pattern: /\bDELETE\s+FROM\b/i },
  { name: 'ALTER TABLE ... DROP', pattern: /\bALTER\s+TABLE\b[\s\S]*?\bDROP\b/i },
  { name: 'RENAME', pattern: /\bRENAME\s+(TABLE|COLUMN)\b/i },
];

export function findDestructiveSql(sql: string): string[] {
  const withoutComments = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '');
  return DESTRUCTIVE.filter((rule) => rule.pattern.test(withoutComments)).map((rule) => rule.name);
}
