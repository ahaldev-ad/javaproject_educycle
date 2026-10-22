package com.educycle.service;

import com.educycle.dto.SkillRequestDTO;
import com.educycle.entity.Skill;
import com.educycle.entity.User;
import com.educycle.entity.enums.SkillLevel;
import com.educycle.entity.enums.TeachingMethod;
import com.educycle.repository.SkillRepository;
import com.educycle.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Skill> getAllSkills(Long userId) {
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                return skillRepository.findByUser(user);
            }
            return new java.util.ArrayList<>();
        }
        return skillRepository.findByApprovedTrue();
    }

    public Optional<Skill> getSkillById(Long id) {
        return skillRepository.findById(id);
    }

    public Skill createSkillFromDTO(SkillRequestDTO dto) {
        Skill s = new Skill();
        s.setSkillName(dto.getSkillName());
        s.setCategory(dto.getCategory());
        s.setDescription(dto.getDescription());
        
        // Availability: preserve exact string or fallback to Flexible
        if (dto.getAvailability() != null && !dto.getAvailability().trim().isEmpty()) {
            s.setAvailability(dto.getAvailability().trim());
        } else {
            s.setAvailability("Flexible Schedule");
        }

        s.setApproved(false);
        s.setApprovalStatus("PENDING");

        if (dto.getLevel() != null && !dto.getLevel().trim().isEmpty()) {
            try {
                s.setLevel(SkillLevel.valueOf(dto.getLevel().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                s.setLevel(SkillLevel.INTERMEDIATE);
            }
        } else {
            s.setLevel(SkillLevel.INTERMEDIATE);
        }

        s.setTeachingMethod(parseTeachingMethod(dto.getTeachingMethod()));

        if (dto.getUserId() != null) {
            User u = userRepository.findById(dto.getUserId()).orElse(null);
            if (u != null) {
                s.setUser(u);
            }
        }

        if (s.getUser() == null) {
            User firstUser = userRepository.findAll().stream().findFirst().orElseGet(() -> {
                User demo = new User();
                demo.setEmail("demo@educycle.edu");
                demo.setFirstName("Demo");
                demo.setLastName("User");
                demo.setPasswordHash("demopassword");
                return userRepository.save(demo);
            });
            s.setUser(firstUser);
        }

        return skillRepository.save(s);
    }

    public Skill saveSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    public void deleteSkill(Long id) {
        skillRepository.deleteById(id);
    }

    private TeachingMethod parseTeachingMethod(String input) {
        if (input == null || input.trim().isEmpty()) {
            return TeachingMethod.ONE_ON_ONE;
        }
        String clean = input.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        if (clean.contains("ONE") || clean.contains("1")) {
            return TeachingMethod.ONE_ON_ONE;
        }
        if (clean.contains("GROUP")) {
            return TeachingMethod.GROUP;
        }
        if (clean.contains("ASYNC") || clean.contains("REVIEW") || clean.contains("SUPPORT")) {
            return TeachingMethod.ASYNC;
        }
        try {
            return TeachingMethod.valueOf(clean);
        } catch (IllegalArgumentException e) {
            return TeachingMethod.ONE_ON_ONE;
        }
    }
}
