package org.example.backend.FHIR;

import ca.uhn.fhir.context.FhirContext;
import org.example.backend.mapper.FhirPatientMapper;
import org.example.backend.model.PatientTwin;
import org.example.backend.repository.PatientRepository;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Patient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class fhirService {

    private final FhirContext fhirContext;
    private final FhirPatientMapper fhirPatientMapper;
    private final PatientRepository patientRepository;

    public fhirService(
            FhirContext fhirContext,
            FhirPatientMapper fhirPatientMapper,
            PatientRepository patientRepository) {

        this.fhirContext = fhirContext;
        this.fhirPatientMapper = fhirPatientMapper;
        this.patientRepository = patientRepository;
    }

    // Get one patient from FHIR server
    public Patient getPatient(String patientId) {

        String serverUrl = "https://hapi.fhir.org/baseR4";

        return fhirContext
                .newRestfulGenericClient(serverUrl)
                .read()
                .resource(Patient.class)
                .withId(patientId)
                .execute();
    }

    // Get patients from FHIR server
    public List<Patient> getPatients() {

        String serverUrl = "https://hapi.fhir.org/baseR4";

        Bundle bundle = fhirContext
                .newRestfulGenericClient(serverUrl)
                .search()
                .forResource(Patient.class)
                .returnBundle(Bundle.class)
                .execute();

        return bundle.getEntry()
                .stream()
                .map(entry -> (Patient) entry.getResource())
                .toList();
    }

    // Get patients as clean FHIR JSON
    public String getPatientsJson() {

        String serverUrl = "https://hapi.fhir.org/baseR4";

        Bundle bundle = fhirContext
                .newRestfulGenericClient(serverUrl)
                .search()
                .forResource(Patient.class)
                .returnBundle(Bundle.class)
                .execute();

        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(bundle);
    }

    // Convert FHIR Patient → PatientTwin
    public PatientTwin getPatientTwin(String patientId) {

        Patient patient = getPatient(patientId);

        return fhirPatientMapper.toPatientTwin(patient);
    }

    // Convert FHIR Patient → PatientTwin → MongoDB
    public PatientTwin savePatientTwin(String patientId) {

        Patient patient = getPatient(patientId);

        PatientTwin twin = fhirPatientMapper.toPatientTwin(patient);

        return patientRepository
                .findByPatientId(patientId)
                .map(existingPatient -> {

                    existingPatient.setName(twin.getName());
                    existingPatient.setAge(twin.getAge());
                    existingPatient.setGender(twin.getGender());

                    return patientRepository.save(existingPatient);
                })
                .orElseGet(() -> patientRepository.save(twin));
    }

    // Convert FHIR Patient → JSON
    public String getPatientJson(Patient patient) {

        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(patient);
    }
}