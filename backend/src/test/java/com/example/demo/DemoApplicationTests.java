package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.time.format.DateTimeParseException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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

	@Test
	void getRootEndpointShouldReturnJsonArray() throws Exception {
		mockMvc.perform(get("/"))
			.andExpect(status().isOk())
			.andExpect(content().json("[]"));
	}

	@Test
	void addTaskShouldStoreOnlyUniqueTasks() {
		TaskControllerV1 controller = new TaskControllerV1();

		controller.addTask("{\"taskdescription\":\"Backend Test\"}");
		controller.addTask("{\"taskdescription\":\"Backend Test\"}");

		assertEquals(1, controller.getTasks().size(), "Doppelte Task-Beschreibungen sollen ignoriert werden.");
		assertEquals("Backend Test", controller.getTasks().get(0).getTaskdescription());
	}

	@Test
	void deleteTaskShouldRemoveTaskFromList() {
		TaskControllerV1 controller = new TaskControllerV1();

		controller.addTask("{\"taskdescription\":\"Task fuer Delete\"}");
		assertEquals(1, controller.getTasks().size());

		controller.delTask("{\"taskdescription\":\"Task fuer Delete\"}");

		assertTrue(controller.getTasks().isEmpty(), "Task soll nach Delete nicht mehr vorhanden sein.");
	}

	@Test
	void newTaskShouldCaptureCreationTimestamp() {
		Task task = new Task();
		Method createdAtGetter = Arrays.stream(Task.class.getDeclaredMethods())
			.filter(method -> method.getName().equals("getCreatedAt") && method.getParameterCount() == 0)
			.findFirst()
			.orElse(null);

		assertNotNull(createdAtGetter, "Task soll einen getter getCreatedAt() besitzen.");
		if (createdAtGetter == null) {
			return;
		}

		String createdAt;
		try {
			createdAt = (String) createdAtGetter.invoke(task);
		} catch (Exception ex) {
			assertTrue(false, "getCreatedAt() soll ohne Fehler aufrufbar sein.");
			return;
		}

		assertNotNull(createdAt, "Task soll bei Instanziierung ein Erfassungsdatum setzen.");
		assertFalse(createdAt.isBlank(), "Erfassungsdatum darf nicht leer sein.");

		try {
			LocalDateTime.parse(createdAt);
		} catch (DateTimeParseException ex) {
			assertTrue(false, "Erfassungsdatum soll ISO-8601 kompatibel sein (LocalDateTime.parse). Aktuell: " + createdAt);
		}
	}

}
