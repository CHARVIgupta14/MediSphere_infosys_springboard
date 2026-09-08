package org.example.backend.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class PatientEventProducer {

    private static final String TOPIC = "medisphere-patient-events";

    private final KafkaTemplate<String, String> kafkaTemplate;

    public PatientEventProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishPatientCreated(String patientId, String patientName) {

        String event = String.format(
                "{\"eventType\":\"PatientCreated\",\"patientId\":\"%s\",\"patientName\":\"%s\"}",
                patientId,
                patientName
        );

        kafkaTemplate.send(TOPIC, patientId, event);

        System.out.println("Kafka event published: " + event);
    }
}