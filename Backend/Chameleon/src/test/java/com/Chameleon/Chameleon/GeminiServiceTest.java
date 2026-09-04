package com.Chameleon.Chameleon;

import com.Chameleon.Chameleon.config.GeminiConfig;
import com.Chameleon.Chameleon.service.GeminiService;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.*;

class GeminiServiceTest {

    @Test
    void testCleanHtmlOutputStripsMarkdownFences() {
        GeminiService service = new GeminiService(new GeminiConfig(), new ObjectMapper());

        String input = """
                ```html
                <!DOCTYPE html>
                <html lang="en">
                <head><title>App</title><style>body { color: red; }</style></head>
                <body><h1>Hello</h1><script>console.log('hi');</script></body>
                </html>
                ```
                """;

        String cleaned = service.cleanHtmlOutput(input);
        assertFalse(cleaned.startsWith("```"));
        assertFalse(cleaned.endsWith("```"));
        assertTrue(cleaned.startsWith("<!DOCTYPE html>"));
        assertTrue(cleaned.endsWith("</html>"));
    }

    @Test
    void testCleanHtmlOutputStripsConversationalPreambleAndEnding() {
        GeminiService service = new GeminiService(new GeminiConfig(), new ObjectMapper());

        String input = """
                Sure! Here is the complete single-file application you requested:
                <!DOCTYPE html>
                <html lang="en">
                <head><title>Calculator</title><style>body { font-family: sans-serif; }</style></head>
                <body><div id="calc"></div><script>document.title = 'Ready';</script></body>
                </html>
                I hope this helps you! Let me know if you need changes.
                """;

        String cleaned = service.cleanHtmlOutput(input);
        assertTrue(cleaned.startsWith("<!DOCTYPE html>"));
        assertTrue(cleaned.endsWith("</html>"));
        assertFalse(cleaned.contains("Sure! Here is"));
        assertFalse(cleaned.contains("I hope this helps"));
    }

    @Test
    void testCleanHtmlOutputWithPureHtml() {
        GeminiService service = new GeminiService(new GeminiConfig(), new ObjectMapper());

        String input = "<!DOCTYPE html><html><head><style></style></head><body><script></script></body></html>";
        String cleaned = service.cleanHtmlOutput(input);
        assertEquals(input, cleaned);
    }
}
