package com.educycle.dto;

public class SuspendUserRequest {
    private Integer days;
    private String reason;

    public SuspendUserRequest() {
    }

    public SuspendUserRequest(Integer days, String reason) {
        this.days = days;
        this.reason = reason;
    }

    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
