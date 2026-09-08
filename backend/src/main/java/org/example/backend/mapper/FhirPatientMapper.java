package org.example.backend.mapper;

import org.example.backend.model.PatientTwin;
import org.hl7.fhir.r4.model.Patient;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

@Component
public class FhirPatientMapper {

    public PatientTwin toPatientTwin(Patient patient) {

        PatientTwin twin = new PatientTwin();

        // FHIR Patient ID → PatientTwin patientId
        if (patient.hasIdElement()) {
            twin.setPatientId(
                    patient.getIdElement().getIdPart()
            );
        }

        // FHIR Patient name → PatientTwin name
        if (patient.hasName()) {
            twin.setName(
                    patient.getNameFirstRep()
                            .getNameAsSingleString()
            );
        }

        // FHIR gender → PatientTwin gender
        if (patient.hasGender()) {
            twin.setGender(
                    patient.getGender().toCode()
            );
        }

        // FHIR birthDate → PatientTwin age
        if (patient.hasBirthDate()) {

            LocalDate birthDate =
                    patient.getBirthDate()
                            .toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDate();

            LocalDate today = LocalDate.now();

            int age = Period
                    .between(birthDate, today)
                    .getYears();

            twin.setAge(age);
        }

        return twin;
    }
}