package com.Chameleon.Chameleon.controller;

import com.Chameleon.Chameleon.config.GeminiConfig;
import com.Chameleon.Chameleon.dto.GeminiJsonRequest;
import com.Chameleon.Chameleon.dto.GeminiModelsResponse;
import com.Chameleon.Chameleon.dto.GeminiResponse;
import com.Chameleon.Chameleon.service.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping({"/api/gemini", "/api"})
@CrossOrigin(origins = "*")
public class GeminiController {

    private static final Logger log = LoggerFactory.getLogger(GeminiController.class);

    private final GeminiService geminiService;
    private final GeminiConfig geminiConfig;

    public GeminiController(GeminiService geminiService, GeminiConfig geminiConfig) {
        this.geminiService = geminiService;
        this.geminiConfig = geminiConfig;
    }

    /**
     * Multimodal query endpoint supporting multipart/form-data (Text prompt + Image file upload).
     *
     * @param prompt The text prompt/query (required)
     * @param file   The image file (optional for text-only queries, recommended for image queries)
     * @param model  The Gemini model to use (optional, defaults to gemini-3.8-flash)
     * @return GeminiResponse with the text response
     */
    @PostMapping(value = {"/generate", "/generate-app"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GeminiResponse> generateMultipart(
            @RequestParam("prompt") String prompt,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "model", required = false) String model) {

        byte[] imageBytes = null;
        String mimeType = null;

        if (file != null && !file.isEmpty()) {
            try {
                imageBytes = file.getBytes();
                mimeType = file.getContentType();
            } catch (IOException e) {
                log.error("Failed to read uploaded image file", e);
                return ResponseEntity.badRequest().body(
                        GeminiResponse.error(model, prompt, "Failed to read uploaded image file: " + e.getMessage())
                );
            }
        }

        GeminiResponse response = geminiService.generate(prompt, imageBytes, mimeType, model);
        return ResponseEntity.ok(response);
    }

    /**
     * Directly generates and returns the pure HTML file content with Content-Type: text/html.
     * Perfect for direct browser preview or file download.
     */
    @PostMapping(value = "/generate-app/raw", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> generateMultipartRaw(
            @RequestParam("prompt") String prompt,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "model", required = false) String model) {

        ResponseEntity<GeminiResponse> responseEntity = generateMultipart(prompt, file, model);
        GeminiResponse body = responseEntity.getBody();

        if (body != null && body.isSuccess()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/html; charset=UTF-8"))
                    .body(body.getHtmlCode());
        }

        String errorHtml = "<!DOCTYPE html><html><body><h1>Error Generating App</h1><p>" +
                (body != null && body.getError() != null ? body.getError() : "Unknown error") +
                "</p></body></html>";
        return ResponseEntity.status(responseEntity.getStatusCode())
                .contentType(MediaType.parseMediaType("text/html; charset=UTF-8"))
                .body(errorHtml);
    }

    /**
     * Multimodal query endpoint supporting application/json with Base64 encoded image.
     *
     * @param request JSON body with prompt, optional imageBase64, mimeType, and model
     * @return GeminiResponse with the single-file HTML code
     */
    @PostMapping(value = {"/generate-json", "/generate-app-json", "/generate"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<GeminiResponse> generateJson(@RequestBody GeminiJsonRequest request) {
        if (request == null || request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    GeminiResponse.error(request != null ? request.getModel() : null, null, "Prompt is required in JSON payload")
            );
        }

        if (request.getApiKey() != null && !request.getApiKey().trim().isEmpty()) {
            geminiConfig.setCustomApiKey(request.getApiKey());
        }

        byte[] imageBytes = null;
        String mimeType = request.getMimeType();

        if (request.getImageBase64() != null && !request.getImageBase64().trim().isEmpty()) {
            String rawBase64 = request.getImageBase64().trim();

            // Handle data URI scheme e.g. "data:image/png;base64,..."
            if (rawBase64.startsWith("data:") && rawBase64.contains(";base64,")) {
                int commaIdx = rawBase64.indexOf(",");
                String meta = rawBase64.substring(5, rawBase64.indexOf(";base64,"));
                if (mimeType == null || mimeType.trim().isEmpty()) {
                    mimeType = meta;
                }
                rawBase64 = rawBase64.substring(commaIdx + 1);
            }

            // Remove any whitespace, newlines, and non-base64 characters
            rawBase64 = rawBase64.replaceAll("[^A-Za-z0-9+/=]", "");

            try {
                imageBytes = Base64.getMimeDecoder().decode(rawBase64);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(
                        GeminiResponse.error(request.getModel(), request.getPrompt(), "Invalid Base64 string for image: " + e.getMessage())
                );
            }
        }

        String prompt = request.getPrompt();
        if (request.getCustomInstructions() != null && !request.getCustomInstructions().trim().isEmpty()) {
            prompt = "[User Context & Preferences: " + request.getCustomInstructions().trim() + "]\n\n" + prompt;
        }

        GeminiResponse response = geminiService.generate(prompt, imageBytes, mimeType, request.getModel());
        return ResponseEntity.ok(response);
    }

    /**
     * Returns raw HTML code with text/html content-type for JSON requests.
     */
    @PostMapping(value = "/generate-app-json/raw", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> generateJsonRaw(@RequestBody GeminiJsonRequest request) {
        ResponseEntity<GeminiResponse> responseEntity = generateJson(request);
        GeminiResponse body = responseEntity.getBody();

        if (body != null && body.isSuccess()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/html; charset=UTF-8"))
                    .body(body.getHtmlCode());
        }

        String errorHtml = "<!DOCTYPE html><html><body><h1>Error Generating App</h1><p>" +
                (body != null && body.getError() != null ? body.getError() : "Unknown error") +
                "</p></body></html>";
        return ResponseEntity.status(responseEntity.getStatusCode())
                .contentType(MediaType.parseMediaType("text/html; charset=UTF-8"))
                .body(errorHtml);
    }

    /**
     * Returns supported Gemini models and API key configuration status.
     */
    @GetMapping("/models")
    public ResponseEntity<GeminiModelsResponse> getModels() {
        GeminiModelsResponse response = new GeminiModelsResponse(
                geminiConfig.getDefaultModel(),
                geminiConfig.getSupportedModels(),
                geminiConfig.isApiKeyConfigured()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Quick health check endpoint for Gemini integration.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "defaultModel", geminiConfig.getDefaultModel(),
                "apiKeyConfigured", geminiConfig.isApiKeyConfigured(),
                "supportedModelsCount", geminiConfig.getSupportedModels().size()
        ));
    }
}
