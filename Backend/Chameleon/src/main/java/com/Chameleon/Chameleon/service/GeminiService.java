package com.Chameleon.Chameleon.service;

import com.Chameleon.Chameleon.config.GeminiConfig;
import com.Chameleon.Chameleon.dto.GeminiResponse;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    public static final String APP_GENERATION_SYSTEM_INSTRUCTION = """
            You are an expert front-end engineer, full-stack developer, and UI/UX designer.
            The user will provide a prompt describing an application (e.g. "I need this app" or description of features) and may also attach an image mockup or wireframe.
            Your task is to build and output a complete, fully functional, responsive, and beautiful single-file application containing HTML, CSS, and JavaScript.

            MANDATORY RULES:
            1. Output MUST be ONLY the raw, executable HTML code.
            2. Combine all HTML, CSS, and JavaScript into a SINGLE file:
               - All styling MUST be inside <style> tags in the <head>. Provide modern, elegant CSS (CSS variables, responsive layouts with flexbox/grid, animations, transitions, typography).
               - All interactive logic MUST be inside <script> tags before </body>. Ensure complete JavaScript functionality (event listeners, state management, full feature implementation, localStorage where useful). Do NOT leave placeholder comments or unfinished logic.
            3. DO NOT output markdown code blocks (NEVER use ```html or ```).
            4. DO NOT output any introductory text, explanation, summary, or conversational commentary.
            5. Start directly with <!DOCTYPE html> and end strictly with </html>.
            """;

    private final GeminiConfig geminiConfig;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiService(GeminiConfig geminiConfig, ObjectMapper objectMapper) {
        this.geminiConfig = geminiConfig;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .build();
    }

    /**
     * Sends prompt and optional image to Gemini model.
     *
     * @param prompt     The text prompt / query
     * @param imageBytes Optional raw image byte array (null if text-only query)
     * @param mimeType   Optional MIME type (defaults to image/jpeg if not detected)
     * @param modelName  Gemini model name (defaults to configured default model if blank)
     * @return GeminiResponse containing the generated text or error details
     */
    public GeminiResponse generate(String prompt, byte[] imageBytes, String mimeType, String modelName) {
        String resolvedModel = geminiConfig.resolveModel(modelName);

        if (prompt == null || prompt.trim().isEmpty()) {
            return GeminiResponse.error(resolvedModel, prompt, "Prompt cannot be empty");
        }

        String apiKey = geminiConfig.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return GeminiResponse.error(resolvedModel, prompt,
                    "GEMINI_API_KEY is not configured in system environment variables or application properties.");
        }

        GeminiResponse response = executeGeminiRequest(resolvedModel, prompt, imageBytes, mimeType, apiKey);

        // If requested model returned 503 (high demand), 404, or timed out, fallback to default model (gemini-3.6-flash)
        if (!response.isSuccess() && !resolvedModel.equalsIgnoreCase(geminiConfig.getDefaultModel())) {
            String err = response.getError() != null ? response.getError() : "";
            if (err.contains("503") || err.toLowerCase().contains("high demand") ||
                err.toLowerCase().contains("timed out") || err.contains("404")) {
                log.warn("Model {} encountered issue: '{}'. Automatically falling back to {}...",
                        resolvedModel, err, geminiConfig.getDefaultModel());
                GeminiResponse fallbackResponse = executeGeminiRequest(
                        geminiConfig.getDefaultModel(), prompt, imageBytes, mimeType, apiKey
                );
                if (fallbackResponse.isSuccess()) {
                    return fallbackResponse;
                }
            }
        }

        return response;
    }

    private GeminiResponse executeGeminiRequest(String model, String prompt, byte[] imageBytes, String mimeType, String apiKey) {
        try {
            String requestJson = buildGeminiRequestBody(prompt, imageBytes, mimeType);
            String url = String.format("%s/%s:generateContent?key=%s", GEMINI_BASE_URL, model, apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            log.info("Sending request to Gemini model: {}", model);
            HttpResponse<String> httpResponse = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            int statusCode = httpResponse.statusCode();
            String responseBody = httpResponse.body();

            if (statusCode != 200) {
                log.error("Gemini API returned error code {}: {}", statusCode, responseBody);
                String errorMessage = parseErrorMessage(responseBody, statusCode);
                return GeminiResponse.error(model, prompt, errorMessage);
            }

            return parseSuccessResponse(responseBody, model, prompt);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Gemini API request interrupted", e);
            return GeminiResponse.error(model, prompt, "Request was interrupted: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to query Gemini API model {}", model, e);
            return GeminiResponse.error(model, prompt, "Error communicating with Gemini API: " + e.getMessage());
        }
    }

    private String buildGeminiRequestBody(String prompt, byte[] imageBytes, String mimeType) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();

        // System Instruction to force single-file HTML/CSS/JS output
        ObjectNode systemInstruction = root.putObject("system_instruction");
        ArrayNode systemParts = systemInstruction.putArray("parts");
        ObjectNode systemText = systemParts.addObject();
        systemText.put("text", APP_GENERATION_SYSTEM_INSTRUCTION);

        ArrayNode contentsArray = root.putArray("contents");
        ObjectNode contentObj = contentsArray.addObject();
        ArrayNode partsArray = contentObj.putArray("parts");

        // Text part
        ObjectNode textPart = partsArray.addObject();
        textPart.put("text", prompt);

        // Image part if provided
        if (imageBytes != null && imageBytes.length > 0) {
            String resolvedMimeType = (mimeType != null && !mimeType.trim().isEmpty())
                    ? mimeType.trim()
                    : detectMimeType(imageBytes);

            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            ObjectNode imagePart = partsArray.addObject();
            ObjectNode inlineData = imagePart.putObject("inline_data");
            inlineData.put("mime_type", resolvedMimeType);
            inlineData.put("data", base64Image);
        }

        return objectMapper.writeValueAsString(root);
    }

    private GeminiResponse parseSuccessResponse(String responseBody, String model, String prompt) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode candidates = rootNode.path("candidates");

            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                String finishReason = firstCandidate.path("finishReason").asText("STOP");
                JsonNode parts = firstCandidate.path("content").path("parts");

                StringBuilder sb = new StringBuilder();
                if (parts.isArray()) {
                    for (JsonNode part : parts) {
                        if (part.has("text")) {
                            sb.append(part.get("text").asText());
                        }
                    }
                }

                String generatedText = sb.toString();
                String cleanedHtml = cleanHtmlOutput(generatedText);

                if (cleanedHtml.isEmpty() && firstCandidate.has("finishReason")) {
                    cleanedHtml = "(No HTML code returned, finish reason: " + finishReason + ")";
                }

                return GeminiResponse.success(model, prompt, cleanedHtml, finishReason);
            }

            // In case candidates are empty, check for promptFeedback
            JsonNode promptFeedback = rootNode.path("promptFeedback");
            if (!promptFeedback.isMissingNode()) {
                return GeminiResponse.error(model, prompt, "Query was blocked by safety filters: " + promptFeedback.toString());
            }

            return GeminiResponse.error(model, prompt, "No response candidates returned by Gemini.");

        } catch (Exception e) {
            log.error("Error parsing Gemini JSON response", e);
            return GeminiResponse.error(model, prompt, "Failed to parse Gemini response: " + e.getMessage());
        }
    }

    private String parseErrorMessage(String responseBody, int statusCode) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode errorNode = rootNode.path("error");
            if (!errorNode.isMissingNode() && errorNode.has("message")) {
                return String.format("Gemini API Error (%d): %s", statusCode, errorNode.get("message").asText());
            }
        } catch (Exception ignored) {
        }
        return String.format("Gemini API Error with status code %d. Response: %s", statusCode, responseBody);
    }

    private String detectMimeType(byte[] bytes) {
        if (bytes == null || bytes.length < 4) {
            return "image/jpeg";
        }
        // PNG magic number: 89 50 4E 47
        if ((bytes[0] & 0xFF) == 0x89 && (bytes[1] & 0xFF) == 0x50 &&
            (bytes[2] & 0xFF) == 0x4E && (bytes[3] & 0xFF) == 0x47) {
            return "image/png";
        }
        // JPEG magic number: FF D8 FF
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        // GIF magic number: GIF8
        if (bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == '8') {
            return "image/gif";
        }
        // WebP: RIFF ... WEBP
        if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
            bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "image/webp";
        }
        return "image/jpeg";
    }

    /**
     * Strips any markdown fences, conversational greetings, or closing comments,
     * ensuring ONLY the single-file HTML code is returned.
     */
    public String cleanHtmlOutput(String rawText) {
        if (rawText == null) {
            return "";
        }
        String text = rawText.trim();

        // Strip markdown code block fences if present (```html ... ``` or ```xml ... ``` or ``` ... ```)
        if (text.startsWith("```html")) {
            text = text.substring(7).trim();
        } else if (text.startsWith("```xml")) {
            text = text.substring(6).trim();
        } else if (text.startsWith("```")) {
            text = text.substring(3).trim();
        }

        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3).trim();
        }

        // If the model included conversational text before <!DOCTYPE or <html, trim it
        int docTypeIndex = text.toUpperCase().indexOf("<!DOCTYPE");
        if (docTypeIndex != -1) {
            text = text.substring(docTypeIndex).trim();
        } else {
            int htmlIndex = text.toLowerCase().indexOf("<html");
            if (htmlIndex != -1) {
                text = text.substring(htmlIndex).trim();
            }
        }

        // If the model included conversational text after </html>, trim it
        int closeHtmlIndex = text.toLowerCase().lastIndexOf("</html>");
        if (closeHtmlIndex != -1) {
            text = text.substring(0, closeHtmlIndex + 7).trim();
        }

        return text;
    }
}
