(() => {
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('lms_current_user') || '{}');
  }

  function getUserRole(user) {
    return localStorage.getItem('lms_user_role') || user.role || 'user';
  }

  function getChatSessionId() {
    const user = getCurrentUser();
    const stableUserId = user.student_id || user.userId || user.email;
    const role = getUserRole(user);
    return stableUserId ? `user_${role}_${stableUserId}` : `user_${role}_guest`;
  }

  function getChatUserContext() {
    const user = getCurrentUser();
    return {
      role: (user?.role || 'student').toLowerCase().replace(/\s+/g, ''),
      userId: user.student_id || user.userId || user.email || '',
    };
  }

  function refreshChatbotVisibility() {
    const root = document.getElementById('aiChatbotRoot');
    const { userId } = getChatUserContext();
    if (!root) return;

    root.style.display = userId ? '' : 'none';
    if (!userId) root.querySelector('.chat-panel')?.classList.remove('open');
  }

  window.refreshChatbotVisibility = refreshChatbotVisibility;
  refreshChatbotVisibility();

  function scrollChatToLatest() {
    const chatBody = document.querySelector('.chat-body');
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addChatBubble(text, sender = 'ai', muted = false) {
    const chatBody = document.querySelector('.chat-body');
    if (!chatBody) return null;

    const bubble = document.createElement('div');
    bubble.className = `bubble message-${sender}${muted ? ' muted' : ''}`;
    bubble.textContent = text;
    chatBody.appendChild(bubble);
    scrollChatToLatest();
    return bubble;
  }

  async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendChatBtn');
    const chatInput = input?.value.trim();
    if (!chatInput || !input || !sendButton) return;

    addChatBubble(chatInput, 'user');
    input.value = '';
    input.disabled = true;
    sendButton.disabled = true;
    const responseBubble = addChatBubble('Thinking…', 'ai', true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput,
          sessionId: getChatSessionId(),
          role: getChatUserContext().role,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to get an AI response.');

      responseBubble.textContent = data.output || 'The chat service did not return a response.';
      responseBubble.classList.remove('muted');
    } catch (error) {
      responseBubble.textContent = error.message || 'Unable to get an AI response.';
    } finally {
      scrollChatToLatest();
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.querySelector('.chat-toggle');
    const chatPanel = document.querySelector('.chat-panel');
    const chatClose = document.querySelector('.chat-close');

    chatToggle?.addEventListener('click', () => chatPanel?.classList.toggle('open'));
    chatClose?.addEventListener('click', () => chatPanel?.classList.remove('open'));
    document.getElementById('sendChatBtn')?.addEventListener('click', sendChatMessage);
    document.getElementById('chatInput')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') sendChatMessage();
    });
  });
})();
