package com.soutenza.common.email;

import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${spring.mail.username}")
    private String smtpUsername;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String toEmail, String fullName, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(resolveFromAddress());
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

    public void sendResultPublishedEmail(
            String toEmail,
            String studentFullName,
            String subject,
            BigDecimal finalAverage,
            String finalMention
    ) {
        String averageLabel = finalAverage != null ? finalAverage.toPlainString() + "/20" : "N/A";
        String mentionLabel = finalMention != null ? finalMention : "N/A";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(resolveFromAddress());
        message.setTo(toEmail);
        message.setSubject("Soutenza — Resultat de soutenance publie");
        message.setText(
                "Bonjour " + studentFullName + ",\n\n" +
                "Les resultats de votre soutenance ont ete publies par l'administration.\n\n" +
                "Sujet           : " + subject + "\n" +
                "Moyenne finale  : " + averageLabel + "\n" +
                "Mention         : " + mentionLabel + "\n\n" +
                "Vous pouvez consulter le detail sur la plateforme : http://localhost:5173\n\n" +
                "Cordialement,\n" +
                "L'equipe Soutenza"
        );
        mailSender.send(message);
    }

    private String resolveFromAddress() {
        if (fromAddress != null && !fromAddress.isBlank() && !fromAddress.contains("change-me")) {
            return fromAddress;
        }
        return smtpUsername;
    }
}
