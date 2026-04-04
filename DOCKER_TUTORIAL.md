# Docker-Tutorial: ToDo-App containerisieren

## Inhaltsverzeichnis

1. [Übersicht](#1-übersicht)
2. [Voraussetzungen](#2-voraussetzungen)
3. [Backend Dockerfile](#3-backend-dockerfile)
4. [Frontend Dockerfile](#4-frontend-dockerfile)
5. [CI/CD Pipeline — Build & Push der Images](#5-cicd-pipeline--build--push-der-images)
6. [Docker-Compose für lokalen Betrieb](#6-docker-compose-für-lokalen-betrieb)
7. [Lokales Starten und Testen](#7-lokales-starten-und-testen)
8. [Zusammenfassung](#8-zusammenfassung)

---

## 1. Übersicht

Dieses Tutorial beschreibt, wie die ToDo-App (Spring Boot Backend + React Frontend) in Docker-Container verpackt wird. Die Images werden über eine GitHub Actions Pipeline automatisch gebaut und in die **GitHub Container Registry (ghcr.io)** gepusht. Ein `docker-compose.yml` ermöglicht den lokalen Betrieb der gesamten Infrastruktur.

### Architektur

```
┌──────────────────┐     ┌──────────────────┐
│   Frontend       │     │   Backend        │
│   (nginx:alpine) │────>│   (Java 17 JRE)  │
│   Port 5173      │     │   Port 8080      │
└──────────────────┘     └──────────────────┘
        │                         │
   React SPA              Spring Boot WAR
   (Vite Build)           (Maven Build)
```

---

## 2. Voraussetzungen

- **Docker Desktop** installiert und gestartet
- **Git** installiert
- Zugriff auf das GitHub-Repository

---

## 3. Backend Dockerfile

**Datei:** `backend/Dockerfile`

Das Backend verwendet einen **Multi-Stage Build**:

```dockerfile
# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.war app.war
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.war"]
```

### Erklärung

| Zeile | Beschreibung |
|-------|-------------|
| `FROM maven:3.9.9-eclipse-temurin-17 AS build` | Verwendet ein Maven-Image mit Java 17 als Build-Umgebung |
| `COPY pom.xml .` / `COPY src ./src` | Kopiert den Quellcode in den Container |
| `RUN mvn -B clean package -DskipTests` | Baut das WAR-Artefakt (Tests werden übersprungen, da sie in der Test-Pipeline laufen) |
| `FROM eclipse-temurin:17-jre` | Schlankes Java-Runtime-Image für die Ausführung |
| `COPY --from=build ...` | Kopiert nur das fertige WAR aus der Build-Stage |
| `ENTRYPOINT ["java", "-jar", "app.war"]` | Spring Boot WAR ist dank eingebettetem Tomcat direkt ausführbar |

### Lokal bauen und testen

```bash
cd backend
docker build -t m324-todolist-backend:local .
docker run -p 8080:8080 m324-todolist-backend:local
```

Testen: `http://localhost:8080/api/v1/tasks` sollte `[]` zurückgeben.

---

## 4. Frontend Dockerfile

Für das Frontend wurde die **einfachste Variante** gewählt: Das Frontend wird im Container gebaut und die statischen Dateien werden in einen **nginx-Container** kopiert.

### nginx-Konfiguration

**Datei:** `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Die `try_files`-Direktive sorgt dafür, dass alle Routen auf `index.html` zurückfallen — das ist nötig für Single-Page-Applications (SPA).

### Dockerfile

**Datei:** `frontend/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Run
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Erklärung

| Zeile | Beschreibung |
|-------|-------------|
| `FROM node:20-alpine AS build` | Node.js 20 Alpine-Image zum Bauen |
| `COPY package.json package-lock.json ./` | Erst nur die Abhängigkeitsdateien kopieren (Docker-Cache-Optimierung) |
| `RUN npm ci` | Installiert exakt die Versionen aus dem Lockfile |
| `RUN npm run build` | Erzeugt statische Dateien in `/app/dist` (Vite Build) |
| `FROM nginx:alpine` | Schlankes nginx-Image für die Auslieferung |
| `COPY --from=build /app/dist ...` | Kopiert nur die fertigen Build-Dateien |
| `COPY nginx.conf ...` | Eigene nginx-Konfiguration für SPA-Routing |

### Lokal bauen und testen

```bash
cd frontend
docker build -t m324-todolist-frontend:local .
docker run -p 5173:80 m324-todolist-frontend:local
```

Testen: `http://localhost:5173` sollte die ToDo-App anzeigen.

---

## 5. CI/CD Pipeline — Build & Push der Images

Die bestehende `deploy-pipeline.yml` wurde um zwei Docker-Jobs erweitert, die nach erfolgreichem Build die Images in die **GitHub Container Registry** pushen.

**Datei:** `.github/workflows/deploy-pipeline.yml`

### Neue Umgebungsvariablen

```yaml
env:
  REGISTRY: ghcr.io
  BACKEND_IMAGE: ghcr.io/marlow3130/m324-todolist-backend
  FRONTEND_IMAGE: ghcr.io/marlow3130/m324-todolist-frontend
```

### Berechtigungen

```yaml
permissions:
  contents: read
  packages: write    # Nötig für Push in die GitHub Container Registry
```

### Docker-Job (Beispiel Backend)

```yaml
docker-backend:
  name: Docker Build & Push Backend
  runs-on: ubuntu-latest
  needs: backend-build
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push backend image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: ${{ env.BACKEND_IMAGE }}:latest,${{ env.BACKEND_IMAGE }}:${{ github.sha }}
```

### Pipeline-Ablauf

```
┌─────────────────┐     ┌──────────────────────┐
│ frontend-build  │────>│ docker-frontend       │
│ (npm ci + build)│     │ (build + push ghcr.io)│
└─────────────────┘     └──────────────────────┘

┌─────────────────┐     ┌──────────────────────┐
│ backend-build   │────>│ docker-backend        │
│ (mvn package)   │     │ (build + push ghcr.io)│
└─────────────────┘     └──────────────────────┘
```

Die Docker-Jobs laufen **nur bei Push auf `main`** (nicht bei Pull Requests), damit nicht bei jedem PR unnötig Images gebaut werden.

### Wichtige Variablen

| Variable | Beschreibung |
|----------|-------------|
| `secrets.GITHUB_TOKEN` | Wird automatisch von GitHub bereitgestellt — kein manuelles Setup nötig |
| `github.actor` | Der GitHub-Benutzername, der den Workflow ausgelöst hat |
| `github.sha` | Der Commit-Hash — wird als Image-Tag verwendet für Nachverfolgbarkeit |

---

## 6. Docker-Compose für lokalen Betrieb

**Datei:** `docker-compose.yml` (im Projekt-Root)

```yaml
services:
  backend:
    image: ghcr.io/marlow3130/m324-todolist-backend:latest
    ports:
      - "8080:8080"

  frontend:
    image: ghcr.io/marlow3130/m324-todolist-frontend:latest
    ports:
      - "5173:80"
    depends_on:
      - backend
```

### Erklärung

| Konfiguration | Beschreibung |
|---------------|-------------|
| `image: ghcr.io/...` | Verwendet die Images aus der GitHub Container Registry |
| `ports: "8080:8080"` | Backend ist auf `localhost:8080` erreichbar |
| `ports: "5173:80"` | Frontend (nginx auf Port 80) wird auf `localhost:5173` gemappt |
| `depends_on: backend` | Frontend-Container startet erst, wenn Backend läuft |

---

## 7. Lokales Starten und Testen

### Schritt 1: Bei GitHub Container Registry anmelden

```bash
echo <DEIN_GITHUB_TOKEN> | docker login ghcr.io -u <DEIN_USERNAME> --password-stdin
```

Falls die Images noch nicht in der Registry sind (erster Durchlauf), können sie lokal gebaut werden:

```bash
docker compose up --build
```

### Schritt 2: Container starten

```bash
docker compose up -d
```

### Schritt 3: Status prüfen

```bash
docker compose ps
```

Erwartete Ausgabe:
```
NAME                    IMAGE                                              STATUS
m324-...-backend-1      ghcr.io/marlow3130/m324-todolist-backend:latest    Up
m324-...-frontend-1     ghcr.io/marlow3130/m324-todolist-frontend:latest   Up
```

### Schritt 4: Testen

- **Frontend:** `http://localhost:5173` — ToDo-App sollte sichtbar sein
- **Backend API:** `http://localhost:8080/api/v1/tasks` — sollte `[]` zurückgeben

### Schritt 5: Container stoppen

```bash
docker compose down
```

---

## 8. Zusammenfassung

| Komponente | Technologie | Image |
|-----------|------------|-------|
| Backend | Spring Boot WAR + Java 17 | `ghcr.io/marlow3130/m324-todolist-backend` |
| Frontend | React (Vite) + nginx | `ghcr.io/marlow3130/m324-todolist-frontend` |

### Was wurde umgesetzt

1. **Backend Dockerfile** — Multi-Stage Build: Maven baut WAR, Java JRE führt es aus
2. **Frontend Dockerfile** — Multi-Stage Build: Node baut die SPA, nginx liefert sie aus
3. **CI/CD Pipeline** — Automatischer Build und Push in die GitHub Container Registry bei jedem Push auf `main`
4. **Docker-Compose** — Startet die gesamte Infrastruktur lokal mit einem einzigen Befehl
