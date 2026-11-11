// Smart Ragunan Ride: backsound berlanjut antarhalaman selama sesi website.
// Browser tetap dapat membatasi autoplay; setelah pengunjung mengaktifkan audio sekali,
// preferensi dan posisi lagu dipulihkan saat berpindah halaman.
(() => {
  if (window.__RSR_MUSIC_INITIALIZED__) return;
  window.__RSR_MUSIC_INITIALIZED__ = true;
  if (document.getElementById('rsrMusic')) return;

  const KEY = 'rsr_music_session';
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch (_) {}
  const state = {
    volume: Number.isFinite(Number(saved.volume)) ? Math.max(0, Math.min(1, Number(saved.volume))) : 0.35,
    muted: saved.muted === true,
    unlocked: saved.unlocked === true,
    playing: saved.playing !== false,
    time: Number(saved.time) || 0
  };

  const persist = () => {
    try { sessionStorage.setItem(KEY, JSON.stringify({
      volume: audio.volume, muted: audio.muted, unlocked: state.unlocked,
      playing: !audio.paused && !state.userPaused, time: audio.currentTime
    })); } catch (_) {}
  };

  const style = document.createElement('style');
  style.textContent = `#rsrMusic{position:fixed;right:16px;bottom:18px;z-index:1040;background:#fff;border:1px solid #dce8dc;border-radius:18px;box-shadow:0 8px 28px #16351f24;padding:10px 12px;display:flex;align-items:center;gap:9px;font:600 12px system-ui;color:#24543a}#rsrMusic button{border:0;border-radius:50%;width:34px;height:34px;background:#2d6a4f;color:white;font-size:15px}#rsrMusic .rsr-vol{width:66px;accent-color:#2d6a4f}#rsrMusic small{display:block;font-weight:400;color:#718477}#rsrMusic .rsr-mute{background:#edf4ee;color:#24543a}@media(max-width:480px){#rsrMusic{right:10px;bottom:12px;padding:8px 10px}#rsrMusic .rsr-vol{width:48px}#rsrMusic .rsr-title{max-width:105px}}`;
  document.head.append(style);

  const player = document.createElement('div');
  player.id = 'rsrMusic';
  player.innerHTML = `<button id="rsrPlay" aria-label="Putar musik" title="Putar / jeda">▶</button><div class="rsr-title" id="rsrMusicTitle">Suasana Ceria<small>Original Ragunan Ride</small></div><button id="rsrMute" class="rsr-mute" aria-label="Matikan suara" title="Mute">♪</button><input id="rsrVolume" class="rsr-vol" type="range" min="0" max="1" step="0.05" aria-label="Volume musik">`;
  document.body.append(player);

  const audio = new Audio(new URL('assets/audio/backsound-ceria-original.wav', document.baseURI).href);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = state.volume;
  audio.muted = state.muted || !state.unlocked;
  state.userPaused = !state.playing;

  const vol = player.querySelector('#rsrVolume');
  const play = player.querySelector('#rsrPlay');
  const mute = player.querySelector('#rsrMute');
  const title = player.querySelector('#rsrMusicTitle');
  vol.value = audio.volume;

  function update() {
    play.textContent = audio.paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', audio.paused ? 'Putar musik' : 'Jeda musik');
    mute.textContent = audio.muted ? '×' : '♪';
    title.innerHTML = audio.paused
      ? 'Suasana Ceria<small>Tekan Play untuk memutar</small>'
      : 'Suasana Ceria<small>Original Ragunan Ride</small>';
    persist();
  }

  audio.addEventListener('loadedmetadata', () => {
    if (state.time > 0 && Number.isFinite(audio.duration)) {
      try { audio.currentTime = Math.min(state.time, Math.max(0, audio.duration - 1)); } catch (_) {}
    }
  }, { once: true });

  async function attemptPlay(withSound) {
    if (state.userPaused) return;
    if (withSound && state.unlocked) audio.muted = state.muted;
    else audio.muted = true;
    try {
      await audio.play();
      update();
    } catch (_) {
      // Jika browser menolak autoplay, tunggu interaksi pengguna.
      update();
    }
  }

  // Pulihkan lagu dan posisi terakhir ketika halaman baru dibuka.
  attemptPlay(state.unlocked);

  function unlockOnGesture() {
    if (state.userPaused) return;
    state.unlocked = true;
    audio.muted = state.muted;
    audio.play().then(update).catch(update);
    window.removeEventListener('pointerdown', unlockOnGesture, true);
    window.removeEventListener('keydown', unlockOnGesture, true);
    persist();
  }
  window.addEventListener('pointerdown', unlockOnGesture, true);
  window.addEventListener('keydown', unlockOnGesture, true);

  play.addEventListener('click', async () => {
    if (audio.paused) {
      state.userPaused = false;
      state.playing = true;
      state.unlocked = true;
      audio.muted = state.muted;
      try { await audio.play(); } catch (_) {}
    } else {
      state.userPaused = true;
      state.playing = false;
      audio.pause();
    }
    update();
  });

  mute.addEventListener('click', () => {
    audio.muted = !audio.muted;
    state.muted = audio.muted;
    if (!audio.muted) state.unlocked = true;
    update();
  });
  vol.addEventListener('input', () => {
    audio.volume = Number(vol.value);
    state.volume = audio.volume;
    if (audio.volume > 0) {
      audio.muted = false;
      state.muted = false;
      state.unlocked = true;
    }
    update();
  });

  audio.addEventListener('timeupdate', persist);
  audio.addEventListener('play', update);
  audio.addEventListener('pause', update);
  window.addEventListener('pagehide', persist);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persist();
  });
  update();
})();
