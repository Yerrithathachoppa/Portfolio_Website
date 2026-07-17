import { SpeechRecognizer } from './speech.js';
import { getContent } from './api.js';

/**
 * Initializes and manages the chatbot widget launcher, drawer, and network streaming logs.
 */
export function initChatbot() {
  const container = document.getElementById('chatbot-widget');
  if (!container) return;

  // Render HTML Structure
  container.innerHTML = `
    <!-- Launcher Button -->
    <button class="chatbot-launcher" aria-label="Ask Yerrithatha's Assistant">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <!-- Antenna -->
        <line x1="12" y1="6" x2="12" y2="3.5" />
        <circle cx="12" cy="2" r="1.5" fill="currentColor" stroke="none" />
        <!-- Ears -->
        <rect x="1.5" y="9.5" width="2.5" height="5" rx="1" fill="currentColor" stroke="none" />
        <rect x="20" y="9.5" width="2.5" height="5" rx="1" fill="currentColor" stroke="none" />
        <!-- Head -->
        <rect x="4" y="6" width="16" height="12" rx="3" />
        <!-- Eyes -->
        <circle cx="9" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
        <!-- Smile -->
        <path d="M9.5 14a2.5 2.5 0 0 0 5 0" />
      </svg>
    </button>

    <!-- Chat Drawer Panel -->
    <div class="chat-panel" aria-hidden="true">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-bot-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="6" x2="12" y2="3.5" />
              <circle cx="12" cy="2" r="1.5" fill="currentColor" stroke="none" />
              <rect x="1.5" y="9.5" width="2.5" height="5" rx="1" fill="currentColor" stroke="none" />
              <rect x="20" y="9.5" width="2.5" height="5" rx="1" fill="currentColor" stroke="none" />
              <rect x="4" y="6" width="16" height="12" rx="3" />
              <circle cx="9" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
              <circle cx="15" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
              <path d="M9.5 14a2.5 2.5 0 0 0 5 0" />
            </svg>
          </div>
          <div>
            <h3 class="chat-bot-title">Yerrithatha's Assistant</h3>
            <span class="chat-bot-status">Online • Ask me anything</span>
          </div>
        </div>
        <button class="chat-close-btn" aria-label="Close Chat">&times;</button>
      </div>

      <!-- Messages Body -->
      <div class="chat-messages">
        <div class="chat-bubble bot">
          Hi! I'm Yerrithatha's AI assistant. Ask me questions about his experience at S&P Global, his python frameworks, or tools he works with.
        </div>
      </div>

      <!-- Suggested Question Chips -->
      <div class="chat-suggested-container">
        <div class="chat-suggested-label">Suggested Questions</div>
        <div class="chat-chips-scroll">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- Input Form -->
      <div class="chat-input-container">
        <form class="chat-form">
          <!-- Microphone Button -->
          <button type="button" id="mic-btn" class="chat-form-btn" aria-label="Speak voice query" style="display: none;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </button>
          <input type="text" class="chat-input" placeholder="Type a message..." aria-label="Chat input message">
          <!-- Send Button -->
          <button type="submit" class="chat-form-btn chat-send-btn" aria-label="Send message">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `;

  // Grab References
  const launcher = container.querySelector('.chatbot-launcher');
  const panel = container.querySelector('.chat-panel');
  const closeBtn = container.querySelector('.chat-close-btn');
  const messageBox = container.querySelector('.chat-messages');
  const inputField = container.querySelector('.chat-input');
  const chatForm = container.querySelector('.chat-form');
  const chipsScroll = container.querySelector('.chat-chips-scroll');
  const micBtn = container.querySelector('#mic-btn');

  let chatHistory = [];
  let isPanelOpen = false;

  // 1. Toggle Panel Visibility
  function togglePanel() {
    isPanelOpen = !isPanelOpen;
    panel.classList.toggle('active', isPanelOpen);
    panel.setAttribute('aria-hidden', !isPanelOpen);
    if (isPanelOpen) {
      inputField.focus();
      loadSuggestedQuestions();
    }
  }

  launcher.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', togglePanel);

  // 2. Load Suggested Question Chips
  async function loadSuggestedQuestions() {
    if (chipsScroll.children.length > 0) return; // Load once

    const defaultSuggestions = [
      'What are your strongest skills?',
      'Are you open to relocation?',
      'Tell me about your S&P Global work',
      'What roles are you looking for?'
    ];

    try {
      const data = await getContent();
      const suggestions = (data.faq && data.faq.length > 0)
        ? data.faq.map(item => item.question).slice(0, 5)
        : defaultSuggestions;

      chipsScroll.innerHTML = suggestions
        .map(q => `<button type="button" class="chat-chip">${q}</button>`)
        .join('');

      // Attach click listeners to chips
      chipsScroll.querySelectorAll('.chat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          submitMessage(chip.textContent);
        });
      });
    } catch (e) {
      console.warn('Could not load dynamic suggestions, using defaults');
      chipsScroll.innerHTML = defaultSuggestions
        .map(q => `<button type="button" class="chat-chip">${q}</button>`)
        .join('');
      chipsScroll.querySelectorAll('.chat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          submitMessage(chip.textContent);
        });
      });
    }
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 3. Format markdown links to clickable anchors
  function formatMarkdownLinks(text) {
    const escaped = escapeHTML(text);
    return escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      const isEmail = url.startsWith('mailto:');
      const safeUrl = url.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      return `<a href="${safeUrl}" target="${isEmail ? '_self' : '_blank'}" rel="noopener noreferrer">${linkText}</a>`;
    });
  }

  // 4. Send Message Function
  async function submitMessage(text) {
    if (!text.trim()) return;

    // Append User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = text;
    messageBox.appendChild(userBubble);
    messageBox.scrollTop = messageBox.scrollHeight;

    // Show Typing Indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-bubble bot typing-indicator-container';
    typingIndicator.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    messageBox.appendChild(typingIndicator);
    messageBox.scrollTop = messageBox.scrollHeight;

    // Save user message to history
    const userMsgObject = { role: 'user', content: text };

    try {
      // POST Request to streaming endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory
        })
      });

      // Remove typing indicator
      messageBox.removeChild(typingIndicator);

      if (!response.ok) {
        throw new Error('Chat API returned error state');
      }

      // Create Bot Bubble for streamed content
      const botBubble = document.createElement('div');
      botBubble.className = 'chat-bubble bot';
      messageBox.appendChild(botBubble);
      messageBox.scrollTop = messageBox.scrollHeight;

      // Read chunked response stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botResponseText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in buffer
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                botResponseText += parsed.token;
                // Parse markdown links incrementally/finally
                botBubble.innerHTML = formatMarkdownLinks(botResponseText);
                messageBox.scrollTop = messageBox.scrollHeight;
              } else if (parsed.error) {
                botBubble.innerHTML = parsed.error;
              }
            } catch (e) {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }

      // Update History logs
      chatHistory.push(userMsgObject);
      chatHistory.push({ role: 'assistant', content: botResponseText });

      // Keep history bounded to avoid prompt bloat (last 10 messages)
      if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(-10);
      }

    } catch (err) {
      console.error('Chat submission failed:', err);
      // Remove typing indicator if still present
      if (messageBox.contains(typingIndicator)) {
        messageBox.removeChild(typingIndicator);
      }
      // Show error fallback bubble
      const errBubble = document.createElement('div');
      errBubble.className = 'chat-bubble bot';
      errBubble.innerHTML = 'Sorry, I am having trouble connecting to my service right now. Please feel free to reach out to me directly at <a href="mailto:ychoppa123@gmail.com">ychoppa123@gmail.com</a>.';
      messageBox.appendChild(errBubble);
      messageBox.scrollTop = messageBox.scrollHeight;
    }
  }

  // Handle Form Submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = inputField.value.trim();
    if (val) {
      inputField.value = '';
      submitMessage(val);
    }
  });

  // 5. Initialize Microphone speech recognition
  const recognizer = new SpeechRecognizer(
    // Transcript result callback
    (transcript) => {
      inputField.value = transcript;
      inputField.focus();
    },
    // Visual mic state change callback
    (isListening) => {
      if (isListening) {
        micBtn.classList.add('active-mic');
      } else {
        micBtn.classList.remove('active-mic');
      }
    }
  );

  // If SpeechRecognition is supported by user browser, reveal the mic button
  if (recognizer.isSupported()) {
    micBtn.style.display = 'flex';
    micBtn.addEventListener('click', () => {
      recognizer.toggle();
    });
  }
}
