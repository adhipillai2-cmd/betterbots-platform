// public/widget.js
(function() {
  // IMPORTANT: REPLACE THIS WITH YOUR ACTUAL DEPLOYED VERCEL URL
  const serverUrl = 'https://betterbots-platform.vercel.app'; 

  // Find the script tag and get the client ID
  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute('data-client-id');

  if (!clientId) {
    console.error('BetterBots: Your script tag is missing the "data-client-id" attribute.');
    return;
  }

  // Inject the CSS styles into the page
  const style = document.createElement('style');
  style.innerHTML = `/* Modern, Sleek, and Colorful Widget Styles */
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

#bb-chat-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: transform 0.2s ease-in-out;
}
#bb-chat-button:hover {
  transform: scale(1.1);
}

#bb-chat-window {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 370px;
  height: 600px;
  background: #f9fafb;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: none;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  animation: slide-up 0.3s ease-out;
}

#bb-chat-header {
  padding: 20px;
  background: linear-gradient(45deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
}

#bb-chat-log {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

#bb-chat-input-container {
  display: flex;
  border-top: 1px solid #e5e7eb;
  padding: 15px;
  background: white;
}

#bb-chat-input {
  flex-grow: 1;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 10px 15px;
  outline: none;
  font-size: 1rem;
  transition: border-color 0.2s;
}
#bb-chat-input:focus {
  border-color: #6366f1;
}

#bb-send-button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-left: 10px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
#bb-send-button:hover {
  background: #4338ca;
}
#bb-send-button:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}

.bb-message {
  margin-bottom: 12px;
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 85%;
  line-height: 1.5;
  word-wrap: break-word;
}

.bb-user {
  background: #e5e7eb;
  color: #1f2937;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.bb-bot {
  background: white;
  color: #1f2937;
  align-self: flex-start;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 5px;
}`;
  document.head.appendChild(style);

  // Create the HTML for the widget
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = `
    <button id="bb-chat-button">💬</button>
    <div id="bb-chat-window">
        <div id="bb-chat-header">AI Assistant</div>
        <div id="bb-chat-log"></div>
        <div id="bb-chat-input-container">
            <input type="text" id="bb-chat-input" placeholder="Type a message...">
            <button id="bb-send-button">Send</button>
        </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);
  
  // Get references to the elements
  const chatButton = document.getElementById('bb-chat-button');
  const chatWindow = document.getElementById('bb-chat-window');
  const chatLog = document.getElementById('bb-chat-log');
  const chatInput = document.getElementById('bb-chat-input');
  const sendButton = document.getElementById('bb-send-button');

  // Toggle chat window visibility
  chatButton.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
  });

  // Function to add a message to the chat log
  function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('bb-message', sender === 'user' ? 'bb-user' : 'bb-bot');
    messageDiv.textContent = text;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Function to send a message
  async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (!messageText) return;

    addMessage('user', messageText);
    chatInput.value = '';
    sendButton.disabled = true;

    try {
      const response = await fetch(`${serverUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId,
          message: messageText
        })
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      addMessage('bot', data.reply);
    } catch (error) {
      addMessage('bot', 'Sorry, an error occurred. Please try again.');
    } finally {
      sendButton.disabled = false;
    }
  }

  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Add initial bot message
  addMessage('bot', 'Hi! I am your AI Assistant. How can I assist you today?');
})();