package com.carrental.controller;

import com.carrental.config.CorsConfig;
import com.carrental.config.SecurityConfig;
import com.carrental.security.DatabaseUserDetailsService;
import com.carrental.security.JwtAuthenticationFilter;
import com.carrental.security.JwtService;
import com.carrental.security.RestAuthenticationEntryPoint;
import com.carrental.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, CorsConfig.class, JwtAuthenticationFilter.class, RestAuthenticationEntryPoint.class})
class UserAuthorizationTest {
    @Autowired MockMvc mvc;
    @MockBean UserService users;
    @MockBean JwtService jwt;
    @MockBean DatabaseUserDetailsService userDetails;

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerIsForbiddenFromAdminUserApi() throws Exception {
        mvc.perform(get("/api/users")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanReadAdminUserApi() throws Exception {
        when(users.list()).thenReturn(List.of());
        mvc.perform(get("/api/users")).andExpect(status().isOk());
    }
}
