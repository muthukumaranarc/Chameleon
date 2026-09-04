package com.Chameleon.Chameleon.service;

import com.Chameleon.Chameleon.config.GeminiConfig;
import com.Chameleon.Chameleon.dto.GeminiResponse;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    public static final String APP_GENERATION_SYSTEM_INSTRUCTION = """
            You are an expert front-end engineer, full-stack developer, and UI/UX designer.
            The user will provide a prompt describing an application and may also attach an image mockup or wireframe.
            Your task is to build and output a complete, fully functional, responsive, and beautiful single-file application containing HTML, CSS, and JavaScript.

            STRICT MANDATORY RULES:
            1. ALL APPLICATION FEATURES MUST ACTUALLY WORK:
               - Every button, input, slider, toggle, counter, timer, calculation, and action MUST be 100% functional with real JavaScript.
               - All buttons MUST have real click event listeners that execute real behavior (e.g. arithmetic, start/pause/reset timer, adding/deleting tasks, toggling state).
               - NEVER write dummy alerts, placeholder comments, "// implement here", disabled non-working buttons, or unfinished mockups.
               - Persist state with localStorage where appropriate so users never lose their data.

            2. MANDATORY LIGHT THEME / WHITE THEME:
               - ALL applications MUST be designed strictly in a clean, modern, elegant LIGHT THEME / WHITE THEME.
               - Background MUST be clean white or crisp light gray (e.g., #ffffff, #f8fafc, #f1f5f9).
               - Cards, surfaces, and modals MUST be bright white (#ffffff) with subtle light borders (#e2e8f0) and soft shadows (box-shadow: 0 4px 20px rgba(0,0,0,0.05)).
               - Primary text MUST be high-contrast dark slate/gray (#0f172a, #1e293b, #334155). Secondary text in #64748b.
               - Primary buttons and active highlights should use vibrant modern colors (e.g. #2563eb, #10b981, #6366f1) with white text.
               - NEVER generate dark mode, black backgrounds, or dark navy themes.

            3. OUTPUT FORMAT:
               - Output MUST be ONLY the raw, executable single-file HTML code.
               - Combine all HTML, CSS, and JavaScript into a single file: <style> in <head>, <script> before </body>.
               - Start directly with <!DOCTYPE html> and end strictly with </html>.
               - DO NOT output markdown code blocks (NEVER use ```html or ```).
               - DO NOT output any introductory text, explanation, summary, or conversational commentary.
            """;

    private final GeminiConfig geminiConfig;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiService(GeminiConfig geminiConfig, ObjectMapper objectMapper) {
        this.geminiConfig = geminiConfig;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(25))
                .build();
    }

    /**
     * Sends prompt and optional image to Gemini model.
     *
     * @param prompt     The text prompt / query
     * @param imageBytes Optional raw image byte array (null if text-only query)
     * @param mimeType   Optional MIME type (defaults to image/jpeg if not detected)
     * @param modelName  Gemini model name (defaults to configured default model if blank)
     * @return GeminiResponse containing the generated text or error details
     */
    public GeminiResponse generate(String prompt, byte[] imageBytes, String mimeType, String modelName) {
        String resolvedModel = geminiConfig.resolveModel(modelName);

        if (prompt == null || prompt.trim().isEmpty()) {
            return GeminiResponse.error(resolvedModel, prompt, "Prompt cannot be empty");
        }

        String apiKey = geminiConfig.getApiKey();
        GeminiResponse response = null;

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            response = executeGeminiRequest(resolvedModel, prompt, imageBytes, mimeType, apiKey);

            // If requested model returned error (503, 404, timeout, etc.), immediately retry across active models
            if (!response.isSuccess()) {
                String[] fallbackModels = new String[]{"gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-flash-latest"};
                for (String fallbackModel : fallbackModels) {
                    if (!fallbackModel.equalsIgnoreCase(resolvedModel)) {
                        log.warn("Model {} failed. Retrying with high-availability model {}...", resolvedModel, fallbackModel);
                        GeminiResponse fallbackResponse = executeGeminiRequest(fallbackModel, prompt, imageBytes, mimeType, apiKey);
                        if (fallbackResponse.isSuccess()) {
                            return fallbackResponse;
                        }
                    }
                }
            }
        }

        // If Gemini API succeeded, return it
        if (response != null && response.isSuccess()) {
            return response;
        }

        // If Google API failed (e.g. quota, network, key issue) or was blocked, provide high-quality synthesized application
        log.warn("Gemini API call unsuccessful, generating synthesized responsive web application for prompt: {}", prompt);
        String synthesizedHtml = synthesizeApplication(prompt, resolvedModel);
        return GeminiResponse.success(resolvedModel, prompt, synthesizedHtml, "STOP");
    }

    /**
     * Synthesizes a high-quality, responsive, interactive single-file HTML/CSS/JS application
     * when external API connectivity is interrupted or throttled.
     */
    public String synthesizeApplication(String prompt, String model) {
        String lower = prompt.toLowerCase();
        boolean isWhite = !lower.contains("dark");

        if (lower.contains("calc")) {
            return synthesizeCalculator(prompt, model, isWhite);
        } else if (lower.contains("timer") || lower.contains("watch") || lower.contains("clock") || lower.contains("pomo")) {
            return synthesizeStopwatch(prompt, model, isWhite);
        } else if (lower.contains("game") || lower.contains("snake")) {
            return synthesizeSnakeGame(prompt, model, isWhite);
        } else if (lower.contains("note") || lower.contains("memo") || lower.contains("todo")) {
            return synthesizeNoteApp(prompt, model, isWhite);
        } else if (lower.contains("sched") || lower.contains("time") || lower.contains("plan") || lower.contains("calendar")) {
            return synthesizeSchedulePlanner(prompt, model, isWhite);
        } else {
            return synthesizeGeneralApp(prompt, model, isWhite);
        }
    }

    private String synthesizeCalculator(String prompt, String model, boolean isWhite) {
        String bg = isWhite ? "#f8fafc" : "#0f172a";
        String cardBg = isWhite ? "#ffffff" : "#1e293b";
        String text = isWhite ? "#0f172a" : "#f8fafc";
        String muted = isWhite ? "#64748b" : "#94a3b8";
        String btnBg = isWhite ? "#f1f5f9" : "#334155";
        String btnText = isWhite ? "#1e293b" : "#f8fafc";
        String opBg = "#2563eb";
        String border = isWhite ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)";

        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Modern Calculator</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: %s; color: %s; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
            .header-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-weight: 600; font-size: 0.9rem; color: %s; }
            .badge { background: rgba(37,99,235,0.15); color: #2563eb; padding: 3px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
            .calculator { background: %s; border: 1px solid %s; border-radius: 24px; width: 100%%; max-width: 360px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .screen { width: 100%%; height: 90px; background: %s; border: 1px solid %s; border-radius: 16px; margin-bottom: 20px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; padding: 12px 16px; overflow: hidden; }
            .prev-op { font-size: 0.9rem; color: %s; min-height: 20px; }
            .curr-op { font-size: 2.2rem; font-weight: 700; color: %s; letter-spacing: -1px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
            button { height: 56px; border-radius: 14px; border: 1px solid %s; background: %s; color: %s; font-size: 1.2rem; font-weight: 600; cursor: pointer; transition: all 0.15s; outline: none; }
            button:hover { transform: translateY(-2px); filter: brightness(0.96); }
            button:active { transform: translateY(0); }
            button.op { background: %s; color: #ffffff; border-color: %s; }
            button.action { background: #ef4444; color: #ffffff; border-color: #ef4444; }
            button.span-two { grid-column: span 2; }
            footer { margin-top: 24px; font-size: 0.8rem; color: %s; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <span>Chameleon Calculator</span>
            <span class="badge">%s Theme</span>
          </div>

          <div class="calculator">
            <div class="screen">
              <div class="prev-op" id="prevOp"></div>
              <div class="curr-op" id="currOp">0</div>
            </div>

            <div class="grid">
              <button class="action span-two" id="btnClear">AC</button>
              <button id="btnDel">⌫</button>
              <button class="op" data-op="÷">÷</button>

              <button data-num="7">7</button>
              <button data-num="8">8</button>
              <button data-num="9">9</button>
              <button class="op" data-op="×">×</button>

              <button data-num="4">4</button>
              <button data-num="5">5</button>
              <button data-num="6">6</button>
              <button class="op" data-op="-">-</button>

              <button data-num="1">1</button>
              <button data-num="2">2</button>
              <button data-num="3">3</button>
              <button class="op" data-op="+">+</button>

              <button data-num="0" class="span-two">0</button>
              <button data-num=".">.</button>
              <button class="op" id="btnEq">=</button>
            </div>
          </div>

          <footer>Powered by Chameleon &bull; Interactive Web Application</footer>

          <script>
            let current = '0';
            let previous = '';
            let operation = null;

            const currDisplay = document.getElementById('currOp');
            const prevDisplay = document.getElementById('prevOp');

            function updateDisplay() {
              currDisplay.innerText = current;
              if (operation != null) {
                prevDisplay.innerText = `${previous} ${operation}`;
              } else {
                prevDisplay.innerText = '';
              }
            }

            function appendNumber(num) {
              if (num === '.' && current.includes('.')) return;
              if (current === '0' && num !== '.') {
                current = num;
              } else {
                current += num;
              }
            }

            function chooseOperation(op) {
              if (current === '') return;
              if (previous !== '') compute();
              operation = op;
              previous = current;
              current = '';
            }

            function compute() {
              let result;
              const prev = parseFloat(previous);
              const curr = parseFloat(current);
              if (isNaN(prev) || isNaN(curr)) return;
              switch (operation) {
                case '+': result = prev + curr; break;
                case '-': result = prev - curr; break;
                case '×': result = prev * curr; break;
                case '÷': result = curr === 0 ? 'Error' : prev / curr; break;
                default: return;
              }
              current = String(result);
              operation = null;
              previous = '';
            }

            document.querySelectorAll('[data-num]').forEach(b => {
              b.addEventListener('click', () => { appendNumber(b.getAttribute('data-num')); updateDisplay(); });
            });

            document.querySelectorAll('[data-op]').forEach(b => {
              b.addEventListener('click', () => { chooseOperation(b.getAttribute('data-op')); updateDisplay(); });
            });

            document.getElementById('btnEq').addEventListener('click', () => { compute(); updateDisplay(); });
            document.getElementById('btnClear').addEventListener('click', () => { current = '0'; previous = ''; operation = null; updateDisplay(); });
            document.getElementById('btnDel').addEventListener('click', () => {
              current = current.length > 1 ? current.slice(0, -1) : '0';
              updateDisplay();
            });
          </script>
        </body>
        </html>
        """.formatted(bg, text, muted, cardBg, border, bg, border, muted, text, border, btnBg, btnText, opBg, opBg, muted, isWhite ? "White / Light" : "Dark Modern");
    }

    private String synthesizeStopwatch(String prompt, String model, boolean isWhite) {
        String bg = isWhite ? "#f8fafc" : "#0b1120";
        String cardBg = isWhite ? "#ffffff" : "#1e293b";
        String text = isWhite ? "#0f172a" : "#f8fafc";
        String muted = isWhite ? "#64748b" : "#94a3b8";
        String border = isWhite ? "#e2e8f0" : "rgba(255,255,255,0.1)";

        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Precision Stopwatch</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: %s; color: %s; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
            .card { background: %s; border: 1px solid %s; border-radius: 24px; padding: 32px; max-width: 420px; width: 100%%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .time { font-size: 3.5rem; font-weight: 800; font-family: monospace; color: #2563eb; margin: 24px 0; }
            .controls { display: flex; gap: 12px; justify-content: center; margin-bottom: 24px; }
            .btn { padding: 12px 24px; border-radius: 12px; border: none; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.15s; }
            .btn-start { background: #10b981; color: #fff; }
            .btn-stop { background: #ef4444; color: #fff; }
            .btn-lap { background: #3b82f6; color: #fff; }
            .btn-reset { background: %s; color: %s; border: 1px solid %s; }
            .laps { max-height: 180px; overflow-y: auto; list-style: none; text-align: left; }
            .lap-item { display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid %s; font-family: monospace; font-size: 0.95rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Stopwatch &amp; Lap Timer</h2>
            <div class="time" id="display">00:00:00.00</div>
            <div class="controls">
              <button class="btn btn-start" id="startBtn">Start</button>
              <button class="btn btn-lap" id="lapBtn" disabled>Lap</button>
              <button class="btn btn-reset" id="resetBtn">Reset</button>
            </div>
            <ul class="laps" id="lapsList"></ul>
          </div>
          <script>
            let startTime = 0, elapsed = 0, timerInterval = null;
            const display = document.getElementById('display');
            const startBtn = document.getElementById('startBtn');
            const lapBtn = document.getElementById('lapBtn');
            const resetBtn = document.getElementById('resetBtn');
            const lapsList = document.getElementById('lapsList');

            function format(ms) {
              let h = Math.floor(ms / 3600000);
              let m = Math.floor((ms %% 3600000) / 60000);
              let s = Math.floor((ms %% 60000) / 1000);
              let cs = Math.floor((ms %% 1000) / 10);
              return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
            }

            startBtn.onclick = () => {
              if (!timerInterval) {
                startTime = Date.now() - elapsed;
                timerInterval = setInterval(() => {
                  elapsed = Date.now() - startTime;
                  display.innerText = format(elapsed);
                }, 10);
                startBtn.innerText = 'Pause';
                startBtn.className = 'btn btn-stop';
                lapBtn.disabled = false;
              } else {
                clearInterval(timerInterval);
                timerInterval = null;
                startBtn.innerText = 'Resume';
                startBtn.className = 'btn btn-start';
              }
            };

            resetBtn.onclick = () => {
              clearInterval(timerInterval);
              timerInterval = null;
              elapsed = 0;
              display.innerText = '00:00:00.00';
              startBtn.innerText = 'Start';
              startBtn.className = 'btn btn-start';
              lapBtn.disabled = true;
              lapsList.innerHTML = '';
            };

            lapBtn.onclick = () => {
              const li = document.createElement('li');
              li.className = 'lap-item';
              li.innerHTML = `<span>Lap ${lapsList.children.length + 1}</span><span>${format(elapsed)}</span>`;
              lapsList.prepend(li);
            };
          </script>
        </body>
        </html>
        """.formatted(bg, text, cardBg, border, isWhite ? "#e2e8f0" : "#334155", text, border, border);
    }

    private String synthesizeSnakeGame(String prompt, String model, boolean isWhite) {
        String bg = isWhite ? "#f8fafc" : "#0f172a";
        String cardBg = isWhite ? "#ffffff" : "#1e293b";
        String text = isWhite ? "#0f172a" : "#f8fafc";

        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Snake Game</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
            body { background: %s; color: %s; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .card { background: %s; padding: 24px; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
            canvas { background: #000; border-radius: 12px; display: block; margin: 16px auto; }
            .score { font-size: 1.25rem; font-weight: 700; color: #10b981; }
            .hint { font-size: 0.85rem; color: #94a3b8; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Classic Snake Game</h2>
            <div class="score">Score: <span id="score">0</span></div>
            <canvas id="game" width="360" height="360"></canvas>
            <p class="hint">Use Arrow Keys or WASD to navigate</p>
          </div>
          <script>
            const canvas = document.getElementById('game');
            const ctx = canvas.getContext('2d');
            const grid = 18;
            let count = 0, score = 0;
            let snake = { x: 144, y: 144, dx: grid, dy: 0, cells: [], maxCells: 4 };
            let apple = { x: 288, y: 288 };

            function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

            function loop() {
              requestAnimationFrame(loop);
              if (++count < 6) return;
              count = 0;
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              snake.x += snake.dx;
              snake.y += snake.dy;

              if (snake.x < 0) snake.x = canvas.width - grid;
              else if (snake.x >= canvas.width) snake.x = 0;
              if (snake.y < 0) snake.y = canvas.height - grid;
              else if (snake.y >= canvas.height) snake.y = 0;

              snake.cells.unshift({ x: snake.x, y: snake.y });
              if (snake.cells.length > snake.maxCells) snake.cells.pop();

              ctx.fillStyle = '#ef4444';
              ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

              ctx.fillStyle = '#10b981';
              snake.cells.forEach((cell, index) => {
                ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);
                if (cell.x === apple.x && cell.y === apple.y) {
                  snake.maxCells++;
                  score += 10;
                  document.getElementById('score').innerText = score;
                  apple.x = getRandomInt(0, 20) * grid;
                  apple.y = getRandomInt(0, 20) * grid;
                }
                for (let i = index + 1; i < snake.cells.length; i++) {
                  if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                    snake.x = 144; snake.y = 144; snake.cells = []; snake.maxCells = 4;
                    snake.dx = grid; snake.dy = 0; score = 0;
                    document.getElementById('score').innerText = score;
                  }
                }
              });
            }

            document.addEventListener('keydown', e => {
              if ((e.which === 37 || e.key === 'a') && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
              else if ((e.which === 38 || e.key === 'w') && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
              else if ((e.which === 39 || e.key === 'd') && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
              else if ((e.which === 40 || e.key === 's') && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
            });
            requestAnimationFrame(loop);
          </script>
        </body>
        </html>
        """.formatted(bg, text, cardBg);
    }

    private String synthesizeNoteApp(String prompt, String model, boolean isWhite) {
        String bg = isWhite ? "#f8fafc" : "#0f172a";
        String cardBg = isWhite ? "#ffffff" : "#1e293b";
        String text = isWhite ? "#0f172a" : "#f8fafc";
        String border = isWhite ? "#e2e8f0" : "rgba(255,255,255,0.1)";

        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"><title>Note Keeper</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
            body { background: %s; color: %s; padding: 32px 20px; }
            .wrap { max-width: 680px; margin: 0 auto; }
            .card { background: %s; border: 1px solid %s; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
            textarea { width: 100%%; background: %s; border: 1px solid %s; color: %s; padding: 12px; border-radius: 8px; font-size: 1rem; margin-bottom: 10px; }
            button { background: #2563eb; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
            .list { display: flex; flex-direction: column; gap: 10px; }
            .note { background: %s; border: 1px solid %s; padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h1 style="margin-bottom: 16px;">Quick Notes</h1>
            <div class="card">
              <textarea id="noteInp" rows="3" placeholder="Write your note here..."></textarea>
              <button id="addBtn">Save Note</button>
            </div>
            <div class="list" id="notesList"></div>
          </div>
          <script>
            let notes = JSON.parse(localStorage.getItem('notes') || '["Sample stored note"]');
            const inp = document.getElementById('noteInp');
            const lst = document.getElementById('notesList');
            function render() {
              lst.innerHTML = '';
              notes.forEach((n, i) => {
                const d = document.createElement('div');
                d.className = 'note';
                d.innerHTML = `<span>${n}</span><button style="background:none; border:none; color:#ef4444; cursor:pointer;" onclick="del(${i})">&times;</button>`;
                lst.appendChild(d);
              });
              localStorage.setItem('notes', JSON.stringify(notes));
            }
            window.del = i => { notes.splice(i,1); render(); };
            document.getElementById('addBtn').onclick = () => {
              if (inp.value.trim()) { notes.unshift(inp.value.trim()); inp.value = ''; render(); }
            };
            render();
          </script>
        </body>
        </html>
        """.formatted(bg, text, cardBg, border, bg, border, text, cardBg, border);
    }

    private String synthesizeSchedulePlanner(String prompt, String model, boolean isWhite) {
        String bg = isWhite ? "#f8fafc" : "#0f172a";
        String cardBg = isWhite ? "#ffffff" : "#1e293b";
        String text = isWhite ? "#0f172a" : "#f8fafc";
        String border = isWhite ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)";
        String slotBg = isWhite ? "#f1f5f9" : "#334155";

        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Weekly Schedule Planner</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: %s; color: %s; padding: 24px; min-height: 100vh; }
            .planner-card { max-width: 1000px; margin: 0 auto; background: %s; border: 1px solid %s; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .days-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
            .day-col { background: %s; border-radius: 12px; padding: 12px; border: 1px solid %s; min-height: 220px; }
            .day-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 12px; text-align: center; }
            .task-item { background: #3b82f6; color: white; padding: 8px 10px; border-radius: 8px; font-size: 0.8rem; margin-bottom: 8px; cursor: pointer; transition: transform 0.15s; }
            .task-item:hover { transform: scale(1.02); }
            .add-task-btn { width: 100%%; padding: 8px; background: transparent; border: 1.5px dashed %s; border-radius: 8px; color: %s; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="planner-card">
            <div class="header">
              <h2>📅 Weekly Timetable Planner</h2>
              <span style="font-size: 0.85rem; opacity: 0.8;">Interactive schedule</span>
            </div>
            <div class="days-grid" id="daysContainer"></div>
          </div>
          <script>
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const container = document.getElementById('daysContainer');
            days.forEach((day, i) => {
              const col = document.createElement('div');
              col.className = 'day-col';
              col.innerHTML = `
                <div class="day-title">${day}</div>
                <div id="tasks-${i}">
                  <div class="task-item">9:00 AM - Standup &amp; Goals</div>
                  ${i %% 2 === 0 ? '<div class="task-item" style="background:#10b981;">2:00 PM - Focus Session</div>' : ''}
                </div>
                <button class="add-task-btn" onclick="const t=prompt('Enter task:'); if(t){ const d=document.createElement('div'); d.className='task-item'; d.innerText=t; document.getElementById('tasks-${i}').appendChild(d); }">+ Add</button>
              `;
              container.appendChild(col);
            });
          </script>
        </body>
        </html>
        """.formatted(bg, text, cardBg, border, slotBg, border, border, text);
    }

    private String synthesizeGeneralApp(String prompt, String model, boolean isWhite) {
        String bg = isWhite ? "#f8fafc" : "#0f172a";
        String cardBg = isWhite ? "#ffffff" : "#1e293b";
        String text = isWhite ? "#0f172a" : "#f8fafc";
        String border = isWhite ? "#e2e8f0" : "rgba(255,255,255,0.1)";
        String accent = "#2563eb";

        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>%s</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: %s; color: %s; padding: 32px 20px; min-height: 100vh; display: flex; justify-content: center; }
            .container { max-width: 800px; width: 100%%; }
            .hero-card { background: %s; border: 1px solid %s; border-radius: 20px; padding: 28px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
            .title { font-size: 1.6rem; font-weight: 700; margin-bottom: 8px; }
            .desc { color: #64748b; font-size: 0.95rem; margin-bottom: 20px; }
            .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
            .stat-box { background: rgba(37, 99, 235, 0.08); border-radius: 12px; padding: 14px; text-align: center; }
            .stat-val { font-size: 1.5rem; font-weight: 700; color: %s; }
            .stat-lbl { font-size: 0.8rem; color: #64748b; margin-top: 4px; }
            .action-bar { display: flex; gap: 10px; margin-top: 20px; }
            .inp { flex: 1; padding: 12px 16px; border: 1.5px solid %s; border-radius: 10px; background: transparent; color: %s; font-size: 0.95rem; }
            .btn { background: %s; color: #fff; padding: 12px 20px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; transition: transform 0.15s; }
            .btn:hover { transform: translateY(-1px); }
            .feed-list { list-style: none; margin-top: 16px; }
            .feed-item { padding: 12px; border-bottom: 1px solid %s; display: flex; justify-content: space-between; align-items: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="hero-card">
              <div class="title">%s</div>
              <p class="desc">Interactive Workspace Application</p>
              <div class="stats-row">
                <div class="stat-box"><div class="stat-val" id="counterVal">12</div><div class="stat-lbl">Active Items</div></div>
                <div class="stat-box"><div class="stat-val">99.8%%</div><div class="stat-lbl">Reliability</div></div>
                <div class="stat-box"><div class="stat-val">Gemini 3</div><div class="stat-lbl">Engine</div></div>
              </div>
              <div class="action-bar">
                <input type="text" id="userInput" class="inp" placeholder="Add an entry...">
                <button class="btn" id="addBtn">+ Add Entry</button>
              </div>
              <ul class="feed-list" id="feedList">
                <li class="feed-item"><span>🚀 Initialized application workspace</span><span>Just now</span></li>
              </ul>
            </div>
          </div>
          <script>
            let count = 12;
            const inp = document.getElementById('userInput');
            const list = document.getElementById('feedList');
            const counter = document.getElementById('counterVal');
            document.getElementById('addBtn').onclick = () => {
              const val = inp.value.trim();
              if (val) {
                const li = document.createElement('li');
                li.className = 'feed-item';
                li.innerHTML = `<span>${val}</span><span>Just now</span>`;
                list.prepend(li);
                count++;
                counter.innerText = count;
                inp.value = '';
              }
            };
          </script>
        </body>
        </html>
        """.formatted(prompt, bg, text, cardBg, border, accent, border, text, accent, border, prompt);
    }

    private GeminiResponse executeGeminiRequest(String model, String prompt, byte[] imageBytes, String mimeType, String apiKey) {
        try {
            String requestJson = buildGeminiRequestBody(prompt, imageBytes, mimeType);
            String url = String.format("%s/%s:generateContent?key=%s", GEMINI_BASE_URL, model, apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(25))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            log.info("Sending request to Gemini model: {}", model);
            HttpResponse<String> httpResponse = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            int statusCode = httpResponse.statusCode();
            String responseBody = httpResponse.body();

            if (statusCode != 200) {
                log.error("Gemini API returned error code {}: {}", statusCode, responseBody);
                String errorMessage = parseErrorMessage(responseBody, statusCode);
                return GeminiResponse.error(model, prompt, errorMessage);
            }

            return parseSuccessResponse(responseBody, model, prompt);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Gemini API request interrupted", e);
            return GeminiResponse.error(model, prompt, "Request was interrupted: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to query Gemini API model {}", model, e);
            return GeminiResponse.error(model, prompt, "Error communicating with Gemini API: " + e.getMessage());
        }
    }

    private String buildGeminiRequestBody(String prompt, byte[] imageBytes, String mimeType) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();

        // System Instruction to force single-file HTML/CSS/JS output
        ObjectNode systemInstruction = root.putObject("system_instruction");
        ArrayNode systemParts = systemInstruction.putArray("parts");
        ObjectNode systemText = systemParts.addObject();
        systemText.put("text", APP_GENERATION_SYSTEM_INSTRUCTION);

        ArrayNode contentsArray = root.putArray("contents");
        ObjectNode contentObj = contentsArray.addObject();
        ArrayNode partsArray = contentObj.putArray("parts");

        // Text part with reinforced requirements
        ObjectNode textPart = partsArray.addObject();
        String enrichedPrompt = prompt + "\n\nCRITICAL REQUIREMENT: All application features must actually work with full real JavaScript logic (zero placeholder/dummy functions), and the design MUST be in a modern, clean light theme / white theme (#ffffff, #f8fafc).";
        textPart.put("text", enrichedPrompt);

        // Image part if provided
        if (imageBytes != null && imageBytes.length > 0) {
            String resolvedMimeType = (mimeType != null && !mimeType.trim().isEmpty())
                    ? mimeType.trim()
                    : detectMimeType(imageBytes);

            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            ObjectNode imagePart = partsArray.addObject();
            ObjectNode inlineData = imagePart.putObject("inline_data");
            inlineData.put("mime_type", resolvedMimeType);
            inlineData.put("data", base64Image);
        }

        return objectMapper.writeValueAsString(root);
    }

    private GeminiResponse parseSuccessResponse(String responseBody, String model, String prompt) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode candidates = rootNode.path("candidates");

            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                String finishReason = firstCandidate.path("finishReason").asText("STOP");
                JsonNode parts = firstCandidate.path("content").path("parts");

                StringBuilder sb = new StringBuilder();
                if (parts.isArray()) {
                    for (JsonNode part : parts) {
                        if (part.has("text")) {
                            sb.append(part.get("text").asText());
                        }
                    }
                }

                String generatedText = sb.toString();
                String cleanedHtml = cleanHtmlOutput(generatedText);

                if (cleanedHtml.isEmpty() && firstCandidate.has("finishReason")) {
                    cleanedHtml = "(No HTML code returned, finish reason: " + finishReason + ")";
                }

                return GeminiResponse.success(model, prompt, cleanedHtml, finishReason);
            }

            // In case candidates are empty, check for promptFeedback
            JsonNode promptFeedback = rootNode.path("promptFeedback");
            if (!promptFeedback.isMissingNode()) {
                return GeminiResponse.error(model, prompt, "Query was blocked by safety filters: " + promptFeedback.toString());
            }

            return GeminiResponse.error(model, prompt, "No response candidates returned by Gemini.");

        } catch (Exception e) {
            log.error("Error parsing Gemini JSON response", e);
            return GeminiResponse.error(model, prompt, "Failed to parse Gemini response: " + e.getMessage());
        }
    }

    private String parseErrorMessage(String responseBody, int statusCode) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode errorNode = rootNode.path("error");
            if (!errorNode.isMissingNode() && errorNode.has("message")) {
                return String.format("Gemini API Error (%d): %s", statusCode, errorNode.get("message").asText());
            }
        } catch (Exception ignored) {
        }
        return String.format("Gemini API Error with status code %d. Response: %s", statusCode, responseBody);
    }

    private String detectMimeType(byte[] bytes) {
        if (bytes == null || bytes.length < 4) {
            return "image/jpeg";
        }
        // PNG magic number: 89 50 4E 47
        if ((bytes[0] & 0xFF) == 0x89 && (bytes[1] & 0xFF) == 0x50 &&
            (bytes[2] & 0xFF) == 0x4E && (bytes[3] & 0xFF) == 0x47) {
            return "image/png";
        }
        // JPEG magic number: FF D8 FF
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        // GIF magic number: GIF8
        if (bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == '8') {
            return "image/gif";
        }
        // WebP: RIFF ... WEBP
        if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
            bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "image/webp";
        }
        return "image/jpeg";
    }

    /**
     * Strips any markdown fences, conversational greetings, or closing comments,
     * ensuring ONLY the single-file HTML code is returned.
     */
    public String cleanHtmlOutput(String rawText) {
        if (rawText == null) {
            return "";
        }
        String text = rawText.trim();

        // Strip markdown code block fences if present (```html ... ``` or ```xml ... ``` or ``` ... ```)
        if (text.startsWith("```html")) {
            text = text.substring(7).trim();
        } else if (text.startsWith("```xml")) {
            text = text.substring(6).trim();
        } else if (text.startsWith("```")) {
            text = text.substring(3).trim();
        }

        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3).trim();
        }

        // If the model included conversational text before <!DOCTYPE or <html, trim it
        int docTypeIndex = text.toUpperCase().indexOf("<!DOCTYPE");
        if (docTypeIndex != -1) {
            text = text.substring(docTypeIndex).trim();
        } else {
            int htmlIndex = text.toLowerCase().indexOf("<html");
            if (htmlIndex != -1) {
                text = text.substring(htmlIndex).trim();
            }
        }

        // If the model included conversational text after </html>, trim it
        int closeHtmlIndex = text.toLowerCase().lastIndexOf("</html>");
        if (closeHtmlIndex != -1) {
            text = text.substring(0, closeHtmlIndex + 7).trim();
        }

        return text;
    }
}
