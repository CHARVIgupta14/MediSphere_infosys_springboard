package org.example.backend.exception;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(PatientNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleNotFound(
                PatientNotFoundException ex) {

            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());

            return ResponseEntity.status(404).body(response);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, String>> handleBadRequest(
                IllegalArgumentException ex) {

            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());

            return ResponseEntity.badRequest().body(response);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> handleValidation(
                MethodArgumentNotValidException ex) {

            Map<String, String> errors = new HashMap<>();

            ex.getBindingResult()
                    .getFieldErrors()
                    .forEach(error ->
                            errors.put(
                                    error.getField(),
                                    error.getDefaultMessage()
                            )
                    );

            return ResponseEntity.badRequest().body(errors);
        }
    }
