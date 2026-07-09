// 番茄钟核心逻辑
const WORK_TIME = 25 * 60;   // 25分钟
const BREAK_TIME = 5 * 60;   // 5分钟

const CIRCUMFERENCE = 2 * Math.PI * 106; // 圆环周长 (r=106)

// 状态
let timerType = 'work';        // 'work' | 'break'
let timeLeft = WORK_TIME;
let totalTime = WORK_TIME;
let isRunning = false;
let sessionCount = 0;
let timerInterval = null;

// DOM 元素
const timerDisplay = document.getElementById('timer-display');
const modeLabel = document.getElementById('mode-label');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const ringProgress = document.getElementById('ring-progress');
const sessionSpan = document.getElementById('session-count');
const tickSound = document.getElementById('tick-sound');
const doneSound = document.getElementById('done-sound');

// 初始化圆环
ringProgress.style.strokeDasharray = CIRCUMFERENCE;
ringProgress.style.strokeDashoffset = '0';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  document.title = formatTime(timeLeft) + ' - ' + (timerType === 'work' ? '专注' : '休息');
}

function updateRing() {
  const progress = 1 - (timeLeft / totalTime);
  const offset = CIRCUMFERENCE * (1 - progress);
  ringProgress.style.strokeDashoffset = offset;
}

function updateModeLabel() {
  if (timerType === 'work') {
    modeLabel.textContent = '🍅 专注';
    modeLabel.className = 'mode-label work';
    ringProgress.className = 'ring-progress';
  } else {
    modeLabel.textContent = '☕ 休息';
    modeLabel.className = 'mode-label break';
    ringProgress.className = 'ring-progress break';
  }
}

function switchMode() {
  if (timerType === 'work') {
    timerType = 'break';
    timeLeft = BREAK_TIME;
    totalTime = BREAK_TIME;
  } else {
    timerType = 'work';
    timeLeft = WORK_TIME;
    totalTime = WORK_TIME;
  }
  updateModeLabel();
  updateDisplay();
  updateRing();
}

function tick() {
  timeLeft--;
  updateDisplay();
  updateRing();

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    isRunning = false;

    if (timerType === 'work') {
      sessionCount++;
      sessionSpan.textContent = sessionCount;
    }

    // 播放完成音效
    playDoneSound();

    // 切换到下一个模式
    switchMode();

    // 自动开始下一轮
    startTimer();
    updateStartButton();
  }
}

function playDoneSound() {
  // 使用 Web Audio API 生成叮咚音效
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = timerType === 'work' ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.4);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.4);
    });
  } catch (e) {
    // 静默处理
  }
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
}

function updateStartButton() {
  if (isRunning) {
    startBtn.textContent = '暂停';
    startBtn.className = 'btn btn-primary pause';
  } else {
    startBtn.textContent = '开始';
    startBtn.className = 'btn btn-primary';
  }
}

// 事件处理
startBtn.addEventListener('click', () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
  updateStartButton();
});

resetBtn.addEventListener('click', () => {
  pauseTimer();
  timerType = 'work';
  timeLeft = WORK_TIME;
  totalTime = WORK_TIME;
  updateModeLabel();
  updateDisplay();
  updateRing();
  updateStartButton();
});

// 初始化
updateModeLabel();
updateDisplay();
updateRing();
updateStartButton();
sessionSpan.textContent = '0';
