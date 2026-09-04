package com.Chameleon.Chameleon.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class GeminiConfig {

    public static final String DEFAULT_MODEL = "gemini-3.1-flash-lite";

    public static final List<String> SUPPORTED_MODELS = List.of(
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
            "gemini-3.8-flash",
            "gemini-flash-latest"
    );

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String apiKey;

    private volatile String customApiKey;

    @Value("${gemini.default-model:" + DEFAULT_MODEL + "}")
    private String defaultModel;

    public void setCustomApiKey(String key) {
        if (key != null && !key.trim().isEmpty()) {
            this.customApiKey = key.trim();
        }
    }

    public String getApiKey() {
        if (customApiKey != null && !customApiKey.trim().isEmpty()) {
            return customApiKey.trim();
        }
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            return apiKey.trim();
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.trim().isEmpty()) {
            return envKey.trim();
        }
        String dotEnvKey = readFromDotEnv();
        if (dotEnvKey != null && !dotEnvKey.trim().isEmpty()) {
            return dotEnvKey.trim();
        }
        return "";
    }

    private String readFromDotEnv() {
        String[] potentialPaths = new String[]{
                ".env",
                "../.env",
                "../../.env",
                System.getProperty("user.dir") + "/.env",
                System.getProperty("user.home") + "/.env"
        };
        for (String pathStr : potentialPaths) {
            try {
                java.io.File file = new java.io.File(pathStr);
                if (file.exists() && file.isFile()) {
                    for (String line : java.nio.file.Files.readAllLines(file.toPath())) {
                        line = line.trim();
                        if (line.startsWith("GEMINI_API_KEY=")) {
                            return line.substring("GEMINI_API_KEY=".length()).trim().replaceAll("^\"|\"$|^'|'$", "");
                        }
                    }
                }
            } catch (Exception ignored) {
            }
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
