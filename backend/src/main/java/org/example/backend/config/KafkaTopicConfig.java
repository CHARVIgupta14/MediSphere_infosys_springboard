package org.example.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic patientEventsTopic() {
        return new NewTopic(
                "medisphere-patient-events",
                1,
                (short) 1
        );
    }
}