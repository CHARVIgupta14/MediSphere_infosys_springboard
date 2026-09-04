package org.example.backend.service;

import org.example.backend.dto.PatientRequest;
import org.example.backend.exception.PatientNotFoundException;
import org.example.backend.model.PatientTwin;
import org.example.backend.model.VitalSigns;
import org.example.backend.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // Create a new patient
    public PatientTwin createPatient(PatientRequest request) {

        if (patientRepository.existsByPatientId(request.getPatientId())) {
            throw new IllegalArgumentException(
                    "Patient ID already exists: " + request.getPatientId()
            );
        }

        PatientTwin patient = new PatientTwin();

        patient.setPatientId(request.getPatientId());
        patient.setName(request.getName());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());

        patient.setConditions(
                request.getConditions() != null
                        ? request.getConditions()
                        : new ArrayList<>()
        );

        patient.setMedications(
                request.getMedications() != null
                        ? request.getMedications()
                        : new ArrayList<>()
        );

        return patientRepository.save(patient);
    }

    // Get all patients
    public List<PatientTwin> getAllPatients() {
        return patientRepository.findAll();
    }

    // Get one patient
    public PatientTwin getPatient(String patientId) {

        return patientRepository.findByPatientId(patientId)
                .orElseThrow(() ->
                        new PatientNotFoundException(patientId));
    }

    // Update patient
    public PatientTwin updatePatient(
            String patientId,
            PatientRequest request) {

        PatientTwin patient = getPatient(patientId);

        patient.setName(request.getName());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());

        patient.setConditions(
                request.getConditions() != null
                        ? request.getConditions()
                        : new ArrayList<>()
        );

        patient.setMedications(
                request.getMedications() != null
                        ? request.getMedications()
                        : new ArrayList<>()
        );

        return patientRepository.save(patient);
    }

    // Delete patient
    public void deletePatient(String patientId) {

        PatientTwin patient = getPatient(patientId);

        patientRepository.delete(patient);
    }

    // Update patient vitals
    public PatientTwin updateVitals(
            String patientId,
            VitalSigns vitals) {

        PatientTwin patient = getPatient(patientId);

        vitals.setTimestamp(LocalDateTime.now());

        patient.setLatestVitals(vitals);

        return patientRepository.save(patient);
    }

    // Patient 360
    public PatientTwin getPatient360(String patientId) {
        return getPatient(patientId);
    }
}