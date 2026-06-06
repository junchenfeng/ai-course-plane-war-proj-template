// 音频管理模块

let audioCtx = null;
let audioInitialized = false;

// BGM 相关
let bgmElement = null;
let bgmEnabled = true;

export function initAudio() {
  if (audioInitialized) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  audioInitialized = true;
}

// 初始化 BGM
export function initBGM() {
  if (bgmElement) return;
  
  bgmElement = new Audio('/sounds/bgm.mp3');
  bgmElement.loop = true;
  bgmElement.volume = 0.5;
  bgmElement.preload = 'auto';
}

// 播放 BGM
export function playBGM() {
  if (!bgmElement) initBGM();
  if (bgmEnabled && bgmElement.paused) {
    bgmElement.play().catch(() => {
      // 静默处理自动播放限制错误
    });
  }
}

// 暂停 BGM
export function pauseBGM() {
  if (bgmElement && !bgmElement.paused) {
    bgmElement.pause();
  }
}

// 停止 BGM（重置到开头）
export function stopBGM() {
  if (bgmElement) {
    bgmElement.pause();
    bgmElement.currentTime = 0;
  }
}

// 切换 BGM 开关
export function toggleBGM() {
  bgmEnabled = !bgmEnabled;
  if (bgmEnabled) {
    playBGM();
  } else {
    pauseBGM();
  }
  return bgmEnabled;
}

// 获取 BGM 状态
export function isBGMEnabled() {
  return bgmEnabled;
}

// 设置 BGM 音量
export function setBGMVolume(volume) {
  if (bgmElement) {
    bgmElement.volume = Math.max(0, Math.min(1, volume));
  }
}

export function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playHitSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // 静默处理音频错误
  }
}

export function playPowerUpSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // 静默处理音频错误
  }
}

// 玩家受伤音效（被敌人子弹击中 / 被敌人撞击）
export function playDamageSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // 静默处理音频错误
  }
}


