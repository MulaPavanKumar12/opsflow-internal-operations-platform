package com.opsflow;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(RequestRepository requests, AuditRepository audits) {
        return args -> {
            if (requests.count() > 0) return;

            Request a = requests.save(new Request(
                    RequestType.ACCESS, RequestPriority.HIGH, "Aisha Rao", "GitHub",
                    "Repository access for the Payments engineering team",
                    RequestStatus.PENDING_APPROVAL));
            audits.save(new AuditLog(a.getId(), "REQUEST_CREATED", "Aisha Rao", "Request submitted"));

            Request b = requests.save(new Request(
                    RequestType.REPOSITORY, RequestPriority.MEDIUM, "Daniel Kim", "GitHub",
                    "Create a new service repository with standard branch protections",
                    RequestStatus.APPROVED));
            audits.save(new AuditLog(b.getId(), "REQUEST_CREATED", "Daniel Kim", "Request submitted"));
            audits.save(new AuditLog(b.getId(), "REQUEST_APPROVED", "manager", "Approval completed"));

            Request c = requests.save(new Request(
                    RequestType.INCIDENT, RequestPriority.HIGH, "Maya Singh", "Vendor API",
                    "Vendor API is returning intermittent 5xx responses",
                    RequestStatus.FAILED));
            audits.save(new AuditLog(c.getId(), "REQUEST_CREATED", "Maya Singh", "Incident submitted"));
            audits.save(new AuditLog(c.getId(), "WORKFLOW_STARTED", "automation", "Fulfillment workflow started"));
            audits.save(new AuditLog(c.getId(), "INTEGRATION_FAILED", "automation",
                    "External service returned a temporary error after retry policy was exhausted"));
        };
    }
}
