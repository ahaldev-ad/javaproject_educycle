package com.educycle.entity;

import com.educycle.entity.enums.SkillLevel;
import com.educycle.entity.enums.SkillStatus;
import com.educycle.entity.enums.TeachingMethod;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "skills")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "requests"})
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "skill_id")
    private Long skillId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "Tutor user is required")
    private User user;

    @NotBlank(message = "Skill name is required")
    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @NotBlank(message = "Category is required")
    private String category;

    @Enumerated(EnumType.STRING)
    private SkillLevel level;

    @NotBlank(message = "Description is required")
    @Column(length = 2000, nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "teaching_method")
    private TeachingMethod teachingMethod;

    private String availability;

    private Double rating = 0.0;

    @Enumerated(EnumType.STRING)
    private SkillStatus status = SkillStatus.AVAILABLE;

    @Column(name = "approved")
    private Boolean approved = false;

    @Column(name = "approval_status")
    private String approvalStatus = "PENDING";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SkillRequest> requests = new ArrayList<>();

    public Skill() {
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public void setLevel(SkillLevel level) {
        this.level = level;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TeachingMethod getTeachingMethod() {
        return teachingMethod != null ? teachingMethod : TeachingMethod.ONE_ON_ONE;
    }

    public void setTeachingMethod(TeachingMethod teachingMethod) {
        this.teachingMethod = teachingMethod;
    }

    public String getAvailability() {
        return availability != null && !availability.trim().isEmpty() ? availability : "Flexible Schedule";
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public SkillStatus getStatus() {
        return status;
    }

    public void setStatus(SkillStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getApproved() {
        return approved != null ? approved : false;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public String getApprovalStatus() {
        return approvalStatus != null ? approvalStatus : (Boolean.TRUE.equals(approved) ? "APPROVED" : "PENDING");
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
