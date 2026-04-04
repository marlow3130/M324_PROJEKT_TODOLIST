package com.example.demo;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * API Version 1 – Original ToDo-Funktionalitaet unter /api/v1/.
 * 
 * Endpunkte:
 *   GET  /api/v1/tasks   – Liste aller Tasks
 *   POST /api/v1/tasks   – Neuen Task hinzufuegen
 *   POST /api/v1/delete  – Task loeschen
 *
 * @author luh
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin
public class TaskControllerV1 {

	private List<Task> tasks = new ArrayList<>();

	@GetMapping("/tasks")
	public List<Task> getTasks() {
		System.out.println("API v1 EP '/api/v1/tasks' returns task-list of size " + tasks.size() + ".");
		if (tasks.size() > 0) {
			int i = 1;
			for (Task task : tasks) {
				System.out.println("-task " + (i++) + ":" + task.getTaskdescription());
			}
		}
		return tasks;
	}

	@PostMapping("/tasks")
	public String addTask(@RequestBody String taskdescription) {
		System.out.println("API v1 EP '/api/v1/tasks': '" + taskdescription + "'");
		ObjectMapper mapper = new ObjectMapper();
		try {
			Task task = mapper.readValue(taskdescription, Task.class);
			for (Task t : tasks) {
				if (t.getTaskdescription().equals(task.getTaskdescription())) {
					System.out.println(">>>task: '" + task.getTaskdescription() + "' already exists!");
					return "redirect:/";
				}
			}
			System.out.println("...adding task: '" + task.getTaskdescription() + "'");
			tasks.add(task);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return "redirect:/";
	}

	@PostMapping("/delete")
	public String delTask(@RequestBody String taskdescription) {
		System.out.println("API v1 EP '/api/v1/delete': '" + taskdescription + "'");
		ObjectMapper mapper = new ObjectMapper();
		try {
			Task task = mapper.readValue(taskdescription, Task.class);
			Iterator<Task> it = tasks.iterator();
			while (it.hasNext()) {
				Task t = it.next();
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
