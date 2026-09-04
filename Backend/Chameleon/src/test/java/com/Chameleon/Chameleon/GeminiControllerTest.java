package com.Chameleon.Chameleon;

import com.Chameleon.Chameleon.config.GeminiConfig;
import com.Chameleon.Chameleon.controller.GeminiController;
import com.Chameleon.Chameleon.dto.GeminiResponse;
import com.Chameleon.Chameleon.service.GeminiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GeminiController.class)
class GeminiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GeminiService geminiService;

    @MockitoBean
    private GeminiConfig geminiConfig;

    @Test
    void testGetModels() throws Exception {
        when(geminiConfig.getDefaultModel()).thenReturn("gemini-3.6-flash");
        when(geminiConfig.getSupportedModels()).thenReturn(List.of(
                "gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.8-pro", "gemini-3.0-flash", "gemini-3.0-pro"
        ));
        when(geminiConfig.isApiKeyConfigured()).thenReturn(true);

        mockMvc.perform(get("/api/gemini/models"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defaultModel").value("gemini-3.6-flash"))
                .andExpect(jsonPath("$.apiKeyConfigured").value(true))
                .andExpect(jsonPath("$.supportedModels[0]").value("gemini-3.6-flash"))
                .andExpect(jsonPath("$.supportedModels[1]").value("gemini-3.8-flash"))
                .andExpect(jsonPath("$.supportedModels[2]").value("gemini-3.8-pro"))
                .andExpect(jsonPath("$.supportedModels[3]").value("gemini-3.0-flash"));
    }

    @Test
    void testGetHealth() throws Exception {
        when(geminiConfig.getDefaultModel()).thenReturn("gemini-3.6-flash");
        when(geminiConfig.isApiKeyConfigured()).thenReturn(true);
        when(geminiConfig.getSupportedModels()).thenReturn(List.of("gemini-3.6-flash"));

        mockMvc.perform(get("/api/gemini/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.defaultModel").value("gemini-3.6-flash"));
    }

    @Test
    void testGenerateMultipartSuccess() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "test.png", "image/png", "sample-image-bytes".getBytes()
        );

        GeminiResponse expectedResponse = GeminiResponse.success(
                "gemini-3.8-flash", "What is in this image?", "A sample image", "STOP"
        );

        when(geminiService.generate(eq("What is in this image?"), any(byte[].class), eq("image/png"), eq("gemini-3.8-flash")))
                .thenReturn(expectedResponse);

        mockMvc.perform(multipart("/api/gemini/generate")
                        .file(mockFile)
                        .param("prompt", "What is in this image?")
                        .param("model", "gemini-3.8-flash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.model").value("gemini-3.8-flash"))
                .andExpect(jsonPath("$.htmlCode").value("A sample image"))
                .andExpect(jsonPath("$.response").value("A sample image"))
                .andExpect(jsonPath("$.finishReason").value("STOP"));
    }

    @Test
    void testGenerateAppMultipartSuccess() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "mockup.png", "image/png", "mockup-bytes".getBytes()
        );

        String sampleHtml = "<!DOCTYPE html><html><head><style></style></head><body><h1>Todo</h1><script></script></body></html>";
        GeminiResponse expectedResponse = GeminiResponse.success(
                "gemini-3.6-flash", "I need a todo app", sampleHtml, "STOP"
        );

        when(geminiService.generate(eq("I need a todo app"), any(byte[].class), eq("image/png"), eq("gemini-3.6-flash")))
                .thenReturn(expectedResponse);

        mockMvc.perform(multipart("/api/gemini/generate-app")
                        .file(mockFile)
                        .param("prompt", "I need a todo app")
                        .param("model", "gemini-3.6-flash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.htmlCode").value(sampleHtml));
    }

    @Test
    void testGenerateJsonSuccess() throws Exception {
        String jsonPayload = """
                {
                    "prompt": "Explain this diagram",
                    "imageBase64": "aGVsbG8gd29ybGQ=",
                    "mimeType": "image/png",
                    "model": "gemini-3.8-pro"
                }
                """;

        GeminiResponse expectedResponse = GeminiResponse.success(
                "gemini-3.8-pro", "Explain this diagram", "This is an architectural diagram", "STOP"
        );

        when(geminiService.generate(eq("Explain this diagram"), any(byte[].class), eq("image/png"), eq("gemini-3.8-pro")))
                .thenReturn(expectedResponse);

        mockMvc.perform(post("/api/gemini/generate-json")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.model").value("gemini-3.8-pro"))
                .andExpect(jsonPath("$.htmlCode").value("This is an architectural diagram"))
                .andExpect(jsonPath("$.response").value("This is an architectural diagram"));
    }

    @Test
    void testGenerateAppJsonSuccess() throws Exception {
        String jsonPayload = """
                {
                    "prompt": "I need a calculator app",
                    "model": "gemini-3.6-flash"
                }
                """;

        String sampleHtml = "<!DOCTYPE html><html><head><style></style></head><body><div id='calc'></div><script></script></body></html>";
        GeminiResponse expectedResponse = GeminiResponse.success(
                "gemini-3.6-flash", "I need a calculator app", sampleHtml, "STOP"
        );

        when(geminiService.generate(eq("I need a calculator app"), any(), any(), eq("gemini-3.6-flash")))
                .thenReturn(expectedResponse);

        mockMvc.perform(post("/api/gemini/generate-app-json")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.htmlCode").value(sampleHtml));
    }

    @Test
    void testGenerateJsonMissingPrompt() throws Exception {
        String jsonPayload = """
                {
                    "prompt": "",
                    "model": "gemini-3.8-flash"
                }
                """;

        mockMvc.perform(post("/api/gemini/generate-json")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Prompt is required in JSON payload"));
    }
}
