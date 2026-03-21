package com.example.demo;

import java.time.LocalDateTime;

/** Task-Model mit Status und Zeitstempeln fuer die History-Funktion.
 *
 * @author luh
 */
public class Task {

	private String taskdescription; // must have the EXACT name as his React state property and may not be ignored!
	private String status; // "open" oder "done"
	private LocalDateTime createdAt;
	private LocalDateTime completedAt;

	public Task() {
		this.status = "open";
		this.createdAt = LocalDateTime.now();
    }

	public String getTaskdescription() { // do not apply camel-case here! Its a Bean!
		return taskdescription;
	}

	public void setTaskdescription(String taskdescription) { // do not apply camel-case here! Its a Bean!
		this.taskdescription = taskdescription;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
		if ("done".equals(status)) {
			this.completedAt = LocalDateTime.now();
		}
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getCompletedAt() {
		return completedAt;
	}

	public void setCompletedAt(LocalDateTime completedAt) {
		this.completedAt = completedAt;
	}

}
