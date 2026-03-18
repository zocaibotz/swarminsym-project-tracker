import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());

describe('ZOC-88 SQLite + seed', () => {
  it('initializes sqlite and verifies seeded project with phases', async () => {
    const dbPath = path.join(repoRoot, 'prisma', 'dev.db');
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    execSync('npx prisma db push', { cwd: repoRoot, stdio: 'pipe' });
    execSync('npx prisma db seed', { cwd: repoRoot, stdio: 'pipe' });

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const project = await prisma.project.findFirst({
      where: { name: 'Demo SWARMINSYM Project' },
      include: { phases: true },
    });

    expect(project).toBeTruthy();
    expect(project.phases.length).toBeGreaterThanOrEqual(3);

    await prisma.$disconnect();
  }, 20000);
});
