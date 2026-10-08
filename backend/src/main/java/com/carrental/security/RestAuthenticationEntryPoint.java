package com.carrental.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.*;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint, AccessDeniedHandler {
    private final ObjectMapper mapper;
    public RestAuthenticationEntryPoint(ObjectMapper mapper) { this.mapper=mapper; }
    @Override public void commence(HttpServletRequest request,HttpServletResponse response,AuthenticationException ex) throws IOException { write(request,response,401,"Authentication is required"); }
    @Override public void handle(HttpServletRequest request,HttpServletResponse response,org.springframework.security.access.AccessDeniedException ex) throws IOException { write(request,response,403,"You are not allowed to perform this action"); }
    private void write(HttpServletRequest request,HttpServletResponse response,int status,String message) throws IOException {
        response.setStatus(status); response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), Map.of("timestamp", Instant.now(),"status",status,"message",message,"path",request.getRequestURI()));
    }
}
