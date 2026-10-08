package com.carrental.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String home() {
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Car Rental Backend API</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0d1117;
                    color: #c9d1d9;
                    margin: 0;
                    padding: 40px 20px;
                    display: flex;
                    justify-content: center;
                }
                .container {
                    max-width: 800px;
                    width: 100%;
                    background: #161b22;
                    border: 1px solid #30363d;
                    border-radius: 8px;
                    padding: 32px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                }
                h1 {
                    color: #58a6ff;
                    margin-top: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .badge {
                    background: #238636;
                    color: #ffffff;
                    font-size: 12px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-weight: 600;
                }
                p {
                    color: #8b949e;
                    line-height: 1.6;
                }
                .frontend-box {
                    background: #1f242c;
                    border: 1px solid #388bfd33;
                    border-left: 4px solid #58a6ff;
                    padding: 16px;
                    border-radius: 6px;
                    margin: 24px 0;
                }
                .frontend-box a {
                    color: #58a6ff;
                    font-weight: bold;
                    text-decoration: none;
                }
                .frontend-box a:hover {
                    text-decoration: underline;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    text-align: left;
                    padding: 12px;
                    border-bottom: 1px solid #30363d;
                }
                th {
                    color: #8b949e;
                    font-size: 13px;
                    text-transform: uppercase;
                }
                td a {
                    color: #58a6ff;
                    text-decoration: none;
                    font-family: monospace;
                }
                td a:hover {
                    text-decoration: underline;
                }
                .method {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 700;
                    font-family: monospace;
                }
                .get { background: #1f6feb22; color: #58a6ff; border: 1px solid #1f6feb; }
                .post { background: #23863622; color: #3fb950; border: 1px solid #238636; }
                .patch { background: #d2992222; color: #e3b341; border: 1px solid #d29922; }
                .delete { background: #da363322; color: #f85149; border: 1px solid #da3633; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Car Rental Backend API <span class="badge">ONLINE</span></h1>
                <p>Spring Boot 3 REST API connected to MySQL (<code>car_rental</code> database).</p>

                <div class="frontend-box">
                    <strong>Looking for the Web UI?</strong><br>
                    The Next.js user interface is running at:
                    <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>
                </div>

                <h3>Available REST API Endpoints</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Method</th>
                            <th>Endpoint</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="method get">GET</span></td>
                            <td><a href="/api/cars" target="_blank">/api/cars</a></td>
                            <td>List all cars with realistic rates</td>
                        </tr>
                        <tr>
                            <td><span class="method get">GET</span></td>
                            <td><a href="/api/cars/2" target="_blank">/api/cars/2</a></td>
                            <td>Get single car details (e.g. Baleno)</td>
                        </tr>
                        <tr>
                            <td><span class="method get">GET</span></td>
                            <td><a href="/api/packages" target="_blank">/api/packages</a></td>
                            <td>List rental packages (Hourly, Daily, Weekly, Monthly)</td>
                        </tr>
                        <tr>
                            <td><span class="method get">GET</span></td>
                            <td><a href="/api/locations" target="_blank">/api/locations</a></td>
                            <td>List pickup locations</td>
                        </tr>
                        <tr>
                            <td><span class="method get">GET</span></td>
                            <td><a href="/api/bookings" target="_blank">/api/bookings</a></td>
                            <td>List all bookings</td>
                        </tr>
                        <tr>
                            <td><span class="method get">GET</span></td>
                            <td><a href="/api/users" target="_blank">/api/users</a></td>
                            <td>List users</td>
                        </tr>
                        <tr>
                            <td><span class="method post">POST</span></td>
                            <td><code>/api/auth/login</code></td>
                            <td>BCrypt Login verification</td>
                        </tr>
                        <tr>
                            <td><span class="method post">POST</span></td>
                            <td><code>/api/bookings</code></td>
                            <td>Create a new booking with start/end dates</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        """;
    }

    @GetMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> apiInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("status", "UP");
        info.put("service", "Car Rental Backend");
        info.put("database", "MySQL (car_rental)");
        info.put("frontend", "http://localhost:3000");
        info.put("endpoints", Map.of(
            "cars", "/api/cars",
            "packages", "/api/packages",
            "locations", "/api/locations",
            "bookings", "/api/bookings",
            "users", "/api/users",
            "authLogin", "/api/auth/login"
        ));
        return info;
    }
}
