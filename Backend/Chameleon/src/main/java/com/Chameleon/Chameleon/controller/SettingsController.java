package com.Chameleon.Chameleon.controller;

import com.Chameleon.Chameleon.config.GeminiConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping({"/api/settings", "/settings"})
@CrossOrigin(origins = "*")
public class SettingsController {

    private final GeminiConfig geminiConfig;
    private final Map<String, Object> settings = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public SettingsController(GeminiConfig geminiConfig) {
        this.geminiConfig = geminiConfig;
        settings.put("model", geminiConfig.getDefaultModel());
        settings.put("customInstructions", "");
        settings.put("preferences", Map.of(
                "responseStyle", "Balanced",
                "tone", "Friendly",
                "responseLength", "Medium"
        ));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings() {
        Map<String, Object> response = new HashMap<>(settings);
        response.put("apiKeyConfigured", geminiConfig.isApiKeyConfigured());
        response.put("supportedModels", geminiConfig.getSupportedModels());
        response.put("defaultModel", geminiConfig.getDefaultModel());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> payload) {
        if (payload.containsKey("model")) {
            settings.put("model", payload.get("model"));
        }
        if (payload.containsKey("customInstructions")) {
            settings.put("customInstructions", payload.get("customInstructions"));
        }
        if (payload.containsKey("preferences")) {
            settings.put("preferences", payload.get("preferences"));
        }
        if (payload.containsKey("apiKey")) {
            String key = (String) payload.get("apiKey");
            if (key != null && !key.trim().isEmpty()) {
                geminiConfig.setCustomApiKey(key);
            }
        }
        Map<String, Object> response = new HashMap<>(settings);
        response.put("success", true);
        response.put("apiKeyConfigured", geminiConfig.isApiKeyConfigured());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-key")
    public ResponseEntity<Map<String, Object>> testApiKey(@RequestBody(required = false) Map<String, String> body) {
        String keyToTest = (body != null && body.containsKey("apiKey") && !body.get("apiKey").trim().isEmpty())
                ? body.get("apiKey").trim()
                : geminiConfig.getApiKey();

        if (keyToTest == null || keyToTest.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "No API key configured"));
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + keyToTest;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .timeout(Duration.ofSeconds(8))
                    .build();

            HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                geminiConfig.setCustomApiKey(keyToTest);
                return ResponseEntity.ok(Map.of("valid", true, "message", "Gemini API Key is valid and active"));
            } else {
                return ResponseEntity.ok(Map.of("valid", false, "message", "API test returned code: " + resp.statusCode()));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Test request error: " + e.getMessage()));
        }
    }
}
