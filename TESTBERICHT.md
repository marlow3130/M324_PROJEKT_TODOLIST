# Testbericht: Automatisierte Systemtests

## Übersicht

Dieser Testbericht dokumentiert die automatisierten System- und Integrationstests für die ToDo-App. Die Tests prüfen das Gesamtverhalten der Applikation aus Benutzer- und API-Sicht.

| Bereich | Framework | Anzahl Tests | Ergebnis |
|---------|-----------|:------------:|----------|
| Frontend | Jest + React Testing Library | 15 | Alle bestanden |
| Backend | JUnit 5 + Spring MockMvc | 9 | Alle bestanden |

---

## Frontend-Tests (Jest)

Die Frontend-Tests simulieren Benutzerinteraktionen mit der React-Applikation. API-Aufrufe werden mit `jest-fetch-mock` gemockt.

### Testfälle

| Nr. | Testfall | Beschreibung | Status |
|-----|----------|-------------|--------|
| 1 | Neues Element hinzufügen | Benutzer gibt Text ein und klickt "Hinzufügen" → Element erscheint in der Liste | Bestanden |
| 2 | Korrekte Anzahl anzeigen | Nach Laden von 3 Tasks zeigt die Liste 3 Listenelemente | Bestanden |
| 3 | Erledigt-Button | Klick auf Erledigt-Button setzt CSS-Klasse `todo-done` | Bestanden |
| 4 | Element entfernen | Klick auf Löschen-Button entfernt das Element aus der Liste | Bestanden |
| 5 | Leeres Element ablehnen | Leere Eingabe wird nicht hinzugefügt | Bestanden |
| 6 | Nur Leerzeichen ablehnen | Eingabe mit nur Leerzeichen wird nicht hinzugefügt | Bestanden |
| 7 | Fehler beim Laden | App stürzt nicht ab, wenn die API einen Fehler zurückgibt | Bestanden |
| 8 | Liste korrekt anzeigen | Nach Laden werden alle Tasks mit korrekter Nummerierung angezeigt | Bestanden |
| 9 | Duplikat ablehnen | Gleicher Text zweimal eingeben → nur einmal in der Liste | Bestanden |
| 10 | History schreiben | Erledigte Aufgabe erscheint in der ToDo History | Bestanden |
| 11 | Alle markieren | "Alle markieren" Checkbox selektiert alle Tasks, Zähler zeigt korrekte Anzahl | Bestanden |
| 12 | Bulk Delete | Ausgewählte Tasks werden alle gelöscht | Bestanden |
| 13 | Eingabefeld leeren | Nach Hinzufügen wird das Eingabefeld zurückgesetzt | Bestanden |
| 14 | Bulk-Buttons deaktiviert | Ohne Auswahl sind "Ausgewählte erledigen/löschen" Buttons deaktiviert | Bestanden |
| 15 | History Platzhalter | Ohne erledigte Todos wird "Noch keine erledigten Todos." angezeigt | Bestanden |

### Zusätzliche Tests für User-Stories

Die Tests 10–15 decken die zusätzlich implementierten Features ab:
- **Completed History** (Tests 10, 15): Prüft, ob erledigte Tasks in die History geschrieben werden und ob der Platzhaltertext korrekt angezeigt wird
- **Gruppenauswahl & Bulk Actions** (Tests 11, 12, 14): Prüft "Alle markieren", Bulk Delete und den deaktivierten Zustand der Bulk-Buttons
- **UX-Verhalten** (Test 13): Prüft, ob das Eingabefeld nach dem Hinzufügen geleert wird

---

## Backend-Tests (JUnit 5)

Die Backend-Tests prüfen die REST-API-Endpunkte des V1-Controllers sowohl über MockMvc (HTTP-Ebene) als auch über direkte Controller-Aufrufe.

### Testfälle

| Nr. | Testfall | Beschreibung | Status |
|-----|----------|-------------|--------|
| 1 | Context Loads | Spring Boot Applikation startet erfolgreich | Bestanden |
| 2 | Task über API hinzufügen | POST auf `/api/v1/tasks` fügt Task hinzu, GET gibt ihn zurück | Bestanden |
| 3 | Korrekte Anzahl | 3 Tasks hinzufügen → Liste hat Größe 3 | Bestanden |
| 4 | Duplikate ablehnen | Gleiche Beschreibung zweimal → nur 1 Task in der Liste | Bestanden |
| 5 | Task l��schen | Task hinzufügen und löschen → Liste ist leer | Bestanden |
| 6 | Leere Liste bei Start | Neue Controller-Instanz hat leere Task-Liste | Bestanden |
| 7 | Nicht existierenden Task löschen | Löschen eines unbekannten Tasks verändert die Liste nicht | Bestanden |
| 8 | Erstellungszeitpunkt | Neuer Task hat automatisch ein ISO-8601 `createdAt`-Datum | Bestanden |
| 9 | Mehrere Tasks hinzufügen/löschen | 3 Tasks hinzufügen, mittleren löschen → A und C bleiben | Bestanden |

---

## Nicht automatisierte Tests / Bekannte Einschränkungen

Folgende Aspekte wurden bewusst **nicht** automatisiert:

| Aspekt | Grund | Empfohlene Prüfmethode |
|--------|-------|----------------------|
| CSS-Styling / Layout | Visuelle Tests erfordern Screenshot-Vergleich | Manuelles Review |
| Browser-Kompatibilität | Verschiedene Browser müssten getestet werden | Manueller Cross-Browser-Test |
| Performance / Ladezeiten | Abhängig von Infrastruktur | Manuell mit DevTools |
| localStorage Persistenz | Browserabhängig, schwer in jsdom zu testen | Manueller Test im Browser |

---

## Testausführung

### Frontend
```bash
cd frontend
npm run test:ci
```

### Backend
```bash
cd backend
./mvnw test
```

---

## Fazit

Alle 24 automatisierten Tests (15 Frontend + 9 Backend) bestehen erfolgreich. Die Tests decken die 8 vorgegebenen Testfälle sowie zusätzliche Tests für die implementierten User-Stories (History, Gruppenauswahl, Bulk Actions) ab. Die Applikation ist funktionsfähig und die Tests können in der CI/CD-Pipeline automatisch ausgeführt werden.
