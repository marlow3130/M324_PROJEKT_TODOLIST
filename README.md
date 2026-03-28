# Kurzanleitung für die Installation der Entwicklungsumgebung zum Basisprojekt im Modul 324

## TLDR

ToDo-Liste mit React (frontend) und Spring (backend). Weitere Details sind in den
Kommentaren vor allem in App.js zu finden.

## Relevante Dateien in den Teil-Projekten (Verzeichnisse):

1. diese Beschreibung
2. frontend (Tools: npm und VSCode)
	* App.js

3. backend (Eclipse oder VS-Code)
	* DemoApplication.java
	* Task.java
	* pom.xml (JAR configuration, mit div. Plugins s.u.)

## Inbetriebnahme

1. forken oder clonen
1. *backend* in Eclipse importieren und mit Maven starten, oder in VS-Code via Java Extension Pack. Ohne Persistenz - nach dem Serverneustart sind die Todos futsch. Läuft auf default port 8080.
2. Im Terminal im *frontend* Verzeichnis
	1. mit `npm install` benötige Module laden
	2. mit `npm run dev` den Frontend-Server starten

## Benutzung

1. http://localhost:5173 zeigt das Frontend an. Hier kann man Tasks eingeben, die sofort darunter in der Liste mit einem *Done*-Button angezeigt werden.
2. Klickt man auf den *Done*-Button eines Tasks wird dieser aus der Liste entfernt (und natürlich auch von Backend-Server).
3. Die Task Beschreibungen müssen eindeutig (bzw. einmalig) sein.

## CI/CD Pipelines

Das Projekt verwendet zwei getrennte GitHub Actions Pipelines:

### 1. Test-Pipeline (`tests-pipeline.yml`)

- **Trigger:** Push oder Pull Request auf den `pipeline`-Branch
- **Jobs:**
  - **Backend Maven Tests** – führt `./mvnw test` im Container mit Java 21 (Temurin) aus
  - **Frontend Jest Tests** – führt `npm run test:ci` im Container mit Node.js 20 aus

### 2. Deploy-Pipeline (`deploy-pipeline.yml`)

- **Trigger:** Jeder Pull Request (alle Branches) und manuell via `workflow_dispatch`
- **Jobs:**
  - **Frontend Build (React)** – im `node:20-alpine` Container werden mit `npm ci` die Abhängigkeiten installiert und mit `npm run build` (Vite) die produktionsreifen HTML/JS/CSS-Dateien generiert
  - **Backend Build (WAR)** – im `maven:3.9.9-eclipse-temurin-17` Container wird mit `mvn -B clean package -DskipTests` ein WAR-File erzeugt

### Pipeline testen

Um die Deploy-Pipeline zu testen, muss ein Pull Request erstellt werden:

1. Neuen Branch erstellen und Änderungen committen
2. Branch pushen
3. Pull Request auf GitHub erstellen
4. Unter dem Tab **Actions** prüfen, ob beide Pipeline-Jobs (Frontend Build, Backend Build) erfolgreich durchlaufen

### Anstehende Aufgaben

- Erweiterung der Funktionalität durch die Lernenden
- Alternatives Backend für eine VM (WAR Konfiguration)
- Test Umbegung mit Unit-Tests erweitern

(Ausgaben für white-box debugging sind bereits auf den beiden Server vorhanden)
