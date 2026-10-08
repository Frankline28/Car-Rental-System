package com.carrental.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private ResponseEntity<Map<String,Object>> body(HttpStatus status, String message, HttpServletRequest request) {
        Map<String,Object> result = new LinkedHashMap<>();
        result.put("timestamp", Instant.now()); result.put("status", status.value());
        result.put("message", message); result.put("path", request.getRequestURI());
        return ResponseEntity.status(status).body(result);
    }
    @ExceptionHandler(ResourceNotFoundException.class) ResponseEntity<?> missing(ResourceNotFoundException e, HttpServletRequest r) { return body(HttpStatus.NOT_FOUND,e.getMessage(),r); }
    @ExceptionHandler({BadRequestException.class, IllegalArgumentException.class}) ResponseEntity<?> bad(RuntimeException e, HttpServletRequest r) { return body(HttpStatus.BAD_REQUEST,e.getMessage(),r); }
    @ExceptionHandler(BookingConflictException.class) ResponseEntity<?> conflict(BookingConflictException e, HttpServletRequest r) { return body(HttpStatus.CONFLICT,e.getMessage(),r); }
    @ExceptionHandler(BadCredentialsException.class) ResponseEntity<?> auth(BadCredentialsException e, HttpServletRequest r) { return body(HttpStatus.UNAUTHORIZED,"Invalid email or password",r); }
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class) ResponseEntity<?> authentication(org.springframework.security.core.AuthenticationException e, HttpServletRequest r) { return body(HttpStatus.UNAUTHORIZED,"Invalid email or password",r); }
    @ExceptionHandler(AccessDeniedException.class) ResponseEntity<?> denied(AccessDeniedException e, HttpServletRequest r) { return body(HttpStatus.FORBIDDEN,"You are not allowed to perform this action",r); }
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e, HttpServletRequest r) {
        String message = e.getBindingResult().getFieldErrors().stream().map(FieldError::getDefaultMessage).distinct().collect(Collectors.joining("; "));
        return body(HttpStatus.BAD_REQUEST, message.isBlank()?"Request validation failed":message,r);
    }
    @ExceptionHandler(HttpMessageNotReadableException.class) ResponseEntity<?> unreadable(HttpMessageNotReadableException e, HttpServletRequest r) { return body(HttpStatus.BAD_REQUEST,"Request body is invalid or contains unsupported values",r); }
    @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> integrity(DataIntegrityViolationException e, HttpServletRequest r) { return body(HttpStatus.CONFLICT,"The requested change conflicts with existing data",r); }
    @ExceptionHandler(Exception.class) ResponseEntity<?> unexpected(Exception e, HttpServletRequest r) { log.error("Unhandled API error for {}",r.getRequestURI(),e); return body(HttpStatus.INTERNAL_SERVER_ERROR,"An unexpected server error occurred",r); }
}
