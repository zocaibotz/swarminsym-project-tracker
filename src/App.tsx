import { FormEvent, useEffect, useMemo, useState } from 'react';

type Project = {
  id: number;
  name: string;
  owner: string;
  phase: 'Planning' | 'Design' | 'Build' | 'Testing' | 'Deploy';
  progress: number;
  active: boolean;
};

type Activity = {
  id: number;
  message: string;
  time: string;
};

const initialProjects: Project[] = [
  { id: 1, name: 'Apollo Migration', owner: 'Nora', phase: 'Build', progress: 64, active: true },
  { id: 2, name: 'Zephyr Mobile', owner: 'Dion', phase: 'Testing', progress: 82, active: true },
  { id: 3, name: 'Helios Portal', owner: 'Tara', phase: 'Design', progress: 37, active: true }
];

const initialActivities: Activity[] = [
  { id: 1, message: 'Apollo Migration moved to Build checkpoint.', time: 'Just now' },
  { id: 2, message: 'Zephyr Mobile test suite reached 91% pass rate.', time: '2 min ago' },
  { id: 3, message: 'Helios Portal design review approved.', time: '9 min ago' }
];

const phaseDefaults: Record<Project['phase'], number> = {
  Planning: 10,
  Design: 30,
  Build: 55,
  Testing: 80,
  Deploy: 100
};

function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newPhase, setNewPhase] = useState<Project['phase']>('Planning');

  useEffect(() => {
    const timer = setInterval(() => {
      setActivities((prev) => {
        const nextId = prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1;
        const randomProject = projects[Math.floor(Math.random() * projects.length)]?.name ?? 'New Project';
        return [
          {
            id: nextId,
            message: `${randomProject} activity heartbeat synced.`,
            time: 'Live'
          },
          ...prev
        ].slice(0, 8);
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [projects]);

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  const quickStats = useMemo(() => {
    const activeProjects = projects.filter((project) => project.active).length;
    const avgProgress = Math.round(projects.reduce((sum, item) => sum + item.progress, 0) / projects.length);

    return {
      activeProjects,
      avgProgress,
      totalActivities: activities.length
    };
  }, [projects, activities]);

  const createProject = (event: FormEvent) => {
    event.preventDefault();
    if (!newName.trim() || !newOwner.trim()) {
      return;
    }

    const created: Project = {
      id: projects.length + 1,
      name: newName.trim(),
      owner: newOwner.trim(),
      phase: newPhase,
      progress: phaseDefaults[newPhase],
      active: true
    };

    setProjects((prev) => [created, ...prev]);
    setActivities((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1;
      return [
        {
          id: nextId,
          message: `${created.name} was created by ${created.owner}.`,
          time: 'Now'
        },
        ...prev
      ];
    });

    setNewName('');
    setNewOwner('');
    setNewPhase('Planning');
    setShowModal(false);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Project Dashboard</h1>
              <p className="text-sm text-slate-600">Track active projects, milestones, and live activity.</p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              onClick={() => setShowModal(true)}
            >
              Create Project
            </button>
          </div>
        </header>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Stats</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat title="Active Projects" value={quickStats.activeProjects.toString()} />
            <Stat title="Average Progress" value={`${quickStats.avgProgress}%`} />
            <Stat title="Activity Events" value={quickStats.totalActivities.toString()} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Active Projects</h2>
              <label className="flex w-full max-w-sm flex-col text-sm text-slate-700" htmlFor="project-search">
                Search projects
                <input
                  id="project-search"
                  role="searchbox"
                  type="search"
                  placeholder="Search by project name"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="mt-1 rounded-lg border border-slate-300 px-3 py-2 outline-none ring-indigo-500 focus:ring"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredProjects.map((project) => (
                <article key={project.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{project.name}</h3>
                    <span className="text-xs font-medium text-slate-500">{project.phase}</span>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">Owner: {project.owner}</p>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Phase progress</p>
                  <div className="h-2 rounded-full bg-slate-200" aria-label={`Progress for ${project.name}`}>
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs font-semibold text-slate-700">{project.progress}%</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Live</span>
            </div>
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li key={activity.id} data-testid="activity-item" className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-800">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Create Project</h2>
            <form className="space-y-3" onSubmit={createProject}>
              <label className="block text-sm text-slate-700">
                Project name
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />
              </label>

              <label className="block text-sm text-slate-700">
                Owner
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={newOwner}
                  onChange={(event) => setNewOwner(event.target.value)}
                />
              </label>

              <label className="block text-sm text-slate-700">
                Phase
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={newPhase}
                  onChange={(event) => setNewPhase(event.target.value as Project['phase'])}
                >
                  {Object.keys(phaseDefaults).map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default App;
