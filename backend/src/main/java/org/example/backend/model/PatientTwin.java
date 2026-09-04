package org.example.backend.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
@Document(collection = "patient_twins")
public class PatientTwin {

        @Id
        private String id;

        private String patientId;
        private String name;
        private Integer age;
        private String gender;
        private String bloodGroup;

        private List<String> conditions = new ArrayList<>();
        private List<String> medications = new ArrayList<>();

        private VitalSigns latestVitals;

        public PatientTwin() {
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getPatientId() {
            return patientId;
        }

        public void setPatientId(String patientId) {
            this.patientId = patientId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        public String getGender() {
            return gender;
        }

        public void setGender(String gender) {
            this.gender = gender;
        }

        public String getBloodGroup() {
            return bloodGroup;
        }

        public void setBloodGroup(String bloodGroup) {
            this.bloodGroup = bloodGroup;
        }

        public List<String> getConditions() {
            return conditions;
        }

        public void setConditions(List<String> conditions) {
            this.conditions = conditions;
        }

        public List<String> getMedications() {
            return medications;
        }

        public void setMedications(List<String> medications) {
            this.medications = medications;
        }

        public VitalSigns getLatestVitals() {
            return latestVitals;
        }

        public void setLatestVitals(VitalSigns latestVitals) {
            this.latestVitals = latestVitals;
        }
    }

