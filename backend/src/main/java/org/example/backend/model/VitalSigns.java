package org.example.backend.model;
import java.time.LocalDateTime;
public class VitalSigns {


        private Integer heartRate;
        private Double spo2;
        private Double temperature;
        private LocalDateTime timestamp;

        public VitalSigns() {
        }

        public VitalSigns(Integer heartRate, Double spo2,
                          Double temperature, LocalDateTime timestamp) {
            this.heartRate = heartRate;
            this.spo2 = spo2;
            this.temperature = temperature;
            this.timestamp = timestamp;
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

