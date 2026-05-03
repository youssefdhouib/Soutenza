package com.soutenza.common.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String toEmail, String fullName, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Bienvenue sur Soutenza — Vos identifiants de connexion");
        message.setText(
                "Bonjour " + fullName + ",\n\n" +
                "Votre compte sur la plateforme Soutenza a été créé par l'administrateur.\n\n" +
                "Email      : " + toEmail + "\n" +
                "Mot de passe temporaire : " + temporaryPassword + "\n\n" +
                "Connectez-vous sur : http://localhost:5173\n\n" +
                "Cordialement,\n" +
                "L'équipe Soutenza"
        );
        mailSender.send(message);
    }
}
