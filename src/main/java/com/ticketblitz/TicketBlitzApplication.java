package com.ticketblitz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TicketBlitzApplication {

	public static void main(String[] args) {
		SpringApplication.run(TicketBlitzApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner demo(com.ticketblitz.repository.UserRepository repository,
			org.springframework.security.crypto.password.PasswordEncoder encoder) {
		return (args) -> {
			if (repository.findByUsername("alice").isEmpty()) {
				repository.save(new com.ticketblitz.model.User(null, "alice", "alice@test.com",
						encoder.encode("password"), com.ticketblitz.model.Role.USER));
				System.out.println("👤 Default user 'alice' (ID: 1) created for testing.");
			}
			if (repository.findByUsername("admin").isEmpty()) {
				repository.save(new com.ticketblitz.model.User(null, "admin", "admin@test.com", encoder.encode("admin"),
						com.ticketblitz.model.Role.ADMIN));
				System.out.println("🛡️ Default admin 'admin' (ID: 2) created.");
			}
		};
	}
}
