package com.example.demo;

import java.util.UUID;

/** Task-Model mit eindeutiger ID zur sicheren Identifikation einzelner Tasks.
 *
 * @author luh
 */
public class Task {

	private String id;
	private String taskdescription; // must have the EXACT name as his React state property and may not be ignored!

	public Task() {
		this.id = UUID.randomUUID().toString();
    }

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTaskdescription() { // do not apply camel-case here! Its a Bean!
		return taskdescription;
	}

	public void setTaskdescription(String taskdescription) { // do not apply camel-case here! Its a Bean!
		this.taskdescription = taskdescription;
	}

}
