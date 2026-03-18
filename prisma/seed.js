const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: 'demo.owner@swarminsym.dev' },
    update: { name: 'Demo Owner' },
    create: {
      email: 'demo.owner@swarminsym.dev',
      name: 'Demo Owner',
    },
  });

  await prisma.project.deleteMany({ where: { name: 'Demo SWARMINSYM Project' } });

  const project = await prisma.project.create({
    data: {
      name: 'Demo SWARMINSYM Project',
      description: 'Demo seeded project for ORM verification',
      status: 'active',
      ownerId: owner.id,
      phases: {
        create: [
          {
            name: 'Planning',
            order: 1,
            status: 'completed',
            detail: {
              create: {
                objective: 'Define SDD/TDD pipeline and milestones',
                notes: 'Validated architecture constraints and sprint scope',
                acceptanceChecks: 'Spec approved by stakeholders',
              },
            },
            decisions: {
              create: [
                {
                  title: 'Use Prisma ORM',
                  rationale: 'Type-safe ORM with multi-database support',
                  impact: 'Faster schema evolution and migrations',
                  authorId: owner.id,
                },
              ],
            },
            artifacts: {
              create: [
                {
                  type: 'document',
                  name: 'spec.md',
                  uri: 'docs/spec/ZOC-88.md',
                  metadata: 'Seeded artifact',
                  authorId: owner.id,
                },
              ],
            },
          },
          {
            name: 'Implementation',
            order: 2,
            status: 'in_progress',
            detail: {
              create: {
                objective: 'Implement schema, migration scripts and seed',
                notes: 'SQLite first, portability via dedicated provider schemas',
                acceptanceChecks: 'All tests green',
              },
            },
            problems: {
              create: [
                {
                  title: 'Initial schema missing',
                  description: 'No schema.prisma existed in repository',
                  severity: 'medium',
                  status: 'resolved',
                  authorId: owner.id,
                },
              ],
            },
            resolutions: {
              create: [
                {
                  summary: 'Created complete Prisma schema and seed script',
                  details: 'Added all required models and relationships',
                  authorId: owner.id,
                },
              ],
            },
            debugLogs: {
              create: [
                {
                  message: 'Executed prisma db push successfully on SQLite',
                  level: 'info',
                  metadata: '{"step":"db-push"}',
                  authorId: owner.id,
                },
              ],
            },
          },
          {
            name: 'Validation',
            order: 3,
            status: 'pending',
            detail: {
              create: {
                objective: 'Run integration and security checks',
                notes: 'Awaiting CI run',
                acceptanceChecks: 'All acceptance criteria pass',
              },
            },
          },
        ],
      },
    },
    include: { phases: true },
  });

  return project;
}

main()
  .then(async (project) => {
    console.log(`Seeded project: ${project.name} (${project.phases.length} phases)`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
