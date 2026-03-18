import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());

describe('ZOC-88 Prisma setup', () => {
  it('defines all required models in prisma/schema.prisma', () => {
    const schemaPath = path.join(repoRoot, 'prisma', 'schema.prisma');
    expect(fs.existsSync(schemaPath)).toBe(true);

    const schema = fs.readFileSync(schemaPath, 'utf8');
    for (const model of ['Project', 'Phase', 'PhaseDetail', 'Decision', 'Problem', 'Resolution', 'DebugLog', 'Artifact', 'User']) {
      expect(schema).toContain(`model ${model}`);
    }
  });

  it('includes migration scripts for postgresql/mysql/sqlserver', async () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    expect(packageJson.scripts?.['migrate:postgresql']).toBeTruthy();
    expect(packageJson.scripts?.['migrate:mysql']).toBeTruthy();
    expect(packageJson.scripts?.['migrate:sqlserver']).toBeTruthy();

    expect(fs.existsSync(path.join(repoRoot, 'prisma', 'migrations', 'postgresql', 'baseline.sql'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'prisma', 'migrations', 'mysql', 'baseline.sql'))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, 'prisma', 'migrations', 'sqlserver', 'baseline.sql'))).toBe(true);
  });
});
