# Chameleon Backend - Gemini Multimodal Web App Generator API

This document details the API endpoints provided by the Chameleon Spring Boot Backend.

The application accepts user requests describing desired applications (e.g., *"I need a todo app with categories and dark mode"* or *"Build an interactive financial dashboard"*) along with optional image mockups/wireframes/screenshots. It generates a **fully functional single-file web application containing HTML, embedded CSS (`<style>`), and embedded JavaScript (`<script>`)**.

The output is strictly the pure, executable HTML code—without markdown fences or conversational text.

---

## 1. Overview & Configuration

- **Base URL:** `http://localhost:8080`
- **Environment Variable:**
  ```bash
  # Windows PowerShell
  $env:GEMINI_API_KEY="your-gemini-api-key-here"

  # Windows Command Prompt
  set GEMINI_API_KEY=your-gemini-api-key-here

  # Linux / macOS
  export GEMINI_API_KEY="your-gemini-api-key-here"
  ```
  *(Or configure `gemini.api.key` in `src/main/resources/application.properties`)*

- **Supported Gemini Models:**
  | Model Identifier | Description | Role |
  | :--- | :--- | :--- |
  | `gemini-3.6-flash` | **Default**. High-speed, stable Gemini 3 Flash multimodal model. | Primary / Default |
  | `gemini-3.8-flash` | Gemini 3.8 Flash model (auto-fallbacks to 3.6-flash on demand spikes). | Fast Multimodal |
  | `gemini-3.8-pro` | Gemini 3.8 Pro model for deep reasoning and complex UI architecture. | Advanced Reasoning |
  | `gemini-3.0-flash` | Gemini 3.0 Flash multimodal model. | Alternative Flash |
  | `gemini-3.0-pro` | Gemini 3.0 Pro model for comprehensive code generation. | Deep Comprehension |

---

## 2. Summary of Endpoints

| Method | Endpoint | Content-Type | Returns | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/gemini/generate-app` | `multipart/form-data` | `application/json` | Generate single-file HTML/CSS/JS app from text prompt + uploaded mockup/wireframe image. |
| `POST` | `/api/gemini/generate-app-json` | `application/json` | `application/json` | Generate single-file HTML/CSS/JS app from JSON payload (prompt + Base64 image). |
| `POST` | `/api/gemini/generate-app/raw` | `multipart/form-data` | `text/html` | Generates and returns raw HTML directly (for iframe preview or browser view). |
| `POST` | `/api/gemini/generate-app-json/raw` | `application/json` | `text/html` | Generates and returns raw HTML directly from JSON payload. |
| `POST` | `/api/gemini/generate` | `multipart/form-data` | `application/json` | General multimodal generation endpoint (alias to `/generate-app`). |
| `POST` | `/api/gemini/generate-json` | `application/json` | `application/json` | General JSON multimodal endpoint (alias to `/generate-app-json`). |
| `GET` | `/api/gemini/models` | `application/json` | `application/json` | Lists supported Gemini models and API key status. |
| `GET` | `/api/gemini/health` | `application/json` | `application/json` | Server health check. |

---

## 3. Detailed Endpoint Documentation

### 3.1. Generate App (Multipart Form-Data)

Use this endpoint to send an app description along with an optional uploaded mockup/wireframe image.

- **URL:** `/api/gemini/generate-app` *(or `/api/gemini/generate`)*
- **Method:** `POST`
- **Consumes:** `multipart/form-data`
- **Produces:** `application/json`

#### Request Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | String | **Yes** | What app to generate (e.g. *"I need a Pomodoro Timer app with sound notifications and statistics"*). |
| `file` | Binary File | No | UI mockup / wireframe / design screenshot (PNG, JPEG, WebP). |
| `model` | String | No | Gemini model name (defaults to `gemini-3.6-flash`). |

#### Example `curl` Request:
```bash
curl -X POST http://localhost:8080/api/gemini/generate-app \
  -F "prompt=I need an expense tracker app with category breakdown and charts" \
  -F "file=@C:/path/to/mockup.png" \
  -F "model=gemini-3.6-flash"
```

#### Example `fetch` (JavaScript):
```javascript
const formData = new FormData();
formData.append('prompt', 'I need a Kanban board app with drag and drop');
if (fileInput.files[0]) {
  formData.append('file', fileInput.files[0]);
}
formData.append('model', 'gemini-3.6-flash');

const res = await fetch('http://localhost:8080/api/gemini/generate-app', {
  method: 'POST',
  body: formData
});
const result = await res.json();
// result.htmlCode contains the full HTML/CSS/JS single-file app code
console.log(result.htmlCode);
```

#### Successful JSON Response (`200 OK`):
```json
{
  "success": true,
  "model": "gemini-3.6-flash",
  "prompt": "I need a Kanban board app with drag and drop",
  "htmlCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Kanban Board</title>\n  <style>\n    * { box-sizing: border-box; margin: 0; }\n    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; }\n    /* Modern CSS styling with grid/flexbox */\n  </style>\n</head>\n<body>\n  <div id=\"app\">...</div>\n  <script>\n    // Fully functional JS logic with event listeners\n  </script>\n</body>\n</html>",
  "response": "<!DOCTYPE html>...",
  "finishReason": "STOP",
  "error": null
}
```

---

### 3.2. Generate App (JSON with Base64 Image)

Use this endpoint when transmitting the app description and optional image as a JSON payload.

- **URL:** `/api/gemini/generate-app-json` *(or `/api/gemini/generate-json`)*
- **Method:** `POST`
- **Consumes:** `application/json`
- **Produces:** `application/json`

#### Request Body Schema:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | String | **Yes** | Description of the application to generate. |
| `imageBase64` | String | No | Base64-encoded image string (supports raw base64 or `data:image/png;base64,...`). |
| `mimeType` | String | No | Image MIME type (`image/png`, `image/jpeg`). Auto-detected if omitted. |
| `model` | String | No | Gemini model (defaults to `gemini-3.6-flash`). |

#### Example `curl` Request:
```bash
curl -X POST http://localhost:8080/api/gemini/generate-app-json \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I need a scientific calculator with light/dark theme toggle",
    "model": "gemini-3.6-flash"
  }'
```

#### Successful JSON Response (`200 OK`):
```json
{
  "success": true,
  "model": "gemini-3.6-flash",
  "prompt": "I need a scientific calculator with light/dark theme toggle",
  "htmlCode": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>...",
  "response": "<!DOCTYPE html>...",
  "finishReason": "STOP",
  "error": null
}
```

---

### 3.3. Direct HTML Raw Preview Endpoints

If you want the backend to return `Content-Type: text/html; charset=UTF-8` directly (to render immediately in an `<iframe>` or preview in a browser tab), use the `/raw` endpoints:

- **Multipart:** `POST /api/gemini/generate-app/raw`
- **JSON:** `POST /api/gemini/generate-app-json/raw`

#### Example (`JavaScript / iframe Preview`):
```javascript
const response = await fetch('http://localhost:8080/api/gemini/generate-app-json/raw', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'I need a markdown notes app' })
});

const htmlString = await response.text();
// Render directly into an iframe
document.getElementById('previewIframe').srcdoc = htmlString;
```

---

### 3.4. Supported Models & Health Status

#### `GET /api/gemini/models`
Returns available models and whether `GEMINI_API_KEY` is loaded.

```json
{
  "defaultModel": "gemini-3.6-flash",
  "supportedModels": [
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-3.8-pro",
    "gemini-3.0-flash",
    "gemini-3.0-pro"
  ],
  "apiKeyConfigured": true
}
```

#### `GET /api/gemini/health`
```json
{
  "status": "UP",
  "defaultModel": "gemini-3.6-flash",
  "apiKeyConfigured": true,
  "supportedModelsCount": 5
}
```

---

## 4. Single-File Code Output Guarantees

The backend enforces strict output formatting:
1. **Single File:** Every generated application combines HTML markup, modern styling within `<style>...</style>`, and functional JavaScript inside `<script>...</script>` into a single self-contained HTML document.
2. **Pure Code Guarantee:** The backend strips any markdown code blocks (````html ... ````), conversational preambles (e.g. *"Here is your app:"*), and trailing remarks. The string always begins with `<!DOCTYPE html>` and ends with `</html>`.
3. **Automatic Fallback:** If a preview model (such as `gemini-3.8-flash`) experiences high traffic spikes (503) or times out, the backend automatically retries on `gemini-3.6-flash` so app generation never fails.
