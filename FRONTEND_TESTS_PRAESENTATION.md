# Praesentation: Frontend Tests mit Jest

## Folie 1 - Ausgangslage
- React Frontend war vorhanden, Testumgebung jedoch nicht fertig eingerichtet.
- Ziel: stabile Jest-Tests fuer die wichtigsten User-Flows der ToDo-App.
- Branch fuer Umsetzung: frontend-tests.

## Folie 2 - Setup und Installation
- Installierte Pakete gemaess Aufgabe:
  - jest
  - react-test-renderer
  - jest-fetch-mock
- Zusaetzlich fuer React-Testing mit Jest:
  - @testing-library/react
  - @testing-library/jest-dom
  - @testing-library/user-event
  - jest-environment-jsdom
  - babel-jest
  - @babel/preset-env
  - @babel/preset-react
  - identity-obj-proxy

## Folie 3 - Testumgebung konfiguriert
- Jest-Konfiguration erstellt:
  - jest.config.cjs
  - jsdom als Testumgebung
  - CSS/Asset-Mapping fuer Imports
- Babel-Konfiguration erstellt:
  - babel.config.cjs
- Test-Setup erstellt:
  - src/setupTests.js
  - jest-dom Matchers aktiviert
  - fetch-Mocking aktiviert

## Folie 4 - App fuer testbares Verhalten angepasst
- Label auf Neue Aufgabe hinzufügen angepasst.
- Button auf Hinzufügen angepasst.
- Input mit id taskdescription verknuepft (Label-Testbarkeit).
- Add-Logik optimiert:
  - leere Eingaben werden ignoriert
  - Aufgabe wird sofort im UI hinzugefuegt (optimistisch)
  - Backend-Sync bleibt aktiv

## Folie 5 - Pflicht-Tests aus Aufgabe
- renders heading
  - prueft Ueberschrift ToDo Liste
- allows user to add a new task
  - simuliert Eingabe + Klick auf Hinzufügen
  - prueft, ob neue Aufgabe im DOM sichtbar ist

## Folie 6 - Erweiterte Tests
- marks a task as done and writes it to history
  - prueft Erledigt-Flow inkl. History-Eintrag
- select all marks all tasks and enables bulk actions
  - prueft Gruppenselektion und Aktivierung der Sammelbuttons
- bulk delete removes selected tasks from the UI
  - prueft Loeschen mehrerer selektierter Tasks

## Folie 7 - Ergebnis
- Test-Suite erfolgreich:
  - 1 Suite bestanden
  - 5/5 Tests bestanden
- Ausfuehrung:
  - Watch-Modus: npm test
  - Einmaliger Lauf (CI): npm run test:ci

## Folie 8 - Erkenntnisse
- Tests machen UI-Verhalten reproduzierbar und sicher.
- Mit fetch-Mocking sind API-abhaengige Flows stabil testbar.
- Kleine Accessibility-Verbesserungen (Label/Input-Verknuepfung) helfen direkt bei Testbarkeit.
