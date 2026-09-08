package org.example.backend.exception;

public class PatientNotFoundException extends RuntimeException {

    public PatientNotFoundException(String patientId) {
        super("Patient not found with ID: " + patientId);
    }
}
