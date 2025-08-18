// public/widget.js
(function() {
  // IMPORTANT: REPLACE THIS WITH YOUR ACTUAL DEPLOYED VERCEL URL
  const serverUrl = 'https://betterbots-platform.vercel.app/'; 

  // Find the script tag and get the client ID
  const scriptTag = document.currentScript;
  const clientId = scriptTag.getAttribute('data-client-id');

  if (!clientId) {
    console.error('BetterBots: Your script tag is missing the "data-client-id" attribute.');
    return;
  }

  // Inject the CSS styles into the page
  const style = document.createElement('style');
  style.innerHTML = `
    #bb-chat-button { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background-color: #4f46e5; color: white; border-radius: 50%; border: none; font-size: 24px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.2); display: flex; justify-content: center; align-items: center; z-index: 9999; }
    #bb-chat-window { position: fixed; bottom: 100px; right: 20px; width: 350px; height: 500px; background: white; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); display: none; flex-direction: column; overflow: hidden; z-index: 9999; }
    #bb-chat-header { padding: 15px; background: #4f46e5; color: white; font-weight: bold; }
    #bb-chat-log { flex-grow: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; }
    #bb-chat-input-container { display: flex; border-top: 1px solid #eee; padding: 10px; }
    #bb-chat-input { flex-grow: 1; border: 1px solid #ccc; border-radius: 5px; padding: 10px; outline: none; }
    #bb-send-button { background: #4f46e5; color: white; border: none; padding: 10px 15px; margin-left: 10px; border-radius: 5px; cursor: pointer; }
    #bb-send-button:disabled { background: #a5b4fc; }
    .bb-message { margin-bottom: 10px; padding: 8px 12px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
    .bb-user { background: #e5e7eb; align-self: flex-end; }
    .bb-bot { background: #4f46e5; color: white; align-self: flex-start; }
  `;
  document.head.appendChild(style);

  // Create the HTML for the widget
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = `
    <button id="bb-chat-button">💬</button>
    <div id="bb-chat-window">
        <div id="bb-chat-header">Echo AI</div>
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
  addMessage('bot', 'Hi! I am Echo AI. How can I assist you today?');
})();