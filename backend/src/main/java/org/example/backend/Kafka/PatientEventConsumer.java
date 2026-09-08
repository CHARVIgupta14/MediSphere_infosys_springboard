package org.example.backend.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class PatientEventConsumer {

    @KafkaListener(
            topics = "medisphere-patient-events",
            groupId = "medisphere-group"
    )
    public void consumePatientEvent(String event) {

        System.out.println("Kafka event received: " + event);
    }
}

