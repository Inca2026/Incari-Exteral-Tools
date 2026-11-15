(() => {
  const WS_URL = "wss://backend.incariclient.org/v1/ws";
  const PROTOCOL_VERSION = 1;
  const CLIENT_BUILD = "incari/0.1.6";
  const STORAGE_KEY = "incari_chat_session_v1";
  const PROFILE_KEY = "incari_profile_v5";

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

  const WARDROBE_CATALOG = {
    capes: {
      title: "Capes",
      items: [
        { id: "none", name: "None", colors: null },
        { id: "frost", name: "Frost", colors: ["#56ccf2", "#2f80ed", "#ffffff"] },
        { id: "aurora", name: "Aurora", colors: ["#0f2027", "#38d9a9", "#9b51e0"] },
        { id: "midnight", name: "Midnight", colors: ["#0d1326", "#1d2d50", "#f2c94c"] },
        { id: "ember", name: "Ember", colors: ["#4a0e0e", "#eb5757", "#f2994a"] },
        { id: "sakura", name: "Sakura", colors: ["#ffafcc", "#ffc8dd", "#ffffff"] },
        { id: "tide", name: "Tide", colors: ["#1b4965", "#62b6cb", "#cae9ff"] },
        { id: "mono", name: "Mono", colors: ["#161b22", "#ffffff", "#8b949e"] }
      ]
    },
    hats: {
      title: "Hats",
      items: [
        { id: "none", name: "None", icon: "✕" },
        { id: "crown", name: "Crown", icon: "👑", color: "#f2c94c" },
        { id: "halo", name: "Angel Halo", icon: "😇", color: "#fff3b0" },
        { id: "horns", name: "Demon Horns", icon: "😈", color: "#eb5757" },
        { id: "ears", name: "Cat Ears", icon: "🐱", color: "#ffafcc" },
        { id: "tophat", name: "Top Hat", icon: "🎩", color: "#30363d" },
        { id: "visor", name: "Cyber Visor", icon: "🥽", color: "#38d9a9" }
      ]
    },
    wings: {
      title: "Wings & Back",
      items: [
        { id: "none", name: "None", icon: "✕" },
        { id: "aether", name: "Aether Wings", icon: "🪽", color: "#38d9a9" },
        { id: "dragon", name: "Dragon Wings", icon: "🐉", color: "#9b51e0" },
        { id: "angel", name: "Seraph Wings", icon: "🕊️", color: "#ffffff" },
        { id: "mech", name: "Jetpack", icon: "🚀", color: "#56ccf2" }
      ]
    },
    nametags: {
      title: "Name Tags",
      items: [
        { id: "default", name: "Default", color: "#f0f6fc" },
        { id: "mint", name: "Incari Mint", color: "#38d9a9" },
        { id: "frost", name: "Glacier", color: "#56ccf2" },
        { id: "ember", name: "Ember", color: "#eb5757" },
        { id: "gold", name: "Solar Gold", color: "#f2c94c" },
        { id: "sakura", name: "Sakura", color: "#ffafcc" },
        { id: "void", name: "Void", color: "#bb6bd9" },
        { id: "rainbow", name: "Chroma", color: "linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3)" }
      ]
    },
    trails: {
      title: "Trails",
      items: [
        { id: "none", name: "None", icon: "✕" },
        { id: "sparkle", name: "Mint Sparkles", icon: "✨", color: "#38d9a9" },
        { id: "flame", name: "Blaze Trail", icon: "🔥", color: "#f2994a" },
        { id: "snow", name: "Snowflakes", icon: "❄️", color: "#56ccf2" },
        { id: "hearts", name: "Hearts", icon: "💖", color: "#ff6b81" }
      ]
    },
    emotes: {
      title: "Emotes",
      items: [
        { id: "wave", name: "Wave", icon: "👋" },
        { id: "dance", name: "Hype Dance", icon: "🕺" },
        { id: "gg", name: "GG Salutes", icon: "🫡" },
        { id: "backflip", name: "Backflip", icon: "🤸" },
        { id: "laugh", name: "Laugh", icon: "😂" },
        { id: "clap", name: "Applause", icon: "👏" },
        { id: "sit", name: "Chill Sit", icon: "🧘" },
        { id: "flex", name: "Flex", icon: "💪" }
      ]
    }
  };

  const DEFAULT_FACE = [
    "#2f1e14","#2f1e14","#2f1e14","#2f1e14","#2f1e14","#2f1e14","#2f1e14","#2f1e14",
    "#2f1e14","#2f1e14","#2f1e14","#2f1e14","#2f1e14","#2f1e14","#2f1e14","#2f1e14",
    "#2f1e14","#b58463","#b58463","#b58463","#b58463","#b58463","#b58463","#2f1e14",
    "#b58463","#b58463","#b58463","#b58463","#b58463","#b58463","#b58463","#b58463",
    "#b58463","#ffffff","#38d9a9","#b58463","#b58463","#38d9a9","#ffffff","#b58463",
    "#b58463","#b58463","#b58463","#966446","#966446","#b58463","#b58463","#b58463",
    "#b58463","#b58463","#6b4228","#b58463","#b58463","#6b4228","#b58463","#b58463",
    "#b58463","#b58463","#6b4228","#6b4228","#6b4228","#6b4228","#b58463","#b58463"
  ];

  const PALETTE_SWATCHES = [
    "#38d9a9", "#20a4f3", "#f85149", "#e3b341",
    "#b58463", "#2f1e14", "#ffffff", "#0d1117"
  ];
  const state = {
    ws: null,
    greeted: false,
    signedIn: false,
    nextId: 1,
    pending: new Map(),
    reconnectTimer: null,
    reconnectDelay: 1500,
    session: loadSession(),
    profile: loadProfile(),
    draftProfile: null,
    activeCategory: "capes",
    previewBack: true,
    activeBrush: "#38d9a9",
    isPainting: false,
    friends: new Map(),
    requests: new Map(),
    conversations: new Map(),
    selectedFid: null,
    filterText: "",
    sortBy: "status",
    localMsgCounter: 0
  };

  // DOM References
  const loginView = document.getElementById("login-view");
  const chatView = document.getElementById("chat-view");
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");
  const loginBtn = document.getElementById("login-btn");
  const connDot = document.getElementById("conn-dot");
  const connText = document.getElementById("conn-text");

  const myAvatarCanvas = document.getElementById("my-avatar-canvas");
  const myUsername = document.getElementById("my-username");
  const chatConnDot = document.getElementById("chat-conn-dot");
  const chatConnText = document.getElementById("chat-conn-text");
  const notifToggleBtn = document.getElementById("notif-toggle-btn");
  const signoutBtn = document.getElementById("signout-btn");
  const customizeBtn = document.getElementById("customize-btn");
  const emptyCustomizeBtn = document.getElementById("empty-customize-btn");
  const openProfileBtn = document.getElementById("open-profile-btn");

  const addFriendForm = document.getElementById("add-friend-form");
  const addFriendInput = document.getElementById("add-friend-input");
  const friendFeedback = document.getElementById("friend-feedback");
  const searchFriendsInput = document.getElementById("search-friends");
  const sortFriendsSelect = document.getElementById("sort-friends");

  const requestsSection = document.getElementById("requests-section");
  const requestsCount = document.getElementById("requests-count");
  const requestsList = document.getElementById("requests-list");
  const friendsCount = document.getElementById("friends-count");
  const friendsList = document.getElementById("friends-list");
  const emptyFriends = document.getElementById("empty-friends");

  const emptyChat = document.getElementById("empty-chat");
  const activeChat = document.getElementById("active-chat");
  const mobileBackBtn = document.getElementById("mobile-back-btn");
  const peerAvatarCanvas = document.getElementById("peer-avatar-canvas");
  const peerName = document.getElementById("peer-name");
  const peerStatus = document.getElementById("peer-status");
  const unfriendBtn = document.getElementById("unfriend-btn");

  const messagesContainer = document.getElementById("messages-container");
  const loadOlderBtn = document.getElementById("load-older-btn");
  const messagesList = document.getElementById("messages-list");
  const messageForm = document.getElementById("message-form");
  const messageInput = document.getElementById("message-input");
  const toastContainer = document.getElementById("toast-container");

  // Wardrobe DOM Refs
  const customizerModal = document.getElementById("customizer-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const saveCosmeticsBtn = document.getElementById("save-cosmetics-btn");
  const wardrobeCatTitle = document.getElementById("wardrobe-cat-title");
  const wardrobeItemsGrid = document.getElementById("wardrobe-items-grid");
  const wardrobeSkinPanel = document.getElementById("wardrobe-skin-panel");
  const faceEditorCanvas = document.getElementById("face-editor-canvas");
  const colorSwatches = document.getElementById("color-swatches");
  const customColorPicker = document.getElementById("custom-color-picker");
  const skinFileInput = document.getElementById("skin-file-input");
  const resetSkinBtn = document.getElementById("reset-skin-btn");
  const customDisplayNameInput = document.getElementById("custom-display-name");
  const previewNametag = document.getElementById("preview-nametag");
  const characterPreviewCanvas = document.getElementById("character-preview-canvas");
  const flipPreviewBtn = document.getElementById("flip-preview-btn");
  const showOthersToggle = document.getElementById("show-others-toggle");

  function loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveSession(username, token) {
    state.session = { username, token };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session)); } catch {}
  }

  function clearSession() {
    state.session = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        return {
          displayName: p.displayName || "",
          face: Array.isArray(p.face) && p.face.length === 64 ? p.face : [...DEFAULT_FACE],
          showOthers: p.showOthers !== false,
          equipped: {
            capes: p.equipped?.capes || "tide",
            hats: p.equipped?.hats || "none",
            wings: p.equipped?.wings || "none",
            nametags: p.equipped?.nametags || "mint",
            trails: p.equipped?.trails || "none",
            emotes: p.equipped?.emotes || "wave"
          }
        };
      }
    } catch {}
    return {
      displayName: "",
      face: [...DEFAULT_FACE],
      showOthers: true,
      equipped: {
        capes: "tide",
        hats: "none",
        wings: "none",
        nametags: "mint",
        trails: "none",
        emotes: "wave"
      }
    };
  }

  function saveProfileLocal() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile)); } catch {}
  }
  function generateFriendFace(seedName) {
    let hash = 0;
    for (let i = 0; i < seedName.length; i++) {
      hash = (hash << 5) - hash + seedName.charCodeAt(i);
      hash |= 0;
    }
    const hues = ["#38d9a9", "#20a4f3", "#f85149", "#e3b341", "#a371f7", "#ff7b72"];
    const eyeColor = hues[Math.abs(hash) % hues.length];
    const hairColors = ["#2f1e14", "#161b22", "#5c3a21", "#8c583a", "#3d2817"];
    const hairColor = hairColors[Math.abs(hash >> 3) % hairColors.length];

    return DEFAULT_FACE.map((c) => {
      if (c === "#38d9a9") return eyeColor;
      if (c === "#2f1e14") return hairColor;
      return c;
    });
  }

  function renderFaceToCanvas(canvas, faceArray, showGrid = false) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cell = size / 8;
    const pixels = Array.isArray(faceArray) && faceArray.length === 64 ? faceArray : DEFAULT_FACE;

    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < 64; i++) {
      const x = (i % 8) * cell;
      const y = Math.floor(i / 8) * cell;
      ctx.fillStyle = pixels[i];
      ctx.fillRect(x, y, Math.ceil(cell), Math.ceil(cell));
    }

    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      for (let g = 1; g < 8; g++) {
        ctx.beginPath(); ctx.moveTo(g * cell, 0); ctx.lineTo(g * cell, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, g * cell); ctx.lineTo(size, g * cell); ctx.stroke();
      }
    }
  }

  function setConnStatus(mode, text) {
    if (connDot) connDot.className = "dot " + mode;
    if (connText) connText.textContent = text;
    if (chatConnDot) chatConnDot.className = "dot " + mode;
    if (chatConnText) chatConnText.textContent = text;
  }

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
      try { msg = JSON.parse(event.data); } catch { return; }

      if (typeof msg.id === "number") {
        const entry = state.pending.get(msg.id);
        if (entry) {
          state.pending.delete(msg.id);
          clearTimeout(entry.timer);
          if (msg.t === "ok") {
            entry.resolve(msg);
          } else {
            const code = msg.code || "unavailable";
            if (code === "no_session") handleSignedOut();
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

    ws.onerror = () => {};
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
  async function syncProfileToGame(silent = false) {
    saveProfileLocal();
    refreshMyProfileUI();

    if (!state.ws || state.ws.readyState !== WebSocket.OPEN || !state.signedIn) {
      if (!silent) showToast("Saved Locally", "Will sync to Incari in-game once connected.");
      return;
    }

    try {
      await sendRequest("profile", {
        displayName: state.profile.displayName || state.session?.username,
        face: state.profile.face,
        cosmetics: state.profile.equipped,
        showOthers: state.profile.showOthers
      });
      if (!silent) showToast("Wardrobe Synced", "Your Incari cosmetics and skin are live in-game!");
    } catch {
      if (!silent) showToast("Wardrobe Saved", "Applied to client and queued for game sync.");
    }
  }

  function refreshMyProfileUI() {
    const accountName = state.session?.username || "Player";
    const shownName = state.profile.displayName.trim() || accountName;
    if (myUsername) {
      myUsername.textContent = shownName;
      myUsername.title = shownName !== accountName ? `Account: ${accountName}` : accountName;
    }
    renderFaceToCanvas(myAvatarCanvas, state.profile.face, false);
  }

  async function resumeSession(token, fallbackUsername) {
    try {
      const res = await sendRequest("resume", { token });
      const uname = (res.account && res.account.username) || fallbackUsername;
      if (res.account?.profile) mergeRemoteProfile(res.account.profile);
      onSignedIn(uname);
    } catch {
      clearSession();
      handleSignedOut();
    }
  }

  function mergeRemoteProfile(remote) {
    if (remote.displayName) state.profile.displayName = remote.displayName;
    if (Array.isArray(remote.face) && remote.face.length === 64) state.profile.face = remote.face;
    if (remote.cosmetics) state.profile.equipped = { ...state.profile.equipped, ...remote.cosmetics };
    saveProfileLocal();
  }

  loginForm?.addEventListener("submit", async (e) => {
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
      if (res.token) saveSession(canonicalName, res.token);
      if (res.account?.profile) mergeRemoteProfile(res.account.profile);
      onSignedIn(canonicalName);
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
    if (state.session) state.session.username = username;
    refreshMyProfileUI();
    loginView.classList.remove("active");
    chatView.classList.add("active");
    setConnStatus("online", "Online");
    loadFriends();
    syncProfileToGame(true);
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

  signoutBtn?.addEventListener("click", async () => {
    try { await sendRequest("signout", { everywhere: false }); } catch {}
    handleSignedOut();
  });
  function drawCapeThumbnail(canvas, capeItem) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!capeItem.colors) {
      ctx.strokeStyle = "#8b949e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.35);
      ctx.lineTo(w * 0.7, h * 0.65);
      ctx.moveTo(w * 0.7, h * 0.35);
      ctx.lineTo(w * 0.3, h * 0.65);
      ctx.stroke();
      return;
    }

    const [c1, c2, c3] = capeItem.colors;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.55, c2);
    grad.addColorStop(1, c3);
    ctx.fillStyle = grad;
    ctx.fillRect(6, 2, w - 12, h - 4);

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    for (let y = 6; y < h - 8; y += 8) {
      for (let x = 10; x < w - 12; x += 8) {
        if ((x + y) % 16 === 0) ctx.fillRect(x, y, 5, 5);
      }
    }
  }

  function renderCharacterPreview() {
    const draft = state.draftProfile;
    if (!draft || !characterPreviewCanvas) return;

    const accountName = state.session?.username || "Player";
    const shownName = draft.displayName.trim() || accountName;
    const tagItem = WARDROBE_CATALOG.nametags.items.find((i) => i.id === draft.equipped.nametags);
    if (previewNametag) {
      previewNametag.textContent = shownName;
      previewNametag.style.color = tagItem && !tagItem.color.startsWith("linear") ? tagItem.color : "#38d9a9";
    }

    const ctx = characterPreviewCanvas.getContext("2d");
    const W = characterPreviewCanvas.width;
    const H = characterPreviewCanvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(W / 2, H - 18, 44, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const cx = W / 2;
    const headSize = 48;
    const bodyW = 48;
    const bodyH = 72;
    const armW = 20;
    const legW = 24;
    const legH = 68;
    const topY = 38;

    if (draft.equipped.wings !== "none") {
      const wingObj = WARDROBE_CATALOG.wings.items.find((i) => i.id === draft.equipped.wings);
      ctx.fillStyle = wingObj?.color || "#38d9a9";
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(cx - 20, topY + 56);
      ctx.lineTo(cx - 78, topY + 24);
      ctx.lineTo(cx - 66, topY + 95);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 20, topY + 56);
      ctx.lineTo(cx + 78, topY + 24);
      ctx.lineTo(cx + 66, topY + 95);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#3b359c";
    ctx.fillRect(cx - legW, topY + headSize + bodyH, legW - 1, legH);
    ctx.fillRect(cx + 1, topY + headSize + bodyH, legW - 1, legH);

    ctx.fillStyle = "#00a8a8";
    ctx.fillRect(cx - bodyW / 2 - armW, topY + headSize, armW, bodyH);
    ctx.fillRect(cx + bodyW / 2, topY + headSize, armW, bodyH);
    ctx.fillRect(cx - bodyW / 2, topY + headSize, bodyW, bodyH);

    if (!state.previewBack) {
      const off = document.createElement("canvas");
      off.width = headSize;
      off.height = headSize;
      renderFaceToCanvas(off, draft.face, false);
      ctx.drawImage(off, cx - headSize / 2, topY);
    } else {
      ctx.fillStyle = draft.face || "#2f1e14";
      ctx.fillRect(cx - headSize / 2, topY, headSize, headSize);
    }

    if (draft.equipped.capes !== "none") {
      const capeObj = WARDROBE_CATALOG.capes.items.find((i) => i.id === draft.equipped.capes);
      if (capeObj && capeObj.colors) {
        const grad = ctx.createLinearGradient(cx - 22, topY + headSize, cx + 22, topY + headSize + 108);
        grad.addColorStop(0, capeObj.colors);
        grad.addColorStop(0.5, capeObj.colors);
        grad.addColorStop(1, capeObj.colors);
        ctx.fillStyle = grad;

        if (state.previewBack) {
          ctx.fillRect(cx - 22, topY + headSize + 2, 44, 108);
          ctx.fillStyle = "rgba(255,255,255,0.22)";
          for (let py = topY + headSize + 10; py < topY + headSize + 98; py += 12) {
            ctx.fillRect(cx - 14, py, 8, 8);
            ctx.fillRect(cx + 6, py + 6, 8, 8);
          }
        } else {
          ctx.fillRect(cx - 26, topY + headSize + 6, 4, 96);
          ctx.fillRect(cx + 22, topY + headSize + 6, 4, 96);
        }
      }
    }

    if (draft.equipped.hats !== "none") {
      const hatObj = WARDROBE_CATALOG.hats.items.find((i) => i.id === draft.equipped.hats);
      ctx.font = "26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(hatObj?.icon || "👑", cx, topY - 4);
    }

    if (draft.equipped.trails !== "none") {
      const trailObj = WARDROBE_CATALOG.trails.items.find((i) => i.id === draft.equipped.trails);
      ctx.font = "16px sans-serif";
      ctx.fillText(trailObj?.icon || "✨", cx - 42, H - 24);
      ctx.fillText(trailObj?.icon || "✨", cx + 42, H - 32);
    }
  }
  function renderWardrobeCategory(catKey) {
    state.activeCategory = catKey;
    document.querySelectorAll("#wardrobe-tabs .w-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.cat === catKey);
    });

    if (catKey === "skin") {
      wardrobeCatTitle.textContent = "Skin & Face";
      wardrobeItemsGrid.classList.add("hidden");
      wardrobeSkinPanel.classList.remove("hidden");
      renderFaceToCanvas(faceEditorCanvas, state.draftProfile.face, true);
      return;
    }

    wardrobeSkinPanel.classList.add("hidden");
    wardrobeItemsGrid.classList.remove("hidden");

    const cat = WARDROBE_CATALOG[catKey];
    wardrobeCatTitle.textContent = cat.title;
    wardrobeItemsGrid.innerHTML = "";

    for (const item of cat.items) {
      const isEquipped = state.draftProfile.equipped[catKey] === item.id;
      const card = document.createElement("div");
      card.className = "w-card" + (isEquipped ? " equipped" : "");

      if (catKey === "capes") {
        const c = document.createElement("canvas");
        c.width = 48;
        c.height = 68;
        drawCapeThumbnail(c, item);
        card.appendChild(c);
      } else if (catKey === "nametags") {
        const badge = document.createElement("div");
        badge.style.padding = "14px 6px";
        badge.style.fontWeight = "800";
        badge.style.fontSize = "13px";
        badge.style.color = item.color.startsWith("linear") ? "#38d9a9" : item.color;
        badge.textContent = "Aa";
        card.appendChild(badge);
      } else {
        const iconDiv = document.createElement("div");
        iconDiv.style.fontSize = "32px";
        iconDiv.style.padding = "10px 0";
        iconDiv.textContent = item.icon || "✨";
        card.appendChild(iconDiv);
      }

      const label = document.createElement("div");
      label.className = "w-card-name";
      label.textContent = item.name;
      card.appendChild(label);

      card.addEventListener("click", () => {
        state.draftProfile.equipped[catKey] = item.id;
        renderWardrobeCategory(catKey);
        renderCharacterPreview();
      });

      wardrobeItemsGrid.appendChild(card);
    }
  }

  function openCustomizer() {
    if (!customizerModal) return;
    state.draftProfile = {
      displayName: state.profile.displayName || "",
      face: [...state.profile.face],
      showOthers: state.profile.showOthers,
      equipped: { ...state.profile.equipped }
    };
    if (customDisplayNameInput) customDisplayNameInput.value = state.draftProfile.displayName;
    if (showOthersToggle) showOthersToggle.checked = state.draftProfile.showOthers;
    state.previewBack = true;

    renderWardrobeCategory("capes");
    renderCharacterPreview();
    customizerModal.classList.remove("hidden");
  }

  function closeCustomizer() {
    if (customizerModal) customizerModal.classList.add("hidden");
  }

  customizeBtn?.addEventListener("click", openCustomizer);
  emptyCustomizeBtn?.addEventListener("click", openCustomizer);
  openProfileBtn?.addEventListener("click", openCustomizer);
  closeModalBtn?.addEventListener("click", closeCustomizer);

  document.querySelectorAll("#wardrobe-tabs .w-tab").forEach((btn) => {
    btn.addEventListener("click", () => renderWardrobeCategory(btn.dataset.cat));
  });

  flipPreviewBtn?.addEventListener("click", () => {
    state.previewBack = !state.previewBack;
    renderCharacterPreview();
  });

  customDisplayNameInput?.addEventListener("input", (e) => {
    if (state.draftProfile) {
      state.draftProfile.displayName = e.target.value;
      renderCharacterPreview();
    }
  });

  saveCosmeticsBtn?.addEventListener("click", async () => {
    state.profile = {
      displayName: state.draftProfile.displayName.trim(),
      face: [...state.draftProfile.face],
      showOthers: showOthersToggle ? showOthersToggle.checked : true,
      equipped: { ...state.draftProfile.equipped }
    };
    closeCustomizer();
    await syncProfileToGame(false);
  });

  if (colorSwatches) {
    PALETTE_SWATCHES.forEach((hex, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch-btn" + (idx === 0 ? " active" : "");
      btn.style.background = hex;
      btn.addEventListener("click", () => {
        state.activeBrush = hex;
        if (customColorPicker) customColorPicker.value = hex;
        document.querySelectorAll(".swatch-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
      colorSwatches.appendChild(btn);
    });
  }

  customColorPicker?.addEventListener("input", (e) => {
    state.activeBrush = e.target.value;
    document.querySelectorAll(".swatch-btn").forEach((b) => b.classList.remove("active"));
  });

  function paintPixelAtEvent(e) {
    if (!state.draftProfile || !faceEditorCanvas) return;
    const rect = faceEditorCanvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) * (8 / rect.width));
    const row = Math.floor((e.clientY - rect.top) * (8 / rect.height));
    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
      state.draftProfile.face[row * 8 + col] = state.activeBrush;
      renderFaceToCanvas(faceEditorCanvas, state.draftProfile.face, true);
      renderCharacterPreview();
    }
  }

  faceEditorCanvas?.addEventListener("mousedown", (e) => { state.isPainting = true; paintPixelAtEvent(e); });
  window.addEventListener("mousemove", (e) => { if (state.isPainting) paintPixelAtEvent(e); });
  window.addEventListener("mouseup", () => { state.isPainting = false; });

  resetSkinBtn?.addEventListener("click", () => {
    if (!state.draftProfile) return;
    state.draftProfile.face = [...DEFAULT_FACE];
    renderFaceToCanvas(faceEditorCanvas, state.draftProfile.face, true);
    renderCharacterPreview();
  });

skinFileInput?.addEventListener("change", (e) => {
  const file = e.target.files ? e.target.files.item(0) : null;
  if (!file) return;

    const img = new Image();
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = 64;
      off.height = 64;
      const ctx = off.getContext("2d");
      ctx.drawImage(img, 0, 0, 64, img.height === 32 ? 32 : 64);

      const extracted = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const base = ctx.getImageData(8 + x, 8 + y, 1, 1).data;
          const hat = ctx.getImageData(40 + x, 8 + y, 1, 1).data;
    const px = hat.at(3) > 128 ? hat : base;
const hex = "#" + [px.at(0), px.at(1), px.at(2)].map((v) => v.toString(16).padStart(2, "0")).join("");

          extracted.push(hex);
        }
      }
      state.draftProfile.face = extracted;
      renderFaceToCanvas(faceEditorCanvas, state.draftProfile.face, true);
      renderCharacterPreview();
      skinFileInput.value = "";
    };
    img.src = URL.createObjectURL(file);
  });
  function normalizeFriend(f) {
    const displayName = f.displayName || f.profile?.displayName || f.username;
    const face =
      (Array.isArray(f.face) && f.face.length === 64 && f.face) ||
      (Array.isArray(f.profile?.face) && f.profile.face.length === 64 && f.profile.face) ||
      generateFriendFace(f.username);

    return {
      fid: f.fid,
      username: f.username,
      displayName,
      face,
      cosmetics: f.cosmetics || f.profile?.cosmetics || null,
      online: Boolean(f.online),
      server: f.server || null
    };
  }

  async function loadFriends() {
    try {
      const res = await sendRequest("friends");
      state.friends.clear();
      state.requests.clear();

      if (Array.isArray(res.friends)) {
        for (const f of res.friends) {
          const norm = normalizeFriend(f);
          state.friends.set(norm.fid, norm);
          const conv = getConversation(norm.fid);
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

  addFriendForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const target = addFriendInput.value.trim();
    if (!target) return;

    friendFeedback.classList.add("hidden");
    try {
      const res = await sendRequest("befriend", { username: target });
      addFriendInput.value = "";
      if (res.friend) {
        const norm = normalizeFriend(res.friend);
        state.friends.set(norm.fid, norm);
        showFeedback(`You and ${norm.displayName} are now friends!`, false);
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
    if (!friendFeedback) return;
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
        const norm = normalizeFriend(res.friend);
        state.friends.set(norm.fid, norm);
      }
      renderSidebar();
      updateTabBadge();
    } catch (err) {
      showToast("Request Error", err.message);
    }
  }

  unfriendBtn?.addEventListener("click", async () => {
    if (!state.selectedFid) return;
    const friend = state.friends.get(state.selectedFid);
    if (!friend) return;
    if (!confirm(`Remove ${friend.displayName} from your friends?`)) return;

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

  searchFriendsInput?.addEventListener("input", (e) => {
    state.filterText = e.target.value.toLowerCase();
    renderSidebar();
  });

  sortFriendsSelect?.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderSidebar();
  });

  function getConversation(fid) {
    if (!state.conversations.has(fid)) {
      state.conversations.set(fid, { messages: [], unread: 0, more: true, loaded: false, loading: false });
    }
    return state.conversations.get(fid);
  }

  async function selectFriend(fid) {
    state.selectedFid = fid;
    chatView.classList.add("mobile-chat-open");
    renderSidebar();
    renderChatArea();

    const conv = getConversation(fid);
    if (!conv.loaded && !conv.loading) await fetchHistory(fid, false);
    if (conv.unread > 0) markConversationRead(fid);
  }

  mobileBackBtn?.addEventListener("click", () => {
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
        if (oldestSent) payload.before = oldestSent.mid;
      }
      const res = await sendRequest("history", payload);
      const incoming = Array.isArray(res.messages) ? res.messages : [];
      incoming.sort((a, b) => a.at - b.at);

      const existingIds = new Set(conv.messages.map((m) => m.mid));
      const formatted = incoming
        .filter((m) => !existingIds.has(m.mid))
        .map((m) => ({ mid: m.mid, mine: m.from === "me", text: m.text, at: m.at, delivery: "sent" }));

      if (older) {
        conv.messages = [...formatted, ...conv.messages];
      } else {
        conv.messages = [...conv.messages, ...formatted];
        conv.messages.sort((a, b) => a.at - b.at);
      }

      conv.more = Boolean(res.more);
      conv.loaded = true;
      if (state.selectedFid === fid) renderMessages(fid, !older);
    } catch (err) {
      showToast("History Error", err.message);
    } finally {
      conv.loading = false;
      loadOlderBtn.disabled = false;
    }
  }

  loadOlderBtn?.addEventListener("click", () => {
    if (state.selectedFid) fetchHistory(state.selectedFid, true);
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

  messageForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fid = state.selectedFid;
    const text = messageInput.value.trim();
    if (!fid || !text) return;

    messageInput.value = "";
    const conv = getConversation(fid);
    const localId = "local-" + ++state.localMsgCounter;
    const msgObj = { mid: localId, mine: true, text, at: Date.now(), delivery: "sending" };
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
    if (state.selectedFid === fid) renderMessages(fid, true);
  });
  function handleEvent(msg) {
    switch (msg.t) {
      case "friend": {
        if (msg.friend) {
          const isNew = !state.friends.has(msg.friend.fid);
          const norm = normalizeFriend(msg.friend);
          state.friends.set(norm.fid, norm);
          if (isNew) triggerAlert("New Friend", `${norm.displayName} is now your friend!`);
          renderSidebar();
          if (state.selectedFid === norm.fid) renderChatHeader(norm);
        }
        break;
      }
      case "profile": {
        if (msg.fid && state.friends.has(msg.fid)) {
          const existing = state.friends.get(msg.fid);
          if (msg.displayName) existing.displayName = msg.displayName;
          if (Array.isArray(msg.face) && msg.face.length === 64) existing.face = msg.face;
          if (msg.cosmetics) existing.cosmetics = msg.cosmetics;
          renderSidebar();
          if (state.selectedFid === msg.fid) renderChatHeader(existing);
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
          state.requests.set(msg.rid, { rid: msg.rid, incoming: Boolean(msg.incoming), label: msg.label || "Player" });
          if (msg.incoming) triggerAlert("Friend Request", `${msg.label} sent you a friend request.`);
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
          conv.messages.push({ mid: msg.mid, mine: false, text: msg.text, at: msg.at || Date.now(), delivery: "sent" });
        }
        const friend = state.friends.get(msg.fid);
        const senderName = friend ? friend.displayName : "Friend";
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

  function renderSidebar() {
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

    const allFriends = Array.from(state.friends.values())
      .filter((f) => {
        const q = state.filterText;
        return f.displayName.toLowerCase().includes(q) || f.username.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (state.sortBy === "alpha") {
          return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" });
        }
        if (state.sortBy === "unread") {
          const unreadA = getConversation(a.fid).unread;
          const unreadB = getConversation(b.fid).unread;
          if (unreadA !== unreadB) return unreadB - unreadA;
        }
        if (a.online !== b.online) return a.online ? -1 : 1;
        return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" });
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
            <canvas class="skin-avatar" width="38" height="38"></canvas>
            <span class="presence-dot ${f.online ? "online" : "offline"}"></span>
          </div>
          <div class="friend-details">
            <div class="friend-name">${escapeHtml(f.displayName)}</div>
            <div class="friend-sub">${escapeHtml(subText)}</div>
          </div>
        </div>
        ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ""}
      `;

      renderFaceToCanvas(item.querySelector("canvas"), f.face, false);
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
    renderFaceToCanvas(peerAvatarCanvas, friend.face, false);
    peerName.textContent = friend.displayName;
    peerName.title = friend.displayName !== friend.username ? `@${friend.username}` : friend.username;
    peerStatus.textContent = friend.online
      ? friend.server ? `Online • Playing on ${friend.server}` : "Online"
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

    if (scrollToBottom) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function updateNotifButton() {
    if (!notifToggleBtn) return;
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

  notifToggleBtn?.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      showToast("Not Supported", "Your browser does not support desktop notifications.");
      return;
    }
    const perm = await Notification.requestPermission();
    updateNotifButton();
    if (perm === "granted") {
      showToast("Notifications Enabled", "You will now receive alerts for new messages.");
    } else {
      showToast("Notifications Blocked", "Enable notifications for this site in your browser's address bar lock icon.");
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
        if (fid && state.friends.has(fid)) selectFriend(fid);
        n.close();
      };
    }
  }

  function showToast(title, text, fid = null) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<div class="toast-title">${escapeHtml(title)}</div><div>${escapeHtml(text)}</div>`;
    el.addEventListener("click", () => {
      if (fid && state.friends.has(fid)) selectFriend(fid);
      el.remove();
    });
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }

  function updateTabBadge() {
    let total = 0;
    for (const conv of state.conversations.values()) total += conv.unread;
    for (const req of state.requests.values()) if (req.incoming) total += 1;
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
      if (conv.unread > 0) markConversationRead(state.selectedFid);
    }
  });

  // Boot
  renderFaceToCanvas(myAvatarCanvas, state.profile.face, false);
  updateNotifButton();
  connect();
})();
