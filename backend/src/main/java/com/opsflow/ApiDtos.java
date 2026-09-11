package com.opsflow;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ApiDtos {
    private ApiDtos() {}

    public record CreateRequest(
        @NotNull RequestType type,
        @NotNull RequestPriority priority,
        @NotBlank String requester,
        @NotBlank String application,
        @NotBlank String description
    ) {}

    public record ActionRequest(String actor) {}
    public record AssignRequest(@NotBlank String assignee, String actor) {}
}
