package com.soutenza.security;

import com.soutenza.common.exception.ApiException;
import com.soutenza.users.domain.User;
import com.soutenza.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED, "Utilisateur non authentifie");
        }
        return principal.getId();
    }

    public User getCurrentUserEntity() {
        Long id = getCurrentUserId();
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }
}
