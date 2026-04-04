import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App component', () => {

  // =============================================
  // 1. Neues Element hinzufügen
  // =============================================
  test('fügt ein neues Element zur Aufgabenliste hinzu, wenn der Benutzer einen Eintrag eingibt und auf Hinzufügen klickt', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButton = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: 'Einkaufen gehen' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/Einkaufen gehen/i)).toBeInTheDocument();
  });

  // =============================================
  // 2. Korrekte Anzahl von Elementen anzeigen
  // =============================================
  test('zeigt die korrekte Anzahl von Elementen in der Aufgabenliste an', async () => {
    fetch.mockResponseOnce(JSON.stringify([
      { taskdescription: 'Task A' },
      { taskdescription: 'Task B' },
      { taskdescription: 'Task C' }
    ]));

    render(<App />);

    await screen.findByText(/Task 1: Task A/i);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  // =============================================
  // 3. Erledigt-Button funktioniert
  // =============================================
  test('markiert ein Element als erledigt, wenn der Erledigt-Button geklickt wird', async () => {
    fetch.mockResponseOnce(JSON.stringify([{ taskdescription: 'Task A' }]));

    render(<App />);

    await screen.findByText(/Task 1: Task A/i);
    fireEvent.click(screen.getByTitle(/Als erledigt markieren/i));

    const taskSpan = screen.getByText(/Task 1: Task A/i);
    expect(taskSpan).toHaveClass('todo-done');
  });

  // =============================================
  // 4. Element entfernen zeigt korrektes Verhalten
  // =============================================
  test('entfernt ein Element aus der Liste, wenn der Löschen-Button geklickt wird', async () => {
    fetch.mockResponses(
      [JSON.stringify([{ taskdescription: 'Task zum Löschen' }]), { status: 200 }],
      [JSON.stringify({}), { status: 200 }],
      [JSON.stringify([]), { status: 200 }]
    );

    render(<App />);

    await screen.findByText(/Task zum Löschen/i);
    fireEvent.click(screen.getByTitle(/Todo loeschen/i));

    await waitFor(() => {
      expect(screen.queryByText(/Task zum Löschen/i)).not.toBeInTheDocument();
    });
  });

  // =============================================
  // 5. Leeres Element wird nicht hinzugefügt
  // =============================================
  test('fügt kein leeres Element hinzu, wenn der Benutzer nichts eingibt', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButton = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: '' } });
    fireEvent.click(addButton);

    const listItems = screen.queryAllByRole('listitem');
    expect(listItems).toHaveLength(0);
  });

  test('fügt kein Element hinzu, wenn nur Leerzeichen eingegeben werden', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButton = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: '   ' } });
    fireEvent.click(addButton);

    const listItems = screen.queryAllByRole('listitem');
    expect(listItems).toHaveLength(0);
  });

  // =============================================
  // 6. Fehlermeldung bei fehlgeschlagenem Laden
  // =============================================
  test('behandelt einen Fehler beim Laden der Aufgabenliste graceful', async () => {
    fetch.mockRejectOnce(new Error('Netzwerkfehler'));

    render(<App />);

    // App sollte trotz Fehler rendern ohne abzustürzen
    await waitFor(() => {
      expect(screen.getByText(/ToDo Liste/i)).toBeInTheDocument();
    });

    // Keine Tasks sollten angezeigt werden
    const listItems = screen.queryAllByRole('listitem');
    expect(listItems).toHaveLength(0);
  });

  // =============================================
  // 7. Aufgabenliste nach dem Laden korrekt angezeigt
  // =============================================
  test('zeigt die Aufgabenliste nach dem Laden korrekt an', async () => {
    fetch.mockResponseOnce(JSON.stringify([
      { taskdescription: 'Erste Aufgabe' },
      { taskdescription: 'Zweite Aufgabe' }
    ]));

    render(<App />);

    await screen.findByText(/Task 1: Erste Aufgabe/i);
    expect(screen.getByText(/Task 2: Zweite Aufgabe/i)).toBeInTheDocument();
  });

  // =============================================
  // 8. Doppelter Eintrag wird abgelehnt
  // =============================================
  test('lehnt einen doppelten Eintrag ab und zeigt ihn nicht doppelt an', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButton = screen.getByRole('button', { name: /Hinzufügen/i });

    // Erstes Mal hinzufügen
    fireEvent.change(inputElement, { target: { value: 'Duplikat-Test' } });
    fireEvent.click(addButton);

    // Zweites Mal gleichen Text hinzufügen
    fireEvent.change(inputElement, { target: { value: 'Duplikat-Test' } });
    fireEvent.click(addButton);

    const matches = screen.getAllByText(/Duplikat-Test/i);
    expect(matches).toHaveLength(1);
  });

  // =============================================
  // 9. Zusätzliche Tests für User-Stories
  // =============================================

  // Erledigt-Button in History schreiben
  test('schreibt erledigte Aufgabe in die History', async () => {
    fetch.mockResponseOnce(JSON.stringify([{ taskdescription: 'History Task' }]));

    render(<App />);

    await screen.findByText(/Task 1: History Task/i);
    fireEvent.click(screen.getByTitle(/Als erledigt markieren/i));

    expect(screen.getByText(/ToDo History/i)).toBeInTheDocument();
    expect(screen.getByText(/^1\. History Task$/i)).toBeInTheDocument();
  });

  // Alle markieren und Gruppenauswahl
  test('markiert alle Tasks mit "Alle markieren" und zeigt korrekte Anzahl', async () => {
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

  // Bulk Delete entfernt ausgewählte Tasks
  test('löscht alle ausgewählten Tasks bei Bulk Delete', async () => {
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

  // Eingabefeld wird nach Hinzufügen geleert
  test('leert das Eingabefeld nach dem Hinzufügen einer Aufgabe', () => {
    render(<App />);
    const inputElement = screen.getByLabelText(/Neue Aufgabe hinzufügen/i);
    const addButton = screen.getByRole('button', { name: /Hinzufügen/i });

    fireEvent.change(inputElement, { target: { value: 'Neue Aufgabe' } });
    fireEvent.click(addButton);

    expect(inputElement.value).toBe('');
  });

  // Bulk-Buttons deaktiviert wenn nichts ausgewählt
  test('deaktiviert Bulk-Buttons wenn keine Tasks ausgewählt sind', async () => {
    fetch.mockResponseOnce(JSON.stringify([{ taskdescription: 'Task A' }]));

    render(<App />);

    await screen.findByText(/Task 1: Task A/i);

    expect(screen.getByRole('button', { name: /Ausgewaehlte erledigen/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Ausgewaehlte loeschen/i })).toBeDisabled();
  });

  // History zeigt Platzhalter wenn leer
  test('zeigt Platzhaltertext wenn keine erledigten Todos vorhanden sind', () => {
    render(<App />);

    expect(screen.getByText(/Noch keine erledigten Todos/i)).toBeInTheDocument();
  });
});
