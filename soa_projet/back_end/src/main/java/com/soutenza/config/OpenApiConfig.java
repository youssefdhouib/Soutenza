package com.soutenza.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI soutenzaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Soutenza API")
                        .description("API de gestion des soutenances academiques")
                        .version("v1"));
    }
}
