# Pipeline-Dokumentation: Automatisierte Tests in der CI/CD Pipeline

## Übersicht

Die `deploy-pipeline.yml` wurde um eine **Test-Stage** erweitert. Die Unit-Tests (JUnit für Backend, Jest für Frontend) laufen automatisch **nach dem Build**, um die Softwarequalität sicherzustellen. Erst wenn alle Tests bestehen, gilt die Pipeline als erfolgreich.

### Pipeline-Ablauf

```
Stage 1: Build                    Stage 2: Test
┌─────────────────┐               ┌─────────────────┐
│ frontend-build  │──── needs ───>│ frontend-test   │
│ (npm ci + build)│               │ (Jest Tests)    │
└─────────────────┘               └───────────────��─┘

┌─────────────────┐               ┌─────────────────┐
│ backend-build   │──── needs ───>│ backend-test    │
│ (mvn package)   │               │ (JUnit Tests)   │
└─────────────────┘               └─────────────────┘
```

---

## Frontend Test-Job: Erklärung der Befehle

```yaml
frontend-test:
  name: Frontend Jest Tests
  runs-on: ubuntu-latest
  needs: frontend-build
  container:
    image: node:20-alpine
  defaults:
    run:
      working-directory: frontend
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Install dependencies
      run: npm ci

    - name: Run frontend unit tests
      run: npm run test:ci
```

### Befehle im Detail

| Befehl / Konfiguration | Erklärung |
|------------------------|-----------|
| `needs: frontend-build` | Stellt sicher, dass der Test-Job erst nach erfolgreichem Build startet. Wenn der Build fehlschlägt, werden die Tests gar nicht ausgeführt — das spart Rechenzeit. |
| `container: image: node:20-alpine` | Verwendet **dasselbe Image** wie der Build-Job (`node:20-alpine`). Alpine ist ein minimales Linux-Image, das schnell heruntergeladen wird und wenig Speicher braucht. Node.js 20 ist die LTS-Version. |
| `uses: actions/checkout@v4` | Klont das Git-Repository in den Container, damit der Quellcode für die Tests verfügbar ist. Jeder Job in GitHub Actions startet mit einer sauberen Umgebung — daher muss der Code erneut ausgecheckt werden. |
| `npm ci` | Installiert die Abhängigkeiten **exakt** wie im `package-lock.json` definiert. Im Gegensatz zu `npm install` wird `npm ci` in CI/CD-Pipelines bevorzugt, weil es: (1) schneller ist, (2) den `node_modules`-Ordner komplett neu aufbaut, (3) garantiert reproduzierbare Builds liefert. |
| `npm run test:ci` | Führt die Jest-Tests aus. Das Script `test:ci` ist in der `package.json` als `jest --runInBand` definiert. `--runInBand` führt die Tests **sequentiell** statt parallel aus — das ist in CI-Umgebungen stabiler, da Container oft begrenzte Ressourcen haben. |

---

## Backend Test-Job: Erklärung der Befehle

```yaml
backend-test:
  name: Backend JUnit Tests
  runs-on: ubuntu-latest
  needs: backend-build
  container:
    image: maven:3.9.9-eclipse-temurin-17
  defaults:
    run:
      working-directory: backend
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Run backend unit tests
      run: mvn -B test
```

### Befehle im Detail

| Befehl / Konfiguration | Erklärung |
|------------------------|-----------|
| `needs: backend-build` | Der Test-Job hängt vom Build-Job ab. Tests laufen nur, wenn der Build erfolgreich war. |
| `container: image: maven:3.9.9-eclipse-temurin-17` | Verwendet **dasselbe Image** wie der Build-Job. Es enthält Maven 3.9.9 und Java 17 (Eclipse Temurin Distribution) — alles was zum Kompilieren und Testen nötig ist. |
| `uses: actions/checkout@v4` | Klont den Quellcode erneut, da jeder Job eine isolierte Umgebung hat. |
| `mvn -B test` | Führt die JUnit-Tests aus. Die Flags bedeuten: `-B` (Batch-Mode) unterdrückt interaktive Eingabeaufforderungen und Download-Fortschrittsbalken — das hält die Log-Ausgabe in der Pipeline sauber. `test` ist die Maven-Phase, die den Code kompiliert und alle Tests im Verzeichnis `src/test/java` ausführt. |

---

## Warum Tests nach dem Build?

Die Tests laufen **nach** dem Build (über `needs`), nicht gleichzeitig. Gründe:

1. **Schnelles Feedback:** Wenn der Code nicht einmal kompiliert (Build schlägt fehl), müssen die Tests gar nicht erst laufen.
2. **Ressourcen sparen:** Fehlgeschlagene Builds brechen die Pipeline früh ab — keine unnötige Rechenzeit für Tests.
3. **Klare Fehlerdiagnose:** Wenn der Build passt aber Tests fehlschlagen, weiß man sofort: Der Code kompiliert, aber die Logik stimmt nicht.

## Warum dieselben Container-Images?

Die Aufgabe verlangt, dieselben Images wie beim Build zu verwenden. Vorteile:

1. **Konsistenz:** Tests laufen in exakt derselben Umgebung wie der Build — keine "Works on my machine"-Probleme.
2. **Kein zusätzliches Setup:** Die Images (`node:20-alpine`, `maven:3.9.9-eclipse-temurin-17`) enthalten bereits alle nötigen Tools.
3. **Geschwindigkeit:** GitHub Actions cached häufig verwendete Container-Images — ein zweiter Pull des gleichen Images ist schneller.
