function createCustomButton() {
  const style = document.createElement('style');
  style.textContent = `
  .settings-panel {
    min-width: 200px;
    z-index: 9999;
  }
  `;
  document.head.appendChild(style);

  const tweetCache = new Set();
  const MAX_TWEETS = 50;
  const counters = {
    tweets: 0,
    tokens: 0
  };

  const emojiMap = {
    'heart': '❤️',
    'fire': '🔥',
    'rocket': '🚀',
    'money': '💰',
    'chart': '📈',
    'star': '⭐',
    'gem': '💎',
    'moon': '🌙',
    'sun': '☀️',
    'check': '✅',
    'x': '❌',
    'warning': '⚠️',
    'info': 'ℹ️',
    'lock': '🔒',
    'unlock': '🔓',
    'time': '⏰',
    'eyes': '👀',
    'bomb': '💣',
    'bell': '🔔',
    'target': '🎯'
  };

  const parseFormatting = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      .replace(/~~(.*?)~~/g, '<hr class="my-2 border-grey-600">')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:text-green-500" target="_blank">$1</a>')
      .replace(/:([\w+-]+):/g, (match, p1) => emojiMap[p1.toLowerCase()] || '❓')
      .replace(/•/g, '•&nbsp;')
      .replace(/^-/gm, '–');
  };

  const customButton = document.createElement('button');
  customButton.id = 'ct-tracker-button';
  customButton.className = 'bg-transparent hover:bg-grey-600 h-6 px-2 rounded flex items-center gap-x-1 text-inherit';
  customButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
    <span class="">CT Tracker</span>
    <div class="counter-display ml-2 flex gap-2 text-xs">
      <span class="text-green-400">0 tweets</span>
      <span class="text-blue-400">0 tokens</span>
    </div>
  `;
  const modal = document.createElement('div');
  modal.className = 'custom-modal hidden';
  
  let isLocked = true;
  const defaultPosition = { left: '60px', bottom: '35px' };

  modal.innerHTML = `
    <div role="dialog" aria-modal="true" class="ant-modal border border-grey-500 rounded overflow-hidden" 
         style="position: fixed; bottom: 35px; left: 60px; margin: 0px; padding: 0px; top: unset; width: 650px; height: 490px; transform-origin: 117px 511px;">
      <div class="ant-modal-content overflow-hidden" style="width: 650px; height: 490px;">
        <button type="button" aria-label="Close" class="ant-modal-close w-8 h-8 flex items-center justify-center">
          <span class="ant-modal-close-x">
            <svg viewBox="64 64 896 896" width="14" height="14" fill="currentColor">
              <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
            </svg>
          </span>
        </button>
        <div class="ant-modal-body no-scrollbar wallet-manager !bg-grey-900">
          <div class="flex flex-col items-center w-full h-[478px] rounded-lg overflow-hidden">
            <div class="flex h-[50px] bg-grey-900 p-3 w-full justify-between pr-12 border-b border-grey-500">
              <button class="bg-transparent hover:bg-grey-600 h-6 pr-2 rounded flex items-center gap-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span class="text-sm font-medium text-green-600">CT Tracker</span>
              </button>
              <div class="flex items-center gap-2">
                <button class="lock-button" title="Lock to bottom">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                    <!-- Locked icon -->
                    <path class="lock-closed" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4"/>
                    <!-- Unlocked icon (hidden by default) -->
                    <path class="lock-open hidden" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2"/>
                  </svg>
                </button>
                <button class="settings-button" title="Settings">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="settings-panel hidden absolute right-4 top-12 bg-grey-800 p-4 rounded shadow-lg">
              <label class="flex items-center gap-2 text-white">
                <input type="checkbox" class="show-tokens-only">
                <span>Show tweets with tokens only</span>
              </label>
            </div>
            <div class="flex flex-col items-center w-full max-h-[478px] min-h-[40px] overflow-x-hidden overflow-y-auto no-scrollbar">
              <div id="message-container" class="w-full overflow-y-auto flex-1 p-4 space-y-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const insertButton = () => {
    const bottomBar = document.querySelector('div[class*="fixed bottom-0"]');
    const leftSection = bottomBar?.querySelector('.flex.items-center.justify-center.gap-5');
    
    if (leftSection) {
      const notificationsButton = leftSection.querySelector('button:last-child');
      if (notificationsButton && !leftSection.contains(customButton)) {
        notificationsButton.after(customButton);
      }
    }
  };

  let isDragging = false;
  let startX;
  let startY;
  let startLeft;
  let startBottom;

  const dragHeader = modal.querySelector('.ant-modal-body .flex[class*="h-[50px]"]');
  const modalDialog = modal.querySelector('.ant-modal');

  dragHeader.style.cursor = 'move';

  dragHeader.addEventListener('mousedown', (e) => {
    if (!isLocked && (e.target === dragHeader || dragHeader.contains(e.target))) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = modalDialog.getBoundingClientRect();
      startLeft = rect.left;
      startBottom = window.innerHeight - rect.bottom;
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const newLeft = startLeft + deltaX;
      const newBottom = startBottom - deltaY;
      modalDialog.style.left = `${newLeft}px`;
      modalDialog.style.bottom = `${newBottom}px`;
      modalDialog.style.top = 'unset';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  const updateCounters = () => {
    counters.tweets = document.querySelectorAll('#message-container > div').length;
    counters.tokens = document.querySelectorAll('[id^="tokens-"] > a').length;
    
    const counterDisplay = document.querySelector('.counter-display');
    if (counterDisplay) {
      counterDisplay.innerHTML = `
        <span class="text-green-400">${counters.tweets} tweets</span>
        <span class="text-blue-400">${counters.tokens} tokens</span>
      `;
    }
  };

  const saveToStorage = () => {
    const container = document.getElementById('message-container');
    const data = {
      tweets: container.innerHTML,
      counters,
      settings: {
        showOnlyWithTokens: localStorage.getItem('show-tokens-only') === 'true'
      }
    };
    localStorage.setItem('ct-tracker-data', JSON.stringify(data));
    localStorage.setItem('ct-tracker-tweets', JSON.stringify([...tweetCache]));
  };

  const loadFromStorage = () => {
    const savedTweets = localStorage.getItem('ct-tracker-tweets');
    if (savedTweets) {
      const tweets = JSON.parse(savedTweets);
      tweets.forEach(id => tweetCache.add(id));
    }
  
    const data = localStorage.getItem('ct-tracker-data');
    if (data) {
      const parsed = JSON.parse(data);
      const container = document.getElementById('message-container');
      container.innerHTML = parsed.tweets;
      Object.assign(counters, parsed.counters);
      if (parsed.settings?.showOnlyWithTokens) {
        const checkbox = modal.querySelector('.show-tokens-only');
        if (checkbox) checkbox.checked = parsed.settings.showOnlyWithTokens;
        filterTweets();
      }
      updateCounters();
    }
  };

  const filterTweets = () => {
    const showOnlyWithTokens = localStorage.getItem('show-tokens-only') === 'true';
    const tweets = document.querySelectorAll('#message-container > div');
    tweets.forEach(tweet => {
      const hasTokens = tweet.querySelector('[id^="tokens-"]').children.length > 0;
      tweet.style.display = showOnlyWithTokens && !hasTokens ? 'none' : 'block';
    });
  };

  const initControls = () => {
    const lockButton = modal.querySelector('.lock-button');
    const settingsButton = modal.querySelector('.settings-button');
    const settingsPanel = modal.querySelector('.settings-panel');
    const showTokensOnly = modal.querySelector('.show-tokens-only');

    showTokensOnly.checked = localStorage.getItem('show-tokens-only') === 'true';

    lockButton.addEventListener('click', () => {
      isLocked = !isLocked;
      if (isLocked) {
        modalDialog.style.left = defaultPosition.left;
        modalDialog.style.bottom = defaultPosition.bottom;
        lockButton.querySelector('.lock-closed').classList.remove('hidden');
        lockButton.querySelector('.lock-open').classList.add('hidden');
      } else {
        lockButton.querySelector('.lock-closed').classList.add('hidden');
        lockButton.querySelector('.lock-open').classList.remove('hidden');
      }
    });

    settingsButton.addEventListener('click', () => {
      settingsPanel.classList.toggle('hidden');
    });

    showTokensOnly.addEventListener('change', (e) => {
      localStorage.setItem('show-tokens-only', e.target.checked);
      filterTweets();
    });

    document.addEventListener('click', (e) => {
      if (!settingsPanel.contains(e.target) && !settingsButton.contains(e.target)) {
        settingsPanel.classList.add('hidden');
      }
    });
  };

  customButton.addEventListener('click', () => {
    if (modal.classList.contains('hidden')) {
      const modalDialog = modal.querySelector('.ant-modal');
      if (isLocked) {
        modalDialog.style.left = defaultPosition.left;
        modalDialog.style.bottom = defaultPosition.bottom;
      }
      modalDialog.style.top = 'unset';
      modal.classList.remove('hidden');
      requestAnimationFrame(() => {
        modal.classList.add('visible');
      });
    } else {
      modal.classList.remove('visible');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);
    }
  });

  modal.querySelector('.ant-modal-close').addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);
    }
  });

  const socket = io('wss://becomealpha.xyz', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server:', socket.id);
    loadFromStorage();
  });

  socket.on('twitter-user', (data) => {
    const container = document.getElementById('message-container');
    const timestamp = new Date(data.timestamp).toLocaleString();
    const action = data.title.split(' ')[1].replace(':', '');

    const tweetId = data.twitter_link.split('/').pop();
    if (tweetCache.has(tweetId)) {
    return;
    }
    tweetCache.add(tweetId);

    const messageCard = document.createElement('div');
    messageCard.className = 'bg-grey-800 rounded-lg p-4 flex flex-col space-y-2';
    messageCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-green-500 font-medium">@${data.twitter_link.split('/')[3]}</span>
          <a href="${data.twitter_link}" target="_blank" class="text-xs text-grey-400 hover:text-grey-300">${action}</a>
        </div>
        <a href="${data.twitter_link}" target="_blank" class="text-blue-400 hover:text-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      </div>
      <div class="text-sm text-grey-300 line-clamp-2">${parseFormatting(data.description)}</div>
      <div class="text-xs text-grey-400">${timestamp}</div>
      <div id="tokens-${tweetId}" class="mt-2 flex flex-wrap gap-2"></div>
    `;
    
    container.insertBefore(messageCard, container.firstChild);

    const tweets = container.children;
    if (tweets.length > MAX_TWEETS) {
      for (let i = MAX_TWEETS; i < tweets.length; i++) {
        tweets[i].remove();
      }
    }

    updateCounters();
    saveToStorage();
    filterTweets();
  });

  socket.on('token-update', (data) => {
    data.data.forEach(token => {
      if (token.w?.twitter) {
        const tweetId = token.w.twitter.split('/').pop();
        const tokenContainer = document.getElementById(`tokens-${tweetId}`);
        if (tokenContainer) {
          const getHolderBgColor = (holders) => {
            if (holders <= 15) return 'bg-grey-700 hover:bg-grey-600 bg-green-500/10';
            if (holders <= 30) return 'bg-grey-700 hover:bg-grey-600 bg-yellow-500/10';
            if (holders <= 50) return 'bg-grey-700 hover:bg-grey-600 bg-orange-500/10';
            return 'bg-grey-700 hover:bg-grey-600 bg-red-500/10';
          };

          const existingToken = tokenContainer.querySelector(`[data-token="${token.a}"]`);
          const percentageChange = token.ac ? `${token.ac > 0 ? '+' : ''}${token.ac.toFixed(2)}%` : '0%';
          const priceColor = token.ac > 0 ? 'text-green-400' : 'text-red-400';
          const holderBgColor = getHolderBgColor(parseInt(token.f));

          if (existingToken) {
            existingToken.className = `inline-flex items-center rounded px-2 py-1 ${holderBgColor}`;
            existingToken.innerHTML = `
              <span class="text-white text-sm">${token.b}</span>
              <span class="ml-2 text-xs text-white">(${token.f})</span>
              <span class="ml-2 text-xs ${priceColor}">${percentageChange}</span>
            `;
            existingToken.setAttribute('data-holders', token.f);

            if (existingToken !== tokenContainer.firstElementChild) {
              const tokens = [...tokenContainer.children];
              const firstToken = tokens.shift();
              tokens.sort((a, b) => parseInt(b.getAttribute('data-holders')) - parseInt(a.getAttribute('data-holders')));
              tokenContainer.innerHTML = '';
              tokenContainer.appendChild(firstToken);
              tokens.forEach(t => tokenContainer.appendChild(t));
            }
          } else {
            const tokenCard = document.createElement('a');
            tokenCard.href = `https://neo.bullx.io/terminal?chainId=1399811149&address=${token.a}`;
            tokenCard.setAttribute('data-token', token.a);
            tokenCard.setAttribute('data-holders', token.f);
            tokenCard.className = `inline-flex items-center rounded px-2 py-1 ${holderBgColor}`;
            tokenCard.onclick = (e) => {
              e.preventDefault();
              window.location.href = tokenCard.href;
            };
            
            tokenCard.innerHTML = `
              <span class="text-white text-sm">${token.b}</span>
              <span class="ml-2 text-xs text-white">(${token.f})</span>
              <span class="ml-2 text-xs ${priceColor}">${percentageChange}</span>
            `;

            if (tokenContainer.children.length === 0) {
              tokenContainer.appendChild(tokenCard);
            } else {
              const tokens = [...tokenContainer.children];
              const firstToken = tokens.shift();
              tokens.push(tokenCard);
              tokens.sort((a, b) => parseInt(b.getAttribute('data-holders')) - parseInt(a.getAttribute('data-holders')));
              tokenContainer.innerHTML = '';
              tokenContainer.appendChild(firstToken);
              tokens.forEach(t => tokenContainer.appendChild(t));
            }
          }
          updateCounters();
          saveToStorage();
        }
      }
    });
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
  });

  document.body.appendChild(customButton);
  document.body.appendChild(modal);
  initControls();
  loadFromStorage();

  const observer = new MutationObserver(insertButton);

  observer.observe(document.body, {
   childList: true,
   subtree: true
  });

  return customButton;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createCustomButton);
} else {
  createCustomButton();
}