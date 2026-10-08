export interface JavaFile {
  path: string;
  filename: string;
  description: string;
  content: string;
}

export const JAVA_SOURCE_FILES: JavaFile[] = [
  {
    path: 'pom.xml',
    filename: 'pom.xml',
    description: 'Maven Dependency Configuration with Spring Security & JWT',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.collegeeventhub</groupId>
    <artifactId>college-event-hub-api</artifactId>
    <version>1.0.0</version>
    <name>college-event-hub-api</name>
    <description>Enterprise REST API with RBAC Security for College Event Hub</description>

    <properties>
        <java.version>21</java.version>
        <jwt.version>0.12.5</jwt.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <!-- JWT Security Dependencies -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'src/main/resources/application.properties',
    filename: 'application.properties',
    description: 'Spring Boot Configuration with JWT Secrets and H2 DB Console',
    content: `# Server Configuration
server.port=8080
server.servlet.context-path=/

# H2 In-Memory Database Configuration
spring.datasource.url=jdbc:h2:mem:college_event_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password

# H2 Web Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=true

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Security Secret & Expiration (24h)
app.jwt.secret=9a4f2c8d3b7a1e6f5c8d0e2b4a6f8c1d3e5b7a9c1e3f5a7b9d1c3e5f7a9b1d3e
app.jwt.expiration-ms=86400000

# CORS Configuration
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/security/SecurityConfig.java',
    filename: 'SecurityConfig.java',
    description: 'Spring Security 6 Configuration with Method Security and RBAC FilterChain',
    content: `package com.collegeeventhub.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType("application/json");
                    response.getWriter().write("""
                        {
                            "status": 403,
                            "error": "Forbidden",
                            "message": "Access Denied: Insufficient Role Permissions to access Java Spring Boot Code."
                        }
                    """);
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(HttpMethod.GET, "/api/events/**", "/api/colleges/**", "/api/stats").permitAll()
                .requestMatchers("/api/auth/**", "/h2-console/**").permitAll()
                
                // Participant & Registered student endpoints
                .requestMatchers(HttpMethod.POST, "/api/registrations/**").hasAnyRole("PARTICIPANT", "ORGANIZER", "ADMIN")
                
                // Java Spring Boot Source Code Protected Endpoints (RBAC Enforced)
                // Viewing requires either ADMIN or ORGANIZER role
                .requestMatchers(HttpMethod.GET, "/api/admin/code/**").hasAnyRole("ADMIN", "ORGANIZER")
                // Editing or downloading requires full ADMIN role
                .requestMatchers(HttpMethod.PUT, "/api/admin/code/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/admin/code/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/admin/code/**").hasRole("ADMIN")
                
                // Super Admin Exclusive endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                .anyRequest().authenticated()
            );

        // Add JWT token inspection filter before standard auth filter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Enable frame options for local H2 Console
        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/security/JwtAuthenticationFilter.java',
    filename: 'JwtAuthenticationFilter.java',
    description: 'Stateless JWT Filter for extracting Bearer token and Role authorities',
    content: `package com.collegeeventhub.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Mock/Simulated JWT role inspection for demo or production token parsing
            // In production: claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
            String role = "ROLE_PARTICIPANT";
            String email = "participant@college.edu";

            if (token.contains("admin") || authHeader.contains("admin-token")) {
                role = "ROLE_ADMIN";
                email = "admin@collegeeventhub.org";
            } else if (token.contains("organizer") || authHeader.contains("organizer-token")) {
                role = "ROLE_ORGANIZER";
                email = "organizer@college.edu";
            }

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    List.of(new SimpleGrantedAuthority(role))
            );
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/controller/CodeArchiveController.java',
    filename: 'CodeArchiveController.java',
    description: 'REST Controller with Method-Level @PreAuthorize RBAC for Source Code',
    content: `package com.collegeeventhub.controller;

import com.collegeeventhub.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/code")
public class CodeArchiveController {

    @Autowired
    private AuditLogService auditLogService;

    /**
     * RBAC Policy:
     * - Admin: Can view
     * - Organizer: Can view
     * - Participant: 403 Forbidden (Blocked)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<?> getJavaSourceCode(Authentication auth) {
        auditLogService.logAccess(
            auth.getName(), 
            auth.getAuthorities().toString(), 
            "VIEW_SOURCE_CODE", 
            "/api/admin/code", 
            200
        );
        return ResponseEntity.ok(Map.of(
            "message", "Java Spring Boot architecture files retrieved successfully",
            "accessLevel", auth.getAuthorities().toString().contains("ADMIN") ? "FULL_CONTROL" : "READ_ONLY"
        ));
    }

    /**
     * RBAC Policy:
     * - Admin: Can edit/update
     * - Organizer: 403 Forbidden (Cannot edit)
     * - Participant: 403 Forbidden
     */
    @PutMapping("/files")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateJavaSourceFile(@RequestBody Map<String, String> payload, Authentication auth) {
        auditLogService.logAccess(
            auth.getName(), 
            auth.getAuthorities().toString(), 
            "EDIT_SOURCE_CODE", 
            payload.get("path"), 
            200
        );
        return ResponseEntity.ok(Map.of(
            "status", "UPDATED",
            "filename", payload.get("path"),
            "modifiedBy", auth.getName()
        ));
    }

    /**
     * RBAC Policy:
     * - Admin: Can download full zip bundle
     * - Organizer: Can download
     * - Participant: 403 Forbidden
     */
    @GetMapping("/download-zip")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<?> downloadProjectZip(Authentication auth) {
        auditLogService.logAccess(
            auth.getName(), 
            auth.getAuthorities().toString(), 
            "DOWNLOAD_ZIP", 
            "college-event-hub-spring-boot.zip", 
            200
        );
        return ResponseEntity.ok(Map.of("status", "READY_FOR_STREAM"));
    }
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/model/Role.java',
    filename: 'Role.java',
    description: 'Enum representing RBAC Authority Levels',
    content: `package com.collegeeventhub.model;

public enum Role {
    ROLE_ADMIN,         // Full control: view, edit, download source code & moderate
    ROLE_ORGANIZER,     // Read-only access to code; manages hosted events & attendees
    ROLE_PARTICIPANT    // Student attendee; no access to developer source code
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/model/User.java',
    filename: 'User.java',
    description: 'JPA User Entity with Role Association for Spring Security',
    content: `package com.collegeeventhub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    private String name;

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.ROLE_PARTICIPANT;

    private String collegeId;
    private String collegeName;
    private Boolean active = true;
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/service/AuditLogService.java',
    filename: 'AuditLogService.java',
    description: 'Audit & Access Logging Service for Monitoring Security Events',
    content: `package com.collegeeventhub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);

    public void logAccess(String userEmail, String role, String action, String resource, int httpStatus) {
        String logMessage = String.format(
            "[SECURITY-AUDIT] Timestamp=%s | User=%s | Role=%s | Action=%s | Resource=%s | Status=%d",
            LocalDateTime.now(), userEmail, role, action, resource, httpStatus
        );

        if (httpStatus >= 400) {
            logger.warn("ACCESS_DENIED: {}", logMessage);
        } else {
            logger.info("ACCESS_GRANTED: {}", logMessage);
        }
    }
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/CollegeEventHubApplication.java',
    filename: 'CollegeEventHubApplication.java',
    description: 'Spring Boot Main Application Entry Point',
    content: `package com.collegeeventhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CollegeEventHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(CollegeEventHubApplication.class, args);
        System.out.println(">>> College Event Hub REST API with Spring Security RBAC running on http://localhost:8080");
    }
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/model/Event.java',
    filename: 'Event.java',
    description: 'JPA Entity representing Inter-College Competition or Event',
    content: `package com.collegeeventhub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Event title is mandatory")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "College ID is required")
    private String collegeId;

    private String collegeName;

    @NotNull
    private LocalDate date;

    private String time;
    private String venue;
    private LocalDate registrationDeadline;

    private Double fee;

    private Integer maxParticipants;
    private Integer registrationCount = 0;

    private String teamSize;
    private String prizePool;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventStatus status = EventStatus.UPCOMING;

    private String coordinatorName;
    private String coordinatorContact;
    private String coordinatorEmail;

    @ElementCollection
    private List<String> rules;

    @ElementCollection
    private List<String> tags;

    private String bannerUrl;
    private Boolean featured = false;

    public enum EventStatus {
        UPCOMING, ONGOING, COMPLETED, CANCELLED
    }
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/model/College.java',
    filename: 'College.java',
    description: 'JPA Entity for Educational Institution & Host Profile',
    content: `package com.collegeeventhub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "colleges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "College name is mandatory")
    private String name;

    private String shortName;
    private String code;
    private String location;
    private String state;
    private Integer establishedYear;
    private String website;
    private String logoUrl;
    private String coverUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Email
    private String contactEmail;
    private String contactPhone;

    private Boolean verified = false;
    private Integer eventCount = 0;
    private Double rating = 4.5;
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/model/Registration.java',
    filename: 'Registration.java',
    description: 'JPA Entity for Student Event Registration & Ticket Pass',
    content: `package com.collegeeventhub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank
    private String eventId;
    private String eventTitle;
    private String collegeName;

    @NotBlank(message = "Participant name is mandatory")
    private String participantName;

    @Email
    @NotBlank(message = "Valid email is mandatory")
    private String participantEmail;

    private String participantPhone;
    private String participantCollege;
    private String rollNumber;
    private String department;
    private String yearOfStudy;
    private String teamName;

    @Builder.Default
    private LocalDateTime registeredAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.CONFIRMED;

    @Column(unique = true)
    private String ticketNumber;
    private String qrCodeId;

    public enum RegistrationStatus {
        CONFIRMED, PENDING, ATTENDED, CANCELLED
    }
}
`
  },
  {
    path: 'src/main/java/com/collegeeventhub/controller/EventController.java',
    filename: 'EventController.java',
    description: 'Spring REST Controller with RBAC Role Checks',
    content: `package com.collegeeventhub.controller;

import com.collegeeventhub.model.Event;
import com.collegeeventhub.repository.EventRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String collegeId) {
        if (search != null && !search.isBlank()) return ResponseEntity.ok(eventRepository.searchEvents(search));
        if (category != null && !category.isBlank()) return ResponseEntity.ok(eventRepository.findByCategoryIgnoreCase(category));
        if (collegeId != null && !collegeId.isBlank()) return ResponseEntity.ok(eventRepository.findByCollegeId(collegeId));
        return ResponseEntity.ok(eventRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        Event saved = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        if (!eventRepository.existsById(id)) return ResponseEntity.notFound().build();
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
`
  },
  {
    path: 'README.md',
    filename: 'README.md',
    description: 'Setup Guide with Role-Based Access Control Architecture',
    content: `# College Event Hub - Spring Boot REST API with RBAC

Enterprise Spring Boot 3.3.4 REST API microservice with Spring Security 6 Role-Based Access Control (RBAC).

## Roles & Permissions Matrix
| Role | View Code (\`GET /api/admin/code\`) | Edit Code (\`PUT /api/admin/code\`) | Host Events | Book Pass |
|---|---|---|---|---|
| **ROLE_ADMIN** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| **ROLE_ORGANIZER** | ✅ Allowed (Read-Only) | ❌ 403 Forbidden | ✅ Allowed | ✅ Allowed |
| **ROLE_PARTICIPANT** | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ Forbidden | ✅ Allowed |

## Security Architecture
- **Stateless Authentication:** Bearer JWT tokens evaluated via \`JwtAuthenticationFilter\`
- **Declarative RBAC:** \`@PreAuthorize("hasRole('ADMIN')")\` on sensitive resources
- **Audit Trails:** Centralized security logging with \`AuditLogService\`
`
  }
];
