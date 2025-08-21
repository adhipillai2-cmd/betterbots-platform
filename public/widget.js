// public/widget.js
(function() {
  // IMPORTANT: REPLACE THIS WITH YOUR ACTUAL DEPLOYED VERCEL URL
  const serverUrl = 'https://betterbots-platform.vercel.app'; 

  // --- State Management ---
  let messages = []; 

  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute('data-client-id');

  if (!clientId) {
    console.error('BetterBots: Your script tag is missing the "data-client-id" attribute.');
    return;
  }

  // --- UI Creation ---
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slide-up-fade {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    #bb-chat-button { 
      position: fixed; 
      bottom: 20px; 
      right: 20px; 
      width: 60px; 
      height: 60px; 
      background: linear-gradient(45deg, #0e48e7ff, #f97316); /* NEW: Blue & Orange Gradient */
      border-radius: 50%; 
      border: none; 
      font-size: 24px; 
      color: white; 
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
      display: none; 
      position: fixed; 
      bottom: 100px; 
      right: 20px; 
      width: 380px; 
      height: 70vh; 
      max-height: 700px; 
      background: white; 
      border-radius: 1.5rem; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
      flex-direction: column; 
      overflow: hidden; 
      z-index: 9999; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
      animation: slide-up-fade 0.3s ease-out; 
    }
    #bb-chat-header { 
      background: linear-gradient(to right, #1e3a8a, #2563eb); /* NEW: Deep to Medium Blue Gradient */
      color: white; 
      padding: 20px; 
      text-align: center; 
      border-radius: 1.5rem 1.5rem 0 0; 
    }
    #bb-chat-header h3 { 
      font-weight: bold; 
      font-size: 1.25rem; 
      margin: 0; 
    }
    #bb-chat-header p { 
      font-size: 0.875rem; 
      color: #dbeafe; /* Lighter blue for subtext */
      margin: 4px 0 0; 
    }
    #bb-chat-log { 
      flex-grow: 1; 
      padding: 20px; 
      overflow-y: auto; 
      display: flex; 
      flex-direction: column; 
      background-color: #f3f4f6; 
    }
    #bb-chat-input-container { 
      display: flex; 
      padding: 1rem; 
      background: white; 
      border-top: 1px solid #e5e7eb; 
      border-radius: 0 0 1.5rem 1.5rem; 
      gap: 0.75rem; 
    }
    #bb-chat-input { 
      flex-grow: 1; 
      border: 1px solid #d1d5db; 
      border-radius: 0.5rem; 
      padding: 0.75rem; 
      font-size: 1rem; 
      outline: none; 
      transition: border-color 0.2s; 
    }
    #bb-chat-input:focus { 
      border-color: #f97316; /* NEW: Orange focus color */
    }
    #bb-send-button { 
      background: #f97316; /* NEW: Vibrant Orange */
      color: white; 
      border: none; 
      padding: 0.75rem; 
      border-radius: 0.5rem; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      transition: background-color 0.2s; 
    }
    #bb-send-button:hover { 
      background: #ea580c; /* NEW: Darker Orange on hover */
    }
    #bb-send-button:disabled { 
      background: #fdba74; /* NEW: Lighter Orange when disabled */
      cursor: not-allowed; 
    }
    .bb-message { 
      margin-bottom: 0.75rem; 
      padding: 0.75rem 1rem; 
      border-radius: 1.25rem; 
      max-width: 85%; 
      line-height: 1.5; 
      word-wrap: break-word; 
    }
    .bb-user { 
      background: #1e3a8a; /* NEW: Deep Indigo */
      color: white; 
      align-self: flex-end; 
      border-bottom-right-radius: 0.25rem; 
    }
    .bb-bot { 
      background: #e5e7eb; 
      color: #1f2937; 
      align-self: flex-start; 
      border-bottom-left-radius: 0.25rem; 
    }
  `;
  document.head.appendChild(style);

  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = `
    <button id="bb-chat-button">💬</button>
    <div id="bb-chat-window">
        <div id="bb-chat-header">
            <h3>BetterBots Assistant</h3>
            <p>Online and ready to help</p>
        </div>
        <div id="bb-chat-log"></div>
        <div id="bb-chat-input-container">
            <input type="text" id="bb-chat-input" placeholder="Type a message...">
            <button id="bb-send-button" aria-label="Send Message">
                <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);
  
  // --- Element References & Event Listeners ---
  const chatButton = document.getElementById('bb-chat-button');
  const chatWindow = document.getElementById('bb-chat-window');
  const chatLog = document.getElementById('bb-chat-log');
  const chatInput = document.getElementById('bb-chat-input');
  const sendButton = document.getElementById('bb-send-button');

  chatButton.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
  });

  // --- Core Logic ---
  function addMessage(sender, text) {
    const message = { sender, text };
    messages.push(message); 

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('bb-message', sender === 'user' ? 'bb-user' : 'bb-bot');
    messageDiv.textContent = text;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  }
  
  async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (!messageText) return;

    addMessage('user', messageText);
    const userInput = chatInput.value; 
    chatInput.value = '';
    sendButton.disabled = true;

    try {
      const response = await fetch(`${serverUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId,
          message: userInput,
          history: messages.slice(0, -1) 
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
  
  addMessage('bot', 'Welcome! How can I be of assistance today?');
})();