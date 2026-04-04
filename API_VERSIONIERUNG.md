# Versionierung einer REST-Schnittstelle mit Java & Spring Boot

## Inhaltsverzeichnis

1. [Einfuehrung](#1-einfuehrung)
2. [Uebersicht ueber die Methoden zur Versionierung](#2-uebersicht-ueber-die-methoden-zur-versionierung)
3. [Bewertung der Methoden](#3-bewertung-der-methoden)
4. [Begruendung fuer die gewaehlte Methode](#4-begruendung-fuer-die-gewaehlte-methode)
5. [Schritt-fuer-Schritt-Anleitung zur Implementierung](#5-schritt-fuer-schritt-anleitung-zur-implementierung)
6. [Zusammenfassung und Schlussfolgerungen](#6-zusammenfassung-und-schlussfolgerungen)
7. [Literatur](#7-literatur)

---

## 1. Einfuehrung

Bei der Entwicklung von REST-APIs mit Spring Boot ist die **API-Versionierung** ein zentrales Thema. Sobald eine API von Clients genutzt wird, koennen aenderungen an der Schnittstelle (z. B. neue Felder, geaenderte Datenstrukturen, entfernte Endpunkte) bestehende Clients beschaedigen. Versionierung stellt sicher, dass:

- **Abwaertskompatibilitaet** gewahrt bleibt – aeltere Clients funktionieren weiterhin.
- **Neue Features** unabhaengig eingefuehrt werden koennen, ohne bestehende Integrationen zu stoeren.
- **Parallelbetrieb** mehrerer API-Versionen moeglich ist, um eine sanfte Migration zu ermoeglichen.

Die Frage ist: **Wie fuegt man die Versionsnummer in die API ein?** Es gibt mehrere etablierte Methoden, die sich in Sichtbarkeit, Flexibilitaet und Komplexitaet unterscheiden.

---

## 2. Uebersicht ueber die Methoden zur Versionierung

### 2.1 URI-Path-Versionierung (URL-Versionierung)

Die Version wird direkt in den URL-Pfad eingebettet.

```
GET /api/v1/tasks
GET /api/v2/tasks
```

**Spring Boot Umsetzung:**
```java
@RestController
@RequestMapping("/api/v1")
public class TaskControllerV1 { ... }

@RestController
@RequestMapping("/api/v2")
public class TaskControllerV2 { ... }
```

### 2.2 Request-Parameter-Versionierung

Die Version wird als Query-Parameter uebergeben.

```
GET /api/tasks?version=1
GET /api/tasks?version=2
```

**Spring Boot Umsetzung:**
```java
@GetMapping(value = "/api/tasks", params = "version=1")
public List<Task> getTasksV1() { ... }

@GetMapping(value = "/api/tasks", params = "version=2")
public List<TaskV2> getTasksV2() { ... }
```

### 2.3 Custom-Header-Versionierung

Die Version wird ueber einen benutzerdefinierten HTTP-Header uebermittelt.

```
GET /api/tasks
Header: X-API-Version: 1
```

**Spring Boot Umsetzung:**
```java
@GetMapping(value = "/api/tasks", headers = "X-API-Version=1")
public List<Task> getTasksV1() { ... }

@GetMapping(value = "/api/tasks", headers = "X-API-Version=2")
public List<TaskV2> getTasksV2() { ... }
```

### 2.4 Media-Type-Versionierung (Content Negotiation)

Die Version wird im `Accept`-Header als benutzerdefinierter Media-Type angegeben.

```
GET /api/tasks
Accept: application/vnd.todoapp.v1+json
```

**Spring Boot Umsetzung:**
```java
@GetMapping(value = "/api/tasks", produces = "application/vnd.todoapp.v1+json")
public List<Task> getTasksV1() { ... }

@GetMapping(value = "/api/tasks", produces = "application/vnd.todoapp.v2+json")
public List<TaskV2> getTasksV2() { ... }
```

---

## 3. Bewertung der Methoden

### Bewertungsmatrix

| Kriterium               | URI-Path       | Request-Parameter | Custom Header   | Media Type      |
|--------------------------|:--------------:|:-----------------:|:---------------:|:---------------:|
| **Einfachheit**          | ★★★★★         | ★★★★☆            | ★★★☆☆          | ★★☆☆☆          |
| **Sichtbarkeit**         | ★★★★★         | ★★★★☆            | ★★☆☆☆          | ★☆☆☆☆          |
| **Caching**              | ★★★★★         | ★★★★☆            | ★★★☆☆          | ★★★☆☆          |
| **Browser-Testbarkeit**  | ★★★★★         | ★★★★★            | ★★☆☆☆          | ★☆☆☆☆          |
| **Flexibilitaet**        | ★★★☆☆         | ★★★☆☆            | ★★★★☆          | ★★★★★          |
| **REST-Konformitaet**    | ★★★☆☆         | ★★☆☆☆            | ★★★★☆          | ★★★★★          |
| **Dokumentierbarkeit**   | ★★★★★         | ★★★★☆            | ★★★☆☆          | ★★☆☆☆          |

### Detaillierte Bewertung

#### URI-Path-Versionierung
| Vorteile | Nachteile |
|----------|-----------|
| Sofort sichtbar und verstaendlich | URL aendert sich bei neuer Version |
| Hervorragend cachebar (jede Version = eigene URL) | Kann als „un-RESTful" angesehen werden, da die Ressource sich nicht aendert |
| Einfach im Browser testbar | Code-Duplikation zwischen Versionen moeglich |
| Weit verbreitet (Google, Twitter, Facebook) | |
| Einfache Dokumentation mit Swagger/OpenAPI | |

#### Request-Parameter-Versionierung
| Vorteile | Nachteile |
|----------|-----------|
| URL der Ressource bleibt gleich | Parameter kann vergessen werden (Default noetig) |
| Relativ einfach umzusetzen | Weniger sichtbar als URL-Pfad |
| Optional mit Default-Version | Routing-Logik wird komplexer |

#### Custom-Header-Versionierung
| Vorteile | Nachteile |
|----------|-----------|
| URL bleibt sauber | Im Browser nicht direkt testbar |
| Trennung von Adressierung und Versionierung | Clients muessen Header bewusst setzen |
| Flexibel erweiterbar | Weniger sichtbar, hoehere Einstiegshuerde |

#### Media-Type-Versionierung
| Vorteile | Nachteile |
|----------|-----------|
| Am staerksten REST-konform | Sehr komplex in der Umsetzung |
| Feine Kontrolle ueber Repraesentationen | Schwer im Browser testbar |
| Saubere Trennung | Erfordert Custom-Content-Type-Handling |
| | Dokumentation aufwaendiger |

---

## 4. Begruendung fuer die gewaehlte Methode

### Entscheidung: **URI-Path-Versionierung**

Wir haben uns fuer die **URI-Path-Versionierung** entschieden. Die Gruende:

1. **Einfachheit**: Die Methode ist die einfachste zu implementieren und zu verstehen. Jede Version erhaelt ein eigenes Praefix (`/api/v1/`, `/api/v2/`), das direkt im `@RequestMapping` angegeben wird.

2. **Sichtbarkeit**: Die aktuelle API-Version ist sofort in der URL erkennbar. Entwickler und Tester sehen auf den ersten Blick, welche Version sie ansprechen.

3. **Browser-Testbarkeit**: GET-Endpunkte koennen direkt im Browser aufgerufen werden – kein spezielles Tool (wie Postman mit Custom-Headers) noetig.

4. **Caching**: Jede Version hat eigene URLs, was HTTP-Caching trivial macht. Keine Cache-Invalidierung bei Versionswechsel noetig.

5. **Industrie-Standard**: Grosse APIs (Google Maps, Twitter, Stripe, GitHub) setzen auf URL-Versionierung. Entwickler sind damit vertraut.

6. **Dokumentation**: Tools wie Swagger/OpenAPI koennen verschiedene Versionen klar voneinander getrennt darstellen.

7. **Passend fuer unser Projekt**: Fuer unsere ToDo-App mit ueberschaubarer Komplexitaet ist URI-Path die pragmatischste Loesung. Die theoretischen Vorteile von Media-Type-Versionierung (REST-Reinheit) ueberwiegen die praktischen Nachteile (Komplexitaet) in unserem Fall nicht.

---

## 5. Schritt-fuer-Schritt-Anleitung zur Implementierung

### Ausgangslage

Unser Projekt hatte folgende unversionierte Endpunkte in `DemoApplication.java`:

```
GET  /        → Liste aller Tasks
POST /tasks   → Task hinzufuegen
POST /delete  → Task loeschen
```

### Schritt 1: DemoApplication bereinigen

Die REST-Controller-Logik wurde aus `DemoApplication.java` entfernt. Die Klasse enthaelt nun nur noch die `main`-Methode und die `@SpringBootApplication`-Annotation.

**Datei: `DemoApplication.java`**
```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### Schritt 2: V1-Controller erstellen

Ein neuer Controller `TaskControllerV1.java` wurde erstellt. Er enthaelt die exakt gleiche Logik wie vorher, aber unter dem Praefix `/api/v1`.

**Datei: `TaskControllerV1.java`**
```java
@RestController
@RequestMapping("/api/v1")
@CrossOrigin
public class TaskControllerV1 {

    private List<Task> tasks = new ArrayList<>();

    @GetMapping("/tasks")       // → GET /api/v1/tasks
    public List<Task> getTasks() { ... }

    @PostMapping("/tasks")      // → POST /api/v1/tasks
    public String addTask(@RequestBody String taskdescription) { ... }

    @PostMapping("/delete")     // → POST /api/v1/delete
    public String delTask(@RequestBody String taskdescription) { ... }
}
```

### Schritt 3: V2-Modell erstellen

Ein erweitertes Task-Modell `TaskV2.java` wurde erstellt, das zusaetzlich ein `priority`-Feld enthaelt (`low`, `medium`, `high`).

**Datei: `TaskV2.java`**
```java
public class TaskV2 {
    private String taskdescription;
    private String createdAt;
    private String priority;  // "low", "medium", "high"
    // Getter + Setter ...
}
```

### Schritt 4: V2-Controller erstellen

Ein zweiter Controller `TaskControllerV2.java` wurde unter `/api/v2` erstellt. Aenderungen:

- Das Task-Modell enthaelt nun `priority`
- Loeschen verwendet `DELETE` statt `POST` (RESTful-Verbesserung)

**Datei: `TaskControllerV2.java`**
```java
@RestController
@RequestMapping("/api/v2")
@CrossOrigin
public class TaskControllerV2 {

    private List<TaskV2> tasks = new ArrayList<>();

    @GetMapping("/tasks")       // → GET /api/v2/tasks
    public List<TaskV2> getTasks() { ... }

    @PostMapping("/tasks")      // → POST /api/v2/tasks
    public String addTask(@RequestBody String body) { ... }

    @DeleteMapping("/tasks")    // → DELETE /api/v2/tasks
    public String delTask(@RequestBody String body) { ... }
}
```

### Schritt 5: Frontend aktualisieren

Im React-Frontend (`App.jsx`) wurden alle API-URLs auf die versionierten Endpunkte umgestellt:

| Vorher | Nachher |
|--------|---------|
| `http://localhost:8080/` | `http://localhost:8080/api/v1/tasks` |
| `http://localhost:8080/tasks` | `http://localhost:8080/api/v1/tasks` |
| `http://localhost:8080/delete` | `http://localhost:8080/api/v1/delete` |

### Schritt 6: Testen

Beide API-Versionen koennen parallel getestet werden:

```bash
# V1 – klassisches Verhalten
curl http://localhost:8080/api/v1/tasks
curl -X POST -H "Content-Type: application/json" -d '{"taskdescription":"Einkaufen"}' http://localhost:8080/api/v1/tasks

# V2 – mit Priority-Feld
curl http://localhost:8080/api/v2/tasks
curl -X POST -H "Content-Type: application/json" -d '{"taskdescription":"Einkaufen","priority":"high"}' http://localhost:8080/api/v2/tasks
curl -X DELETE -H "Content-Type: application/json" -d '{"taskdescription":"Einkaufen"}' http://localhost:8080/api/v2/tasks
```

### Resultierende Projektstruktur

```
backend/src/main/java/com/example/demo/
├── DemoApplication.java      ← Nur noch @SpringBootApplication + main()
├── Task.java                 ← Bestehendes Modell (v1)
├── TaskV2.java               ← Erweitertes Modell (v2, mit priority)
├── TaskControllerV1.java     ← Controller unter /api/v1/
└── TaskControllerV2.java     ← Controller unter /api/v2/
```

---

## 6. Zusammenfassung und Schlussfolgerungen

### Was wurde erreicht

- Die bestehende REST-API wurde erfolgreich auf **URI-Path-Versionierung** umgestellt.
- **Version 1** (`/api/v1/`) bietet die bisherige Funktionalitaet 1:1 an – Abwaertskompatibilitaet ist gewaehrleistet.
- **Version 2** (`/api/v2/`) fuehrt Verbesserungen ein:
  - Ein neues Feld `priority` im Task-Modell
  - Die Verwendung von `DELETE` statt `POST` fuer das Loeschen (REST-konformer)
- Das Frontend wurde auf die V1-Endpunkte umgestellt und funktioniert ohne Aenderungen am Verhalten.

### Erkenntnisse

1. **Pragmatismus vor Purismus**: Die URI-Path-Methode ist theoretisch weniger REST-konform als Media-Type-Versionierung, aber in der Praxis weit ueberlegen in Bezug auf Einfachheit und Verstaendlichkeit.

2. **Parallelbetrieb**: Beide Versionen laufen gleichzeitig. Bestehende Clients (v1) funktionieren weiterhin, waehrend neue Clients v2 nutzen koennen.

3. **Migration**: Clients koennen schrittweise auf v2 migrieren. Sobald alle Clients umgestellt sind, kann v1 als `@Deprecated` markiert und spaeter entfernt werden.

4. **Skalierbarkeit**: Bei Bedarf koennen weitere Versionen (v3, v4, ...) einfach durch neue Controller-Klassen hinzugefuegt werden.

---

## 7. Literatur

- **Versioning RESTful Services – Spring Boot REST API**
  in28minutes / Spring Boot Tutorial
  https://www.springboottutorial.com/spring-boot-versioning-for-rest-api

- **DZone – Versioning REST API with Spring Boot and Swagger**
  https://dzone.com/articles/versioning-rest-api-with-spring-boot-and-swagger

- **Baeldung – Versioning a REST API**
  https://www.baeldung.com/rest-versioning

- **Microsoft REST API Guidelines – Versioning**
  https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md

- **Spring Framework Documentation – RequestMapping**
  https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html

- **Roy Fielding – REST APIs must be hypertext-driven** (Blog-Post)
  https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven
