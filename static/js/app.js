const chatPanel = document.getElementById("chatPanel");
const launcher = document.getElementById("launcher");
const openChatButton = document.getElementById("openChatButton");
const openChatButton2 = document.getElementById("openChatButton2");
const closeChatButton = document.getElementById("closeChatButton");

function openChat() {
  chatPanel.classList.add("open");
  chatPanel.setAttribute("aria-hidden", "false");
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

launcher.addEventListener("click", toggleChat);
openChatButton.addEventListener("click", openChat);
openChatButton2.addEventListener("click", openChat);
closeChatButton.addEventListener("click", closeChat);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeChat();
  }
});