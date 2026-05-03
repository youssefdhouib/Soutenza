package com.soutenza.publications.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.defenses.domain.Defense;
import com.soutenza.defenses.domain.DefenseStatus;
import com.soutenza.defenses.domain.PublicationStatus;
import com.soutenza.defenses.repository.DefenseRepository;
import com.soutenza.users.domain.User;
import com.soutenza.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PublicationService {

    private final DefenseRepository defenseRepository;
    private final UserRepository userRepository;

    public PublicationService(DefenseRepository defenseRepository, UserRepository userRepository) {
        this.defenseRepository = defenseRepository;
        this.userRepository = userRepository;
    }

    public Defense publish(Long defenseId, Long publisherUserId) {
        Defense defense = defenseRepository.findById(defenseId)
                .orElseThrow(() -> new ApiException("DEFENSE_NOT_FOUND", HttpStatus.NOT_FOUND, "Soutenance introuvable"));

        User publisher = userRepository.findById(publisherUserId)
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "Utilisateur publication introuvable"));

        defense.setPublicationStatus(PublicationStatus.PUBLISHED);
        defense.setStatus(DefenseStatus.PUBLISHED);
        defense.setPublishedAt(LocalDateTime.now());
        defense.setPublishedBy(publisher);

        return defenseRepository.save(defense);
    }
}
