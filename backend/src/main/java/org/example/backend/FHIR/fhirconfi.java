package org.example.backend.FHIR;
import ca.uhn.fhir.context.FhirContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class fhirconfi {

        @Bean
        public FhirContext fhirContext() {
            return FhirContext.forR4();
        }
    }

