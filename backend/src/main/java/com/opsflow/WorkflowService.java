package com.opsflow;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkflowService {
    private final RequestRepository requests;
    private final AuditRepository audits;

    public WorkflowService(RequestRepository requests, AuditRepository audits) {
        this.requests = requests;
        this.audits = audits;
    }

    @Transactional
    public Request create(ApiDtos.CreateRequest input) {
        Request r = new Request(input.type(), input.priority(), input.requester(),
                input.application(), input.description(), RequestStatus.PENDING_APPROVAL);
        Request saved = requests.save(r);
        log(saved.getId(), "REQUEST_CREATED", input.requester(), "Request submitted");
        return saved;
    }

    @Transactional
    public Request approve(long id, String actor) {
        Request r = get(id);
        require(r.getStatus() == RequestStatus.PENDING_APPROVAL, "Only pending requests can be approved");
        r.setStatus(RequestStatus.APPROVED);
        log(id, "REQUEST_APPROVED", actor, "Approval completed");
        return r;
    }

    @Transactional
    public Request reject(long id, String actor) {
        Request r = get(id);
        require(r.getStatus() == RequestStatus.PENDING_APPROVAL, "Only pending requests can be rejected");
        r.setStatus(RequestStatus.REJECTED);
        log(id, "REQUEST_REJECTED", actor, "Request rejected");
        return r;
    }

    @Transactional
    public Request assign(long id, ApiDtos.AssignRequest input) {
        Request r = get(id);
        r.setAssignee(input.assignee());
        log(id, "REQUEST_ASSIGNED", input.actor() == null ? "operations" : input.actor(),
                "Assigned to " + input.assignee());
        return r;
    }

    @Transactional
    public Request execute(long id) {
        Request r = get(id);
        require(r.getStatus() == RequestStatus.APPROVED, "Only approved requests can be executed");

        r.setStatus(RequestStatus.IN_PROGRESS);
        log(id, "WORKFLOW_STARTED", "automation", "Fulfillment workflow started");

        // Deterministic demo behavior: INCIDENT requests simulate an external failure.
        if (r.getType() == RequestType.INCIDENT) {
            r.setStatus(RequestStatus.FAILED);
            log(id, "INTEGRATION_FAILED", "automation",
                    "External service returned a temporary error after retry policy was exhausted");
        } else {
            r.setStatus(RequestStatus.COMPLETED);
            log(id, "INTEGRATION_COMPLETED", "automation",
                    "External service integration completed successfully");
        }
        return r;
    }

    private Request get(long id) {
        return requests.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + id));
    }

    private void require(boolean condition, String message) {
        if (!condition) throw new IllegalStateException(message);
    }

    private void log(long id, String action, String actor, String details) {
        audits.save(new AuditLog(id, action, actor, details));
    }
}
