package com.Chameleon.Chameleon.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class GeminiConfig {

    public static final String DEFAULT_MODEL = "gemini-3.6-flash";

    public static final List<String> SUPPORTED_MODELS = List.of(
            "gemini-3.6-flash",
            "gemini-3.8-flash",
            "gemini-3.8-pro",
            "gemini-3.0-flash",
            "gemini-3.0-pro"
    );

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String apiKey;

    @Value("${gemini.default-model:" + DEFAULT_MODEL + "}")
    private String defaultModel;

    public String getApiKey() {
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            return apiKey.trim();
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.trim().isEmpty()) {
            return envKey.trim();
        }
        return null;
    }

    public boolean isApiKeyConfigured() {
        String key = getApiKey();
        return key != null && !key.isEmpty();
    }

    public String getDefaultModel() {
        if (defaultModel != null && !defaultModel.trim().isEmpty()) {
            return defaultModel.trim();
        }
        return DEFAULT_MODEL;
    }

    public List<String> getSupportedModels() {
        return SUPPORTED_MODELS;
    }

    public boolean isModelSupported(String model) {
        if (model == null) return false;
        return SUPPORTED_MODELS.stream().anyMatch(m -> m.equalsIgnoreCase(model.trim()));
    }

    public String resolveModel(String model) {
        if (model == null || model.trim().isEmpty()) {
            return getDefaultModel();
        }
        String trimmed = model.trim();
        for (String supported : SUPPORTED_MODELS) {
            if (supported.equalsIgnoreCase(trimmed)) {
                return supported;
            }
        }
        // If user specifies a model not strictly in the enum, return trimmed model name
        return trimmed;
    }
}
