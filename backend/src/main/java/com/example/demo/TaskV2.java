package com.example.demo;

import java.time.LocalDateTime;

/**
 * Erweitertes Task-Modell fuer API v2.
 * Enthaelt zusaetzlich ein Prioritaets-Feld (low, medium, high).
 *
 * @author luh
 */
public class TaskV2 {

	private String taskdescription;
	private String createdAt;
	private String priority; // "low", "medium", "high"

	public TaskV2() {
		this.createdAt = LocalDateTime.now().toString();
		this.priority = "medium";
	}

	public String getTaskdescription() {
		return taskdescription;
	}

	public void setTaskdescription(String taskdescription) {
		this.taskdescription = taskdescription;
	}

	public String getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(String createdAt) {
		this.createdAt = createdAt;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}
}
