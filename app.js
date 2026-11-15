(() => {
  const WS_URL = "wss://backend.incariclient.org/v1/ws";
  const PROTOCOL_VERSION = 1;
  const CLIENT_BUILD = "incari/0.1.6";
  const STORAGE_KEY = "incari_chat_session_v1";

  const ERROR_MESSAGES = {
    unauthorized: "Wrong username or password.",
    no_session: "Your session expired. Please sign in again.",
    taken: "That username is taken.",
    bad_request: "The service turned that request down.",
    weak_password: "Password must be 10-128 characters and not common.",
    closed: "They aren't taking messages from you right now.",
    rate_limited: "Too many tries. Please wait a moment.",
    update: "Incari updated its protocol. Please update this web client.",
    unavailable: "Incari online service is temporarily unavailable.",
    offline: "Not connected to Incari's servers."
  };

  const state = {
    ws: null,
    greeted: false,
    signedIn: false,
    nextId: 1,
    pending: new Map(),
    reconnectTimer: null,
    reconnectDelay: 1500,
    session: loadSession(),
    friends: new Map(),       // fid -> { fid, username, online, server }
    requests: new Map(),      // rid -> { rid, incoming, label }
    conversations: new Map(), // fid -> { messages: [], unread: 0, more: true, loaded: false }
    selectedFid: null,
    filterText: "",
    localMsgCounter: 0
  };

  // DOM Elements
  const loginView = document.getElementById("login-view");
  const chatView = document.getElementById("chat-view");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");
  const loginBtn = document.getElementById("login-btn");
  const connDot = document.getElementById("conn-dot");
  const connText = document.getElementById("conn-text");

  const myAvatar = document.getElementById("my-avatar");
  const myUsername = document.getElementById("my-username");
  const chatConnDot = document.getElementById("chat-conn-dot");
  const chatConnText = document.getElementById("chat-conn-text");
  const notifToggleBtn = document.getElementById("notif-toggle-btn");
  const signoutBtn = document.getElementById("signout-btn");

  const addFriendForm = document.getElementById("add-friend-form");
  const addFriendInput = document.getElementById("add-friend-input");
  const friendFeedback = document.getElementById("friend-feedback");
  const searchFriendsInput = document.getElementById("search-friends");

  const requestsSection = document.getElementById("requests-section");
  const requestsCount = document.getElementById("requests-count");
  const requestsList = document.getElementById("requests-list");
  const friendsCount = document.getElementById("friends-count");
  const friendsList = document.getElementById("friends-list");
  const emptyFriends = document.getElementById("empty-friends");

  const emptyChat = document.getElementById("empty-chat");
  const activeChat = document.getElementById("active-chat");
  const mobileBackBtn = document.getElementById("mobile-back-btn");
  const peerAvatar = document.getElementById("peer-avatar");
  const peerName = document.getElementById("peer-name");
  const peerStatus = document.getElementById("peer-status");
  const unfriendBtn = document.getElementById("unfriend-btn");

  const messagesContainer = document.getElementById("messages-container");
  const loadOlderBtn = document.getElementById("load-older-btn");
  const messagesList = document.getElementById("messages-list");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const toastContainer = document.getElementById("toast-container");

  // Session Storage
  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveSession(username, token) {
    state.session = { username, token };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session));
    } catch {}
  }

  function clearSession() {
    state.session = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  // Connection Status UI
  function setConnStatus(mode, text) {
    connDot.className = "dot " + mode;
    connText.textContent = text;
    chatConnDot.className = "dot " + mode;
    chatConnText.textContent = text;
  }

  // WebSocket Transport
  function connect() {
    if (state.ws && (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    clearTimeout(state.reconnectTimer);
    setConnStatus("connecting", "Connecting to Incari...");

    const ws = new WebSocket(WS_URL);
    state.ws = ws;
    state.greeted = false;
    state.nextId = 1;

    ws.onopen = () => {
      if (state.ws !== ws) return;
      sendRequest("hello", { v: PROTOCOL_VERSION, client: CLIENT_BUILD })
        .then(() => {
          state.greeted = true;
          state.reconnectDelay = 1500;
          setConnStatus("online", "Connected to Incari");
          if (state.session && state.session.token) {
            resumeSession(state.session.token, state.session.username);
          }
        })
        .catch((err) => {
          setConnStatus("offline", err.message || "Handshake failed");
          ws.close();
        });
    };

    ws.onmessage = (event) => {
      if (state.ws !== ws) return;
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (typeof msg.id === "number") {
        const entry = state.pending.get(msg.id);
        if (entry) {
          state.pending.delete(msg.id);
          clearTimeout(entry.timer);
          if (msg.t === "ok") {
            entry.resolve(msg);
          } else {
            const code = msg.code || "unavailable";
            if (code === "no_session") {
              handleSignedOut();
            }
            entry.reject(new Error(ERROR_MESSAGES[code] || `Error: ${code}`));
          }
        }
        return;
      }

      handleEvent(msg);
    };

    ws.onclose = () => {
      if (state.ws !== ws) return;
      state.ws = null;
      state.greeted = false;
      failAllPending("Connection lost.");
      setConnStatus("offline", "Disconnected. Reconnecting...");
      state.reconnectTimer = setTimeout(() => {
        state.reconnectDelay = Math.min(state.reconnectDelay * 1.6, 15000);
        connect();
      }, state.reconnectDelay);
    };

    ws.onerror = () => {
      // onclose handles cleanup and retry
    };
  }

  function failAllPending(reason) {
    for (const [, entry] of state.pending.entries()) {
      clearTimeout(entry.timer);
      entry.reject(new Error(reason));
    }
    state.pending.clear();
  }

  function sendRequest(type, payload = {}) {
    return new Promise((resolve, reject) => {
      if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
        reject(new Error(ERROR_MESSAGES.offline));
        return;
      }
      if (type !== "hello" && !state.greeted) {
        reject(new Error("Still handshaking with Incari..."));
        return;
      }
      const id = state.nextId++;
      const frame = JSON.stringify({ t: type, id, ...payload });
      const timer = setTimeout(() => {
        state.pending.delete(id);
        reject(new Error("Request timed out."));
      }, 20000);

      state.pending.set(id, { resolve, reject, timer });
      state.ws.send(frame);
    });
  }

  // Auth Flow
  async function resumeSession(token, fallbackUsername) {
    try {
      const res = await sendRequest("resume", { token });
      const uname = (res.account && res.account.username) || fallbackUsername;
      onSignedIn(uname, token);
    } catch {
      clearSession();
      handleSignedOut();
    }
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) return;

    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in...";

    try {
      const res = await sendRequest("signin", { username, password });
      passwordInput.value = "";
      const canonicalName = (res.account && res.account.username) || username;
      if (res.token) {
        saveSession(canonicalName, res.token);
      }
      onSignedIn(canonicalName, res.token);
    } catch (err) {
      loginError.textContent = err.message || "Failed to sign in.";
      loginError.classList.remove("hidden");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";
    }
  });

  function onSignedIn(username) {
    state.signedIn = true;
    myUsername.textContent = username;
    myAvatar.textContent = username.slice(0, 1).toUpperCase();
    loginView.classList.remove("active");
    chatView.classList.add("active");
    setConnStatus("online", "Online");
    loadFriends();
  }

  function handleSignedOut() {
    state.signedIn = false;
    state.friends.clear();
    state.requests.clear();
    state.conversations.clear();
    state.selectedFid = null;
    clearSession();
    updateTabBadge();
    chatView.classList.remove("active");
    loginView.classList.add("active");
    renderSidebar();
    renderChatArea();
  }

  signoutBtn.addEventListener("click", async () => {
    try {
      await sendRequest("signout", { everywhere: false });
    } catch {}
    handleSignedOut();
  });

  // Friends & Requests
  async function loadFriends() {
    try {
      const res = await sendRequest("friends");
      state.friends.clear();
      state.requests.clear();

      if (Array.isArray(res.friends)) {
        for (const f of res.friends) {
          state.friends.set(f.fid, {
            fid: f.fid,
            username: f.username,
            online: Boolean(f.online),
            server: f.server || null
          });
          const conv = getConversation(f.fid);
          conv.unread = typeof f.unread === "number" ? f.unread : 0;
        }
      }

      if (Array.isArray(res.requests)) {
        for (const r of res.requests) {
          state.requests.set(r.rid, r);
        }
      }

      renderSidebar();
      updateTabBadge();

      if (state.selectedFid && state.friends.has(state.selectedFid)) {
        selectFriend(state.selectedFid);
      } else if (state.selectedFid) {
        state.selectedFid = null;
        renderChatArea();
      }
    } catch (err) {
      showToast("Error", err.message || "Could not load friends.");
    }
  }

  addFriendForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const target = addFriendInput.value.trim();
    if (!target) return;

    friendFeedback.classList.add("hidden");
    try {
      const res = await sendRequest("befriend", { username: target });
      addFriendInput.value = "";
      if (res.friend) {
        state.friends.set(res.friend.fid, res.friend);
        showFeedback(`You and ${res.friend.username} are now friends!`, false);
      } else if (res.request) {
        state.requests.set(res.request.rid, res.request);
        showFeedback(`Friend request sent to ${target}.`, false);
      }
      renderSidebar();
    } catch (err) {
      showFeedback(err.message || "Could not send request.", true);
    }
  });

  function showFeedback(text, isError) {
    friendFeedback.textContent = text;
    friendFeedback.className = isError ? "feedback-text err" : "feedback-text";
    friendFeedback.classList.remove("hidden");
    setTimeout(() => friendFeedback.classList.add("hidden"), 4000);
  }

  async function respondToRequest(rid, action) {
    try {
      const res = await sendRequest(action, { rid });
      state.requests.delete(rid);
      if (action === "accept" && res.friend) {
        state.friends.set(res.friend.fid, res.friend);
      }
      renderSidebar();
      updateTabBadge();
    } catch (err) {
      showToast("Request Error", err.message);
    }
  }

  unfriendBtn.addEventListener("click", async () => {
    if (!state.selectedFid) return;
    const friend = state.friends.get(state.selectedFid);
    if (!friend) return;
    if (!confirm(`Remove ${friend.username} from your friends?`)) return;

    try {
      await sendRequest("unfriend", { fid: friend.fid });
      state.friends.delete(friend.fid);
      state.conversations.delete(friend.fid);
      state.selectedFid = null;
      renderSidebar();
      renderChatArea();
      updateTabBadge();
    } catch (err) {
      showToast("Error", err.message);
    }
  });

  searchFriendsInput.addEventListener("input", (e) => {
    state.filterText = e.target.value.toLowerCase();
    renderSidebar();
  });

  // Conversations & Messaging
  function getConversation(fid) {
    if (!state.conversations.has(fid)) {
      state.conversations.set(fid, {
        messages: [],
        unread: 0,
        more: true,
        loaded: false,
        loading: false
      });
    }
    return state.conversations.get(fid);
  }

  async function selectFriend(fid) {
    state.selectedFid = fid;
    chatView.classList.add("mobile-chat-open");
    renderSidebar();
    renderChatArea();

    const conv = getConversation(fid);
    if (!conv.loaded && !conv.loading) {
      await fetchHistory(fid, false);
    }
    if (conv.unread > 0) {
      markConversationRead(fid);
    }
  }

  mobileBackBtn.addEventListener("click", () => {
    chatView.classList.remove("mobile-chat-open");
    state.selectedFid = null;
    renderSidebar();
  });

  async function fetchHistory(fid, older) {
    const conv = getConversation(fid);
    if (conv.loading) return;
    conv.loading = true;
    loadOlderBtn.disabled = true;

    try {
      const payload = { fid };
      if (older && conv.messages.length > 0) {
        const oldestSent = conv.messages.find((m) => m.delivery === "sent");
        if (oldestSent) {
          payload.before = oldestSent.mid;
        }
      }
      const res = await sendRequest("history", payload);
      const incoming = Array.isArray(res.messages) ? res.messages : [];
      incoming.sort((a, b) => a.at - b.at);

      const existingIds = new Set(conv.messages.map((m) => m.mid));
      const formatted = incoming
        .filter((m) => !existingIds.has(m.mid))
        .map((m) => ({
          mid: m.mid,
          mine: m.from === "me",
          text: m.text,
          at: m.at,
          delivery: "sent"
        }));

      if (older) {
        conv.messages = [...formatted, ...conv.messages];
      } else {
        conv.messages = [...conv.messages, ...formatted];
        conv.messages.sort((a, b) => a.at - b.at);
      }

      conv.more = Boolean(res.more);
      conv.loaded = true;
      if (state.selectedFid === fid) {
        renderMessages(fid, !older);
      }
    } catch (err) {
      showToast("History Error", err.message);
    } finally {
      conv.loading = false;
      loadOlderBtn.disabled = false;
    }
  }

  loadOlderBtn.addEventListener("click", () => {
    if (state.selectedFid) {
      fetchHistory(state.selectedFid, true);
    }
  });

  function markConversationRead(fid) {
    const conv = getConversation(fid);
    conv.unread = 0;
    renderSidebar();
    updateTabBadge();

    let newestTheirs = null;
    for (let i = conv.messages.length - 1; i >= 0; i--) {
      if (!conv.messages[i].mine) {
        newestTheirs = conv.messages[i].mid;
        break;
      }
    }
    const payload = { fid };
    if (newestTheirs) payload.mid = newestTheirs;
    sendRequest("read", payload).catch(() => {});
  }

  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fid = state.selectedFid;
    const text = messageInput.value.trim();
    if (!fid || !text) return;

    messageInput.value = "";
    const conv = getConversation(fid);
    const localId = "local-" + ++state.localMsgCounter;
    const msgObj = {
      mid: localId,
      mine: true,
      text,
      at: Date.now(),
      delivery: "sending"
    };
    conv.messages.push(msgObj);
    renderMessages(fid, true);

    try {
      const res = await sendRequest("send", { fid, text });
      msgObj.mid = res.mid || localId;
      msgObj.at = res.at || msgObj.at;
      msgObj.delivery = "sent";
    } catch (err) {
      msgObj.delivery = "failed";
      showToast("Message Not Sent", err.message);
    }
    if (state.selectedFid === fid) {
      renderMessages(fid, true);
    }
  });

  // Live Events from Incari Server
  function handleEvent(msg) {
    switch (msg.t) {
      case "friend": {
        if (msg.friend) {
          const isNew = !state.friends.has(msg.friend.fid);
          state.friends.set(msg.friend.fid, {
            fid: msg.friend.fid,
            username: msg.friend.username,
            online: Boolean(msg.friend.online),
            server: msg.friend.server || null
          });
          if (isNew) {
            triggerAlert("New Friend", `${msg.friend.username} is now your friend!`);
          }
          renderSidebar();
          if (state.selectedFid === msg.friend.fid) {
            renderChatHeader(msg.friend);
          }
        }
        break;
      }
      case "unfriended": {
        if (msg.fid) {
          state.friends.delete(msg.fid);
          state.conversations.delete(msg.fid);
          if (state.selectedFid === msg.fid) {
            state.selectedFid = null;
            renderChatArea();
          }
          renderSidebar();
          updateTabBadge();
        }
        break;
      }
      case "request": {
        if (msg.rid) {
          state.requests.set(msg.rid, {
            rid: msg.rid,
            incoming: Boolean(msg.incoming),
            label: msg.label || "Player"
          });
          if (msg.incoming) {
            triggerAlert("Friend Request", `${msg.label} sent you a friend request.`);
          }
          renderSidebar();
          updateTabBadge();
        }
        break;
      }
      case "requestgone": {
        if (msg.rid) {
          state.requests.delete(msg.rid);
          renderSidebar();
          updateTabBadge();
        }
        break;
      }
      case "message": {
        if (!msg.fid) break;
        const conv = getConversation(msg.fid);
        if (!conv.messages.some((m) => m.mid === msg.mid)) {
          conv.messages.push({
            mid: msg.mid,
            mine: false,
            text: msg.text,
            at: msg.at || Date.now(),
            delivery: "sent"
          });
        }
        const friend = state.friends.get(msg.fid);
        const senderName = friend ? friend.username : "Friend";
        const isViewing = state.selectedFid === msg.fid && document.visibilityState === "visible";

        if (isViewing) {
          renderMessages(msg.fid, true);
          markConversationRead(msg.fid);
        } else {
          conv.unread += 1;
          renderSidebar();
          updateTabBadge();
          triggerAlert(senderName, msg.text, msg.fid);
        }
        break;
      }
      case "signedout": {
        handleSignedOut();
        showToast("Signed Out", "Your account signed out elsewhere.");
        break;
      }
    }
  }

  // Rendering
  function renderSidebar() {
    // Requests
    const reqs = Array.from(state.requests.values()).sort((a, b) => (b.incoming ? 1 : 0) - (a.incoming ? 1 : 0));
    requestsCount.textContent = reqs.length;
    requestsList.innerHTML = "";
    if (reqs.length > 0) {
      requestsSection.classList.remove("hidden");
      for (const r of reqs) {
        const div = document.createElement("div");
        div.className = "request-item";
        div.innerHTML = `
          <div class="friend-details">
            <div class="friend-name">${escapeHtml(r.label)}</div>
            <div class="friend-sub">${r.incoming ? "Incoming request" : "Sent request"}</div>
          </div>
          <div class="req-actions">
            ${r.incoming ? `<button class="req-btn accept" data-act="accept">✓</button>` : ""}
            <button class="req-btn decline" data-act="decline">✕</button>
          </div>
        `;
        div.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            respondToRequest(r.rid, btn.dataset.act);
          });
        });
        requestsList.appendChild(div);
      }
    } else {
      requestsSection.classList.add("hidden");
    }

    // Friends
    const allFriends = Array.from(state.friends.values())
      .filter((f) => f.username.toLowerCase().includes(state.filterText))
      .sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1;
        return a.username.localeCompare(b.username, undefined, { sensitivity: "base" });
      });

    friendsCount.textContent = allFriends.length;
    friendsList.innerHTML = "";
    emptyFriends.classList.toggle("hidden", allFriends.length > 0);

    for (const f of allFriends) {
      const conv = getConversation(f.fid);
      const item = document.createElement("div");
      item.className = "friend-item" + (state.selectedFid === f.fid ? " selected" : "");
      const subText = f.online ? (f.server ? `Playing on ${f.server}` : "Online") : "Offline";

      item.innerHTML = `
        <div class="friend-left">
          <div class="avatar-wrap">
            <div class="avatar">${escapeHtml(f.username.slice(0, 1))}</div>
            <span class="presence-dot ${f.online ? "online" : "offline"}"></span>
          </div>
          <div class="friend-details">
            <div class="friend-name">${escapeHtml(f.username)}</div>
            <div class="friend-sub">${escapeHtml(subText)}</div>
          </div>
        </div>
        ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ""}
      `;
      item.addEventListener("click", () => selectFriend(f.fid));
      friendsList.appendChild(item);
    }
  }

  function renderChatArea() {
    if (!state.selectedFid || !state.friends.has(state.selectedFid)) {
      emptyChat.classList.remove("hidden");
      activeChat.classList.add("hidden");
      return;
    }
    const friend = state.friends.get(state.selectedFid);
    emptyChat.classList.add("hidden");
    activeChat.classList.remove("hidden");
    renderChatHeader(friend);
    renderMessages(friend.fid, true);
  }

  function renderChatHeader(friend) {
    peerAvatar.textContent = friend.username.slice(0, 1).toUpperCase();
    peerName.textContent = friend.username;
    peerStatus.textContent = friend.online
      ? friend.server
        ? `Online • Playing on ${friend.server}`
        : "Online"
      : "Offline";
  }

  function renderMessages(fid, scrollToBottom) {
    const conv = getConversation(fid);
    loadOlderBtn.classList.toggle("hidden", !conv.more || conv.messages.length === 0);
    messagesList.innerHTML = "";

    for (const m of conv.messages) {
      const row = document.createElement("div");
      row.className = `msg-row ${m.mine ? "mine" : "theirs"} ${m.delivery === "failed" ? "failed" : ""}`;
      const time = new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const statusSuffix = m.delivery === "sending" ? " • Sending..." : m.delivery === "failed" ? " • Failed" : "";

      row.innerHTML = `
        <div class="msg-bubble">${escapeHtml(m.text)}</div>
        <div class="msg-meta">${time}${statusSuffix}</div>
      `;
      messagesList.appendChild(row);
    }

    if (scrollToBottom) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Notifications & Audio
  function updateNotifButton() {
    if (!("Notification" in window)) {
      notifToggleBtn.classList.add("hidden");
      return;
    }
    if (Notification.permission === "granted") {
      notifToggleBtn.classList.add("active-notif");
      notifToggleBtn.title = "Desktop Notifications Enabled";
    } else {
      notifToggleBtn.classList.remove("active-notif");
      notifToggleBtn.title = "Click to Enable Desktop Notifications";
    }
  }

  notifToggleBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    updateNotifButton();
    if (perm === "granted") {
      showToast("Notifications Enabled", "You will now receive alerts for new messages.");
    }
  });

  function playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {}
  }

  function triggerAlert(title, body, fid = null) {
    playChime();
    showToast(title, body, fid);
    if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
      const n = new Notification(title, { body });
      n.onclick = () => {
        window.focus();
        if (fid && state.friends.has(fid)) {
          selectFriend(fid);
        }
        n.close();
      };
    }
  }

  function showToast(title, text, fid = null) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<div class="toast-title">${escapeHtml(title)}</div><div>${escapeHtml(text)}</div>`;
    el.addEventListener("click", () => {
      if (fid && state.friends.has(fid)) {
        selectFriend(fid);
      }
      el.remove();
    });
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }

  function updateTabBadge() {
    let total = 0;
    for (const conv of state.conversations.values()) {
      total += conv.unread;
    }
    for (const req of state.requests.values()) {
      if (req.incoming) total += 1;
    }
    document.title = total > 0 ? `(${total}) Incari Chat` : "Incari Chat";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.selectedFid) {
      const conv = getConversation(state.selectedFid);
      if (conv.unread > 0) {
        markConversationRead(state.selectedFid);
      }
    }
  });

  // Boot
  updateNotifButton();
  connect();
})();
