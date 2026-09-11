package com.opsflow;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long requestId;
    private String action;
    private String actor;
    private String details;
    private Instant createdAt;

    protected AuditLog() {}

    public AuditLog(Long requestId, String action, String actor, String details) {
        this.requestId = requestId;
        this.action = action;
        this.actor = actor;
        this.details = details;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getRequestId() { return requestId; }
    public String getAction() { return action; }
    public String getActor() { return actor; }
    public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
}
