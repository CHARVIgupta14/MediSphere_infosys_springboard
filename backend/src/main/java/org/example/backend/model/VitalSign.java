
    package org.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

    @Document(collection = "vital_signs")
    public class VitalSign {

        @Id
        private String id;

        private String patientId;
        private Integer heartRate;
        private Double spo2;
        private Double temperature;
        private LocalDateTime timestamp;

        public VitalSign() {
        }

        public VitalSign(
                String patientId,
                Integer heartRate,
                Double spo2,
                Double temperature,
                LocalDateTime timestamp) {
            this.patientId = patientId;
            this.heartRate = heartRate;
            this.spo2 = spo2;
            this.temperature = temperature;
            this.timestamp = timestamp;
        }

        public String getId() {
            return id;
        }

        public String getPatientId() {
            return patientId;
        }

        public void setPatientId(String patientId) {
            this.patientId = patientId;
        }

        public Integer getHeartRate() {
            return heartRate;
        }

        public void setHeartRate(Integer heartRate) {
            this.heartRate = heartRate;
        }

        public Double getSpo2() {
            return spo2;
        }

        public void setSpo2(Double spo2) {
            this.spo2 = spo2;
        }

        public Double getTemperature() {
            return temperature;
        }

        public void setTemperature(Double temperature) {
            this.temperature = temperature;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }

