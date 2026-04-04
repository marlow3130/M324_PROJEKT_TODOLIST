package com.example.demo;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * API Version 2 – Erweiterte ToDo-Funktionalitaet unter /api/v2/.
 *
 * Aenderungen gegenueber v1:
 *   - Task-Modell enthaelt ein neues Feld "priority" (low / medium / high)
 *   - Loeschen verwendet DELETE /api/v2/tasks statt POST /api/v2/delete
 *
 * Endpunkte:
 *   GET    /api/v2/tasks  – Liste aller Tasks (inkl. priority)
 *   POST   /api/v2/tasks  – Neuen Task hinzufuegen (mit optionaler priority)
 *   DELETE /api/v2/tasks  – Task loeschen
 *
 * @author luh
 */
@RestController
@RequestMapping("/api/v2")
@CrossOrigin
public class TaskControllerV2 {

	private List<TaskV2> tasks = new ArrayList<>();

	@GetMapping("/tasks")
	public List<TaskV2> getTasks() {
		System.out.println("API v2 EP '/api/v2/tasks' returns task-list of size " + tasks.size() + ".");
		if (tasks.size() > 0) {
			int i = 1;
			for (TaskV2 task : tasks) {
				System.out.println("-task " + (i++) + ":" + task.getTaskdescription()
						+ " [" + task.getPriority() + "]");
			}
		}
		return tasks;
	}

	@PostMapping("/tasks")
	public String addTask(@RequestBody String body) {
		System.out.println("API v2 EP '/api/v2/tasks': '" + body + "'");
		ObjectMapper mapper = new ObjectMapper();
		try {
			TaskV2 task = mapper.readValue(body, TaskV2.class);
			for (TaskV2 t : tasks) {
				if (t.getTaskdescription().equals(task.getTaskdescription())) {
					System.out.println(">>>task: '" + task.getTaskdescription() + "' already exists!");
					return "redirect:/";
				}
			}
			if (task.getPriority() == null) {
				task.setPriority("medium");
			}
			System.out.println("...adding task: '" + task.getTaskdescription()
					+ "' priority=" + task.getPriority());
			tasks.add(task);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return "redirect:/";
	}

	@DeleteMapping("/tasks")
	public String delTask(@RequestBody String body) {
		System.out.println("API v2 EP DELETE '/api/v2/tasks': '" + body + "'");
		ObjectMapper mapper = new ObjectMapper();
		try {
			TaskV2 task = mapper.readValue(body, TaskV2.class);
			Iterator<TaskV2> it = tasks.iterator();
			while (it.hasNext()) {
				TaskV2 t = it.next();
				if (t.getTaskdescription().equals(task.getTaskdescription())) {
					System.out.println("...deleting task: '" + task.getTaskdescription() + "'");
					it.remove();
					return "redirect:/";
				}
			}
			System.out.println(">>>task: '" + task.getTaskdescription() + "' not found!");
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return "redirect:/";
	}
}
