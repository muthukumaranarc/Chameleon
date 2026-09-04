package com.Chameleon.Chameleon;

import com.Chameleon.Chameleon.config.GeminiConfig;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeminiConfigTest {

    @Test
    void testSupportedModelsContainsGemini3Series() {
        GeminiConfig config = new GeminiConfig();
        assertTrue(config.getSupportedModels().contains("gemini-3.1-flash-lite"));
        assertTrue(config.getSupportedModels().contains("gemini-3.5-flash"));
        assertTrue(config.getSupportedModels().contains("gemini-3.7-flash"));
        assertTrue(config.getSupportedModels().contains("gemini-3.6-flash"));
        assertTrue(config.getSupportedModels().contains("gemini-3.8-flash"));
        assertEquals("gemini-3.1-flash-lite", config.getDefaultModel());
    }

    @Test
    void testResolveModel() {
        GeminiConfig config = new GeminiConfig();
        assertEquals("gemini-3.1-flash-lite", config.resolveModel(null));
        assertEquals("gemini-3.1-flash-lite", config.resolveModel("   "));
        assertEquals("gemini-3.8-flash", config.resolveModel("gemini-3.8-flash"));
        assertEquals("gemini-3.6-flash", config.resolveModel("GEMINI-3.6-FLASH"));
    }
}
