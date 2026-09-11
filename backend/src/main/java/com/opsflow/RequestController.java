package com.opsflow;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RequestController {
    private final RequestRepository requests;
    private final AuditRepository audits;
    private final WorkflowService workflow;

    public RequestController(RequestRepository requests, AuditRepository audits, WorkflowService workflow) {
        this.requests = requests;
        this.audits = audits;
        this.workflow = workflow;
    }

    @GetMapping("/requests")
    public List<Request> all() {
        return requests.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/requests/{id}")
    public Request one(@PathVariable long id) {
        return requests.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + id));
    }

    @PostMapping("/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public Request create(@Valid @RequestBody ApiDtos.CreateRequest input) {
        return workflow.create(input);
    }

    @PostMapping("/requests/{id}/approve")
    public Request approve(@PathVariable long id, @RequestBody(required = false) ApiDtos.ActionRequest input) {
        return workflow.approve(id, actor(input));
    }

    @PostMapping("/requests/{id}/reject")
    public Request reject(@PathVariable long id, @RequestBody(required = false) ApiDtos.ActionRequest input) {
        return workflow.reject(id, actor(input));
    }

    @PostMapping("/requests/{id}/assign")
    public Request assign(@PathVariable long id, @Valid @RequestBody ApiDtos.AssignRequest input) {
        return workflow.assign(id, input);
    }

    @PostMapping("/requests/{id}/execute")
    public Request execute(@PathVariable long id) {
        return workflow.execute(id);
    }

    @GetMapping("/requests/{id}/audit")
    public List<AuditLog> audit(@PathVariable long id) {
        return audits.findByRequestIdOrderByCreatedAtDesc(id);
    }

    @GetMapping("/metrics")
    public Map<String, Long> metrics() {
        var all = requests.findAll();
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("total", (long) all.size());
        result.put("pending", count(all, RequestStatus.PENDING_APPROVAL));
        result.put("approved", count(all, RequestStatus.APPROVED));
        result.put("inProgress", count(all, RequestStatus.IN_PROGRESS));
        result.put("completed", count(all, RequestStatus.COMPLETED));
        result.put("failed", count(all, RequestStatus.FAILED));
        return result;
    }

    private long count(List<Request> list, RequestStatus status) {
        return list.stream().filter(r -> r.getStatus() == status).count();
    }

    private String actor(ApiDtos.ActionRequest input) {
        return input == null || input.actor() == null || input.actor().isBlank()
                ? "manager" : input.actor();
    }
}
