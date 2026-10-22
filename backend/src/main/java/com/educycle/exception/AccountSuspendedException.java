package com.educycle.exception;

import java.time.LocalDateTime;

public class AccountSuspendedException extends RuntimeException {
    private final LocalDateTime suspendedUntil;
    private final String reason;

    public AccountSuspendedException(String message, LocalDateTime suspendedUntil, String reason) {
        super(message);
        this.suspendedUntil = suspendedUntil;
        this.reason = reason;
    }

    public LocalDateTime getSuspendedUntil() {
        return suspendedUntil;
    }

    public String getReason() {
        return reason;
    }
}
