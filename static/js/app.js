/* === Chat UI Toggle Logic === */
const chatPanel = document.getElementById("chatPanel");
const launcher = document.getElementById("launcher");
const openChatButton = document.getElementById("openChatButton");
const openChatButton2 = document.getElementById("openChatButton2");
const closeChatButton = document.getElementById("closeChatButton");

function openChat() {
  chatPanel.classList.add("open");
  chatPanel.setAttribute("aria-hidden", "false");
  const input = document.getElementById("chatInput");
  if (input) input.focus();
}

function closeChat() {
  chatPanel.classList.remove("open");
  chatPanel.setAttribute("aria-hidden", "true");
}

function toggleChat() {
  if (chatPanel.classList.contains("open")) {
    closeChat();
  } else {
    openChat();
  }
}

if (launcher) launcher.addEventListener("click", toggleChat);
if (openChatButton) openChatButton.addEventListener("click", openChat);
if (openChatButton2) openChatButton2.addEventListener("click", openChat);
if (closeChatButton) closeChatButton.addEventListener("click", closeChat);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeChat();
  }
});


/* === Chat API Logic === */
// For local development, this assumes the backend runs on port 3000 (e.g. `vercel dev`).
// In production, when hosted on GitHub Pages, this should point to your Vercel deployment URL.
const DEV_API_URL = "https://beanbot-sage.vercel.app/api/chat";

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatHistory = document.getElementById("chatHistory");
const typingIndicator = document.getElementById("typingIndicator");

let conversationHistory = []; // Maintains conversation context for the LLM

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", role);

  if (role === "assistant") {
    const label = document.createElement("div");
    label.classList.add("message-label");
    label.innerHTML = '<span class="emoji">💬</span> Chatbot';
    wrapper.appendChild(label);
  }

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  bubble.innerHTML = text.replace(/\n/g, "<br>");
  wrapper.appendChild(bubble);
  
  // Insert immediately before the typing indicator
  chatHistory.insertBefore(wrapper, typingIndicator);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Remove text from input, display user bubble
    appendMessage("user", message);
    chatInput.value = "";
    
    // Show typing status
    typingIndicator.style.display = "block";
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      // Use absolute URL or relative depending on deployment
      // NOTE: Replace the production URL with your actual Vercel project domain!
      const targetUrl = window.location.hostname.includes("github.io") 
        ? "https://beanbot-sage.vercel.app/api/chat" // <-- ACTION REQUIRED: Replace this!
        : DEV_API_URL;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: conversationHistory }),
      });

      const data = await response.json();
      typingIndicator.style.display = "none";

      if (!response.ok) {
        appendMessage("assistant", "oh no fren! i got confuzed. (Error: " + (data.error || "Server error") + ")");
        return;
      }

      appendMessage("assistant", data.text);
      
      // Save to context
      conversationHistory.push({ role: "user", content: message });
      conversationHistory.push({ role: "assistant", content: data.text });
      
    } catch (err) {
      typingIndicator.style.display = "none";
      console.error(err);
      appendMessage("assistant", "vry sorry fren, my internet tube is broken! (Network error)");
    }
  });
}