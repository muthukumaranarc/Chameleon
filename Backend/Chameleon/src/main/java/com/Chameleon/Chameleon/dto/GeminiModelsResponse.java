package com.Chameleon.Chameleon.dto;

import java.util.List;

public class GeminiModelsResponse {
    private String defaultModel;
    private List<String> supportedModels;
    private boolean apiKeyConfigured;

    public GeminiModelsResponse() {
    }

    public GeminiModelsResponse(String defaultModel, List<String> supportedModels, boolean apiKeyConfigured) {
        this.defaultModel = defaultModel;
        this.supportedModels = supportedModels;
        this.apiKeyConfigured = apiKeyConfigured;
    }

    public String getDefaultModel() {
        return defaultModel;
    }

    public void setDefaultModel(String defaultModel) {
        this.defaultModel = defaultModel;
    }

    public List<String> getSupportedModels() {
        return supportedModels;
    }

    public void setSupportedModels(List<String> supportedModels) {
        this.supportedModels = supportedModels;
    }

    public boolean isApiKeyConfigured() {
        return apiKeyConfigured;
    }

    public void setApiKeyConfigured(boolean apiKeyConfigured) {
        this.apiKeyConfigured = apiKeyConfigured;
    }
}
