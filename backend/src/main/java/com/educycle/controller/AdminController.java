package com.educycle.controller;

import com.educycle.entity.Resource;
import com.educycle.entity.Skill;
import com.educycle.entity.User;
import com.educycle.repository.ResourceRepository;
import com.educycle.repository.SkillRepository;
import com.educycle.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private com.educycle.service.FirebaseService firebaseService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalResources", resourceRepository.count());
        stats.put("pendingResources", resourceRepository.countByApprovalStatus("PENDING"));
        stats.put("approvedResources", resourceRepository.countByApproved(true));
        stats.put("totalSkills", skillRepository.count());
        stats.put("pendingSkills", skillRepository.countByApprovalStatus("PENDING"));
        stats.put("approvedSkills", skillRepository.countByApproved(true));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<User> suspendUser(
            @PathVariable Long id,
            @RequestBody(required = false) com.educycle.dto.SuspendUserRequest request) {
        return userRepository.findById(id).map(user -> {
            user.setSuspended(true);
            if (request != null && request.getDays() != null && request.getDays() > 0) {
                user.setSuspendedUntil(java.time.LocalDateTime.now().plusDays(request.getDays()));
            } else {
                user.setSuspendedUntil(null);
            }
            if (request != null && request.getReason() != null) {
                user.setSuspensionReason(request.getReason());
            }
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/unsuspend")
    public ResponseEntity<User> unsuspendUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setSuspended(false);
            user.setSuspendedUntil(null);
            user.setSuspensionReason(null);
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(user -> {
            firebaseService.deleteUserByEmail(user.getEmail());
            userRepository.delete(user);
        });
        return ResponseEntity.noContent().build();
    }

    // --- Resource Moderation ---
    @GetMapping("/resources")
    public ResponseEntity<List<Resource>> getAllResourcesForAdmin() {
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @RequestMapping(value = "/resources/{id}/approve", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Resource> approveResource(@PathVariable Long id) {
        return resourceRepository.findById(id).map(resource -> {
            resource.setApproved(true);
            resource.setApprovalStatus("APPROVED");
            return ResponseEntity.ok(resourceRepository.save(resource));
        }).orElse(ResponseEntity.notFound().build());
    }

    @RequestMapping(value = "/resources/{id}/reject", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Resource> rejectResource(@PathVariable Long id) {
        return resourceRepository.findById(id).map(resource -> {
            resource.setApproved(false);
            resource.setApprovalStatus("REJECTED");
            return ResponseEntity.ok(resourceRepository.save(resource));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        if (resourceRepository.existsById(id)) {
            resourceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Skill Moderation ---
    @GetMapping("/skills")
    public ResponseEntity<List<Skill>> getAllSkillsForAdmin() {
        return ResponseEntity.ok(skillRepository.findAll());
    }

    @RequestMapping(value = "/skills/{id}/approve", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Skill> approveSkill(@PathVariable Long id) {
        return skillRepository.findById(id).map(skill -> {
            skill.setApproved(true);
            skill.setApprovalStatus("APPROVED");
            return ResponseEntity.ok(skillRepository.save(skill));
        }).orElse(ResponseEntity.notFound().build());
    }

    @RequestMapping(value = "/skills/{id}/reject", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Skill> rejectSkill(@PathVariable Long id) {
        return skillRepository.findById(id).map(skill -> {
            skill.setApproved(false);
            skill.setApprovalStatus("REJECTED");
            return ResponseEntity.ok(skillRepository.save(skill));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        if (skillRepository.existsById(id)) {
            skillRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
