package com.opsflow;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "requests")
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RequestType type;

    @Enumerated(EnumType.STRING)
    private RequestPriority priority;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private String requester;
    private String application;
    private String description;
    private String assignee;
    private Instant createdAt;
    private Instant updatedAt;

    protected Request() {}

    public Request(RequestType type, RequestPriority priority, String requester,
                   String application, String description, RequestStatus status) {
        this.type = type;
        this.priority = priority;
        this.requester = requester;
        this.application = application;
        this.description = description;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    public void touch() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public RequestType getType() { return type; }
    public RequestPriority getPriority() { return priority; }
    public RequestStatus getStatus() { return status; }
    public String getRequester() { return requester; }
    public String getApplication() { return application; }
    public String getDescription() { return description; }
    public String getAssignee() { return assignee; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setStatus(RequestStatus status) { this.status = status; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
}
