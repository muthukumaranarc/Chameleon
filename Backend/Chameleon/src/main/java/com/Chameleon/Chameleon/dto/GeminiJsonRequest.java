package com.Chameleon.Chameleon.dto;

public class GeminiJsonRequest {
    private String prompt;
    private String imageBase64;
    private String mimeType;
    private String model;
    private String apiKey;
    private String customInstructions;

    public GeminiJsonRequest() {
    }

    public GeminiJsonRequest(String prompt, String imageBase64, String mimeType, String model) {
        this.prompt = prompt;
        this.imageBase64 = imageBase64;
        this.mimeType = mimeType;
        this.model = model;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getCustomInstructions() {
        return customInstructions;
    }

    public void setCustomInstructions(String customInstructions) {
        this.customInstructions = customInstructions;
    }
}
