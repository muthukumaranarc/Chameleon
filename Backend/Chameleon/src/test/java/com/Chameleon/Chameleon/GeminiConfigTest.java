package com.Chameleon.Chameleon;

import com.Chameleon.Chameleon.config.GeminiConfig;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeminiConfigTest {

    @Test
    void testSupportedModelsContainsGemini3Series() {
        GeminiConfig config = new GeminiConfig();
        assertTrue(config.getSupportedModels().contains("gemini-3.6-flash"));
        assertTrue(config.getSupportedModels().contains("gemini-3.8-flash"));
        assertTrue(config.getSupportedModels().contains("gemini-3.8-pro"));
        assertTrue(config.getSupportedModels().contains("gemini-3.0-flash"));
        assertTrue(config.getSupportedModels().contains("gemini-3.0-pro"));
        assertEquals("gemini-3.6-flash", config.getDefaultModel());
    }

    @Test
    void testResolveModel() {
        GeminiConfig config = new GeminiConfig();
        assertEquals("gemini-3.6-flash", config.resolveModel(null));
        assertEquals("gemini-3.6-flash", config.resolveModel("   "));
        assertEquals("gemini-3.8-pro", config.resolveModel("gemini-3.8-pro"));
        assertEquals("gemini-3.0-flash", config.resolveModel("GEMINI-3.0-FLASH"));
    }
}
