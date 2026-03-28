# Arbeitsjournal - ToDo App Implementierungen

## Projekt
- Modul: M324 Projekt ToDoList
- Zeitraum: 14.03.2026 - 21.03.2026
- Fokus: Erweiterung der bestehenden React + Spring Boot ToDo-Applikation

## Ziele der Implementierungen
- ToDos einzeln als erledigt markieren
- ToDos einzeln loeschen
- Erledigte ToDos in einer History dokumentieren
- Mehrere ToDos gleichzeitig selektieren
- Sammelaktionen fuer selektierte ToDos (erledigen/loeschen)

## Umgesetzte Features

### 1. Trennung von Erledigen und Loeschen
- Ein Haken-Button bleibt fuer das Markieren als erledigt.
- Ein separater Kreuz-Button (X) wurde fuer das Loeschen hinzugefuegt.
- Vorteil: Klarere Bedienung, weniger Fehlklicks, eindeutige Aktion pro Button.

### 2. ToDo History fuer erledigte Eintraege
- Beim Markieren eines ToDos als erledigt wird ein History-Eintrag erstellt.
- Jeder Eintrag enthaelt:
  - Task-Beschreibung
  - Zeitpunkt der Erledigung
- Die History wird in localStorage gespeichert und ist nach Reload weiterhin sichtbar.
- Vorteil: Nachvollziehbarkeit, welche Aufgaben bereits abgeschlossen wurden.

### 3. Group Select (Mehrfachauswahl)
- Pro Todo wurde eine Checkbox zur Selektion eingebaut.
- Es gibt einen "Alle markieren"-Schalter.
- Die Anzahl selektierter Eintraege wird live angezeigt.
- Selektierte Zeilen werden visuell hervorgehoben.
- Vorteil: Vorbereitung fuer effiziente Massenaktionen.

### 4. Sammelaktionen auf selektierte ToDos
- "Ausgewaehlte erledigen":
  - markiert alle selektierten ToDos als erledigt
  - uebernimmt neue Eintraege in die History
- "Ausgewaehlte loeschen":
  - loescht alle selektierten ToDos ueber den bestehenden Backend-Endpoint
- Buttons sind nur aktiv, wenn mindestens ein Todo selektiert ist.
- Vorteil: deutlich schnellere Bearbeitung groesserer Listen.

## Technische Umsetzung (Kurz)
- Frontend: React (State-Management mit useState/useEffect)
- Backend: bestehende Spring Boot Endpoints weiterverwendet
  - Laden: GET /
  - Erstellen: POST /tasks
  - Loeschen: POST /delete
- Nach Aenderungen wird die Liste neu geladen, damit Frontend und Backend synchron bleiben.

## Getestete Punkte
- Build erfolgreich ausgefuehrt (Vite Production Build)
- Einzelloeschung funktioniert
- Erledigt-Status funktioniert
- History-Anzeige funktioniert inkl. Persistenz
- Mehrfachselektion und Sammelaktionen funktionieren

## Herausforderungen und Loesungen
- Herausforderung: "Erledigt" und "Loeschen" waren anfangs nicht klar getrennt.
  - Loesung: Zwei getrennte Buttons mit eigener Logik und eigenem Styling.
- Herausforderung: Mehrfachauswahl musste mit Reloads konsistent bleiben.
  - Loesung: Selektion und erledigte Stati beim Nachladen auf vorhandene Todos abgleichen.
- Herausforderung: History sollte nicht bei jedem Reload verschwinden.
  - Loesung: Speicherung in localStorage.

## Fazit
Die ToDo-App wurde von einer einfachen Einzelaktion-Anwendung zu einer deutlich produktiveren Version erweitert. Durch History, Gruppenselektion und Sammelaktionen ist die Bedienung nun effizienter und besser nachvollziehbar.

## Backend Arbeitsjournal (TDD)

### Ziel
- Backend-Testbasis erweitern und ein neues Verhalten per TDD entwickeln.
- Alle Tests sollen mit einem einzigen Maven-Testlauf ueber DemoApplicationTests starten.

### Durchgefuehrte Schritte
1. Bestehenden Testbestand geprueft:
  - contextLoads war vorhanden.
2. Zusaetzliche bestehende Verhaltens-Tests hinzugefuegt:
  - Duplikate bei addTask werden ignoriert.
  - delTask entfernt vorhandene Tasks.
3. Optionalen MockMvc-Test fuer GET / hinzugefuegt:
  - Erwartet HTTP 200 und JSON-Array.
4. Neuer TDD-Test fuer neues Verhalten erstellt:
  - Task soll bei Erzeugung ein Erfassungsdatum besitzen (Getter getCreatedAt).
  - Dieser Test ist zuerst fehlgeschlagen (rot).
5. Implementierung minimal erweitert:
  - Task um Feld createdAt erweitert.
  - Im Standard-Konstruktor wird createdAt mit LocalDateTime.now().toString() gesetzt.
  - Getter/Setter fuer createdAt ergaenzt.
6. Gesamten Testlauf erneut ausgefuehrt:
  - Alle Tests bestehen (gruen).

### Technische Hinweise
- In pom.xml wurde ein JUnit-Versionskonflikt bereinigt, indem die explizite junit-jupiter-engine Dependency entfernt wurde.
- Damit verwendet das Projekt konsistent die von Spring Boot verwalteten Test-Versionen.

### Endstand der Tests
- Anzahl Tests in DemoApplicationTests: 5
- Ergebnis: alle bestanden

## TDD Zusammenfassung (Hausaufgabe)

### Vorteile von TDD
- Fruehes Finden von Fehlern durch schnelle Feedbackzyklen.
- Klarere Anforderungen: Tests beschreiben erwartetes Verhalten.
- Bessere Code-Struktur und modularere Klassen.
- Hohe Regressionssicherheit bei spaeteren Aenderungen.
- Refactoring wird sicherer, da Tests als Schutznetz dienen.

### Nachteile von TDD
- Hoeherer Initialaufwand, besonders zu Projektbeginn.
- Lernkurve fuer sinnvolle Testgestaltung.
- Bei haeufig wechselnden Anforderungen entstehen oft Test-Anpassungen.
- Schlecht geschriebene Tests koennen Entwicklung ausbremsen.
- TDD ersetzt keine Integrations- oder End-to-End-Tests.

### Fazit zu TDD
TDD erhoeht mittel- und langfristig die Qualitaet und Wartbarkeit deutlich, wenn Tests fokussiert, stabil und verstaendlich gehalten werden.
