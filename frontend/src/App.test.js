import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App component', () => {
  /**
   * Testet das Rendern der Ueberschrift.
   */
  test('renders heading', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { name: /ToDo Liste/i });
    expect(headingElement).toBeInTheDocument();
  });

  /**
   * Testet das Hinzufuegen einer Aufgabe.
   */
  test('allows user to add a new task', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButtonElement = screen.getByRole('button', { name: /Hinzufügen/i });
    const taskName = 'Buy groceries';

    fireEvent.change(inputElement, { target: { value: taskName } });
    fireEvent.click(addButtonElement);

    const newTaskElement = screen.getByText(/Buy groceries/i);
    expect(newTaskElement).toBeInTheDocument();
  });

  test('marks a task as done and writes it to history', async () => {
    fetch.mockResponseOnce(JSON.stringify([{ taskdescription: 'Task A' }]));

    render(<App />);

    await screen.findByText(/Task 1: Task A/i);
    fireEvent.click(screen.getByTitle(/Als erledigt markieren/i));

    expect(screen.getByText(/ToDo History/i)).toBeInTheDocument();
    expect(screen.getByText(/^1\. Task A$/i)).toBeInTheDocument();
  });

  test('select all marks all tasks and enables bulk actions', async () => {
    fetch.mockResponseOnce(JSON.stringify([
      { taskdescription: 'Task 1' },
      { taskdescription: 'Task 2' }
    ]));

    render(<App />);

    await screen.findByText(/Task 1: Task 1/i);
    fireEvent.click(screen.getByLabelText(/Alle markieren/i));

    expect(screen.getByText(/2 ausgewaehlt/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ausgewaehlte erledigen/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Ausgewaehlte loeschen/i })).toBeEnabled();
  });

  test('bulk delete removes selected tasks from the UI', async () => {
    fetch.mockResponses(
      [JSON.stringify([{ taskdescription: 'Task 1' }, { taskdescription: 'Task 2' }]), { status: 200 }],
      [JSON.stringify({}), { status: 200 }],
      [JSON.stringify({}), { status: 200 }],
      [JSON.stringify([]), { status: 200 }]
    );

    render(<App />);

    await screen.findByText(/Task 1: Task 1/i);
    fireEvent.click(screen.getByLabelText(/Alle markieren/i));
    fireEvent.click(screen.getByRole('button', { name: /Ausgewaehlte loeschen/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Task 1: Task 1/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Task 2: Task 2/i)).not.toBeInTheDocument();
    });
  });
});
