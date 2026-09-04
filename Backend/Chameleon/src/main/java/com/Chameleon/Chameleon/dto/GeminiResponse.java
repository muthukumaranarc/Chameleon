package com.Chameleon.Chameleon.dto;

public class GeminiResponse {
    private boolean success;
    private String model;
    private String prompt;
    private String htmlCode;
    private String response;
    private String finishReason;
    private String error;

    public GeminiResponse() {
    }

    public static GeminiResponse success(String model, String prompt, String htmlCode, String finishReason) {
        GeminiResponse res = new GeminiResponse();
        res.setSuccess(true);
        res.setModel(model);
        res.setPrompt(prompt);
        res.setHtmlCode(htmlCode);
        res.setResponse(htmlCode);
        res.setFinishReason(finishReason);
        return res;
    }

    public static GeminiResponse error(String model, String prompt, String error) {
        GeminiResponse res = new GeminiResponse();
        res.setSuccess(false);
        res.setModel(model);
        res.setPrompt(prompt);
        res.setError(error);
        return res;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getHtmlCode() {
        return htmlCode != null ? htmlCode : response;
    }

    public void setHtmlCode(String htmlCode) {
        this.htmlCode = htmlCode;
        if (this.response == null) {
            this.response = htmlCode;
        }
    }

    public String getResponse() {
        return response != null ? response : htmlCode;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
