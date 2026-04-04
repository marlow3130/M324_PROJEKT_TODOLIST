package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot application class.
 * Controller logic has been extracted into versioned controllers
 * (TaskControllerV1, TaskControllerV2) under /api/v1/ and /api/v2/.
 *
 * @author luh
 */
@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}
