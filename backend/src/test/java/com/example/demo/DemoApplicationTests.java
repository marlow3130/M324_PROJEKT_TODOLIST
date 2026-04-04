package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.time.format.DateTimeParseException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DemoApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
		assertTrue(true, "alles gut");
	}

	// =============================================
	// 1. Neues Element hinzufügen über API
	// =============================================
	@Test
	void addTaskViaApiShouldReturnInTaskList() throws Exception {
		mockMvc.perform(post("/api/v1/tasks")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"taskdescription\":\"API Test Task\"}"))
			.andExpect(status().isOk());

		mockMvc.perform(get("/api/v1/tasks"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[?(@.taskdescription=='API Test Task')]").exists());
	}

	// =============================================
	// 2. Korrekte Anzahl Elemente
	// =============================================
	@Test
	void taskListShouldReturnCorrectCount() throws Exception {
		TaskControllerV1 controller = new TaskControllerV1();

		controller.addTask("{\"taskdescription\":\"Task Eins\"}");
		controller.addTask("{\"taskdescription\":\"Task Zwei\"}");
		controller.addTask("{\"taskdescription\":\"Task Drei\"}");

		assertEquals(3, controller.getTasks().size(),
			"Die Aufgabenliste soll exakt 3 Elemente enthalten.");
	}

	// =============================================
	// 3. Duplikate werden abgelehnt
	// =============================================
	@Test
	void addDuplicateTaskShouldBeRejected() {
		TaskControllerV1 controller = new TaskControllerV1();

		controller.addTask("{\"taskdescription\":\"Duplikat\"}");
		controller.addTask("{\"taskdescription\":\"Duplikat\"}");

		assertEquals(1, controller.getTasks().size(),
			"Doppelte Task-Beschreibungen sollen ignoriert werden.");
		assertEquals("Duplikat", controller.getTasks().get(0).getTaskdescription());
	}

	// =============================================
	// 4. Element entfernen
	// =============================================
	@Test
	void deleteTaskShouldRemoveFromList() {
		TaskControllerV1 controller = new TaskControllerV1();

		controller.addTask("{\"taskdescription\":\"Zum Löschen\"}");
		assertEquals(1, controller.getTasks().size());

		controller.delTask("{\"taskdescription\":\"Zum Löschen\"}");

		assertTrue(controller.getTasks().isEmpty(),
			"Task soll nach Delete nicht mehr vorhanden sein.");
	}

	// =============================================
	// 5. Leere Task-Liste bei Start
	// =============================================
	@Test
	void getTasksEndpointShouldReturnEmptyArrayOnStart() throws Exception {
		// Neuer Controller hat leere Liste
		TaskControllerV1 controller = new TaskControllerV1();
		assertTrue(controller.getTasks().isEmpty(),
			"Aufgabenliste soll beim Start leer sein.");
	}

	// =============================================
	// 6. Nicht existierenden Task löschen
	// =============================================
	@Test
	void deleteNonExistentTaskShouldNotAffectList() {
		TaskControllerV1 controller = new TaskControllerV1();

		controller.addTask("{\"taskdescription\":\"Bestehender Task\"}");
		controller.delTask("{\"taskdescription\":\"Gibt es nicht\"}");

		assertEquals(1, controller.getTasks().size(),
			"Löschen eines nicht existierenden Tasks soll die Liste nicht verändern.");
		assertEquals("Bestehender Task", controller.getTasks().get(0).getTaskdescription());
	}

	// =============================================
	// 7. Task hat Erstellungszeitpunkt
	// =============================================
	@Test
	void newTaskShouldCaptureCreationTimestamp() {
		Task task = new Task();
		String createdAt = task.getCreatedAt();

		assertNotNull(createdAt, "Task soll bei Instanziierung ein Erfassungsdatum setzen.");
		assertFalse(createdAt.isBlank(), "Erfassungsdatum darf nicht leer sein.");

		try {
			LocalDateTime.parse(createdAt);
		} catch (DateTimeParseException ex) {
			assertTrue(false,
				"Erfassungsdatum soll ISO-8601 kompatibel sein. Aktuell: " + createdAt);
		}
	}

	// =============================================
	// 8. Mehrere Tasks hinzufügen und löschen
	// =============================================
	@Test
	void addAndDeleteMultipleTasksShouldWork() {
		TaskControllerV1 controller = new TaskControllerV1();

		controller.addTask("{\"taskdescription\":\"Task A\"}");
		controller.addTask("{\"taskdescription\":\"Task B\"}");
		controller.addTask("{\"taskdescription\":\"Task C\"}");
		assertEquals(3, controller.getTasks().size());

		controller.delTask("{\"taskdescription\":\"Task B\"}");
		assertEquals(2, controller.getTasks().size());

		// Task A und C sollen noch da sein
		assertEquals("Task A", controller.getTasks().get(0).getTaskdescription());
		assertEquals("Task C", controller.getTasks().get(1).getTaskdescription());
	}
}
