import { act } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

describe('Project Dashboard', () => {
  it('loads dashboard under 2 seconds', () => {
    const started = performance.now();
    render(<App />);
    const ended = performance.now();

    expect(ended - started).toBeLessThan(2000);
  });

  it('renders quick stats and project cards', () => {
    render(<App />);

    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    expect(screen.getAllByText('Active Projects').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/phase progress/i).length).toBeGreaterThan(0);
  });

  it('filters projects by name from search input', async () => {
    const user = userEvent.setup();
    render(<App />);

    const search = screen.getByRole('searchbox', { name: /search projects/i });
    await user.type(search, 'apollo');

    const projectTitle = screen.getByRole('heading', { level: 3, name: /apollo migration/i });
    expect(projectTitle).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: /zephyr mobile/i })).not.toBeInTheDocument();
  });

  it('opens and submits create project modal', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /create project/i }));
    await user.type(screen.getByLabelText(/project name/i), 'Phoenix API');
    await user.type(screen.getByLabelText(/owner/i), 'Rina');
    await user.click(screen.getByRole('button', { name: /save project/i }));

    expect(screen.getByRole('heading', { level: 3, name: /phoenix api/i })).toBeInTheDocument();
  });

  it('updates activity feed in real-time', () => {
    vi.useFakeTimers();
    render(<App />);

    const activitySection = screen.getByRole('heading', { name: /recent activity/i }).closest('aside');
    expect(activitySection).not.toBeNull();

    const initial = within(activitySection as HTMLElement).getAllByTestId('activity-item').length;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const updated = within(activitySection as HTMLElement).getAllByTestId('activity-item').length;
    expect(updated).toBeGreaterThan(initial);

    vi.useRealTimers();
  });
});
