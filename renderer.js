const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
let WORK_TIME = DEFAULT_WORK_MINUTES * 60;
let BREAK_TIME = DEFAULT_BREAK_MINUTES * 60;
const CIRCUMFERENCE = 2 * Math.PI * 106;

let timerType = 'work';
let timeLeft = WORK_TIME;
let totalTime = WORK_TIME;
let isRunning = false;
let sessionCount = 0;
let timerInterval = null;
let dailyRecords = {};
let shownMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDay = new Date();

const timerDisplay = document.getElementById('timer-display');
const modeLabel = document.getElementById('mode-label');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const ringProgress = document.getElementById('ring-progress');
const sessionSpan = document.getElementById('session-count');
const customSound = document.getElementById('custom-sound');
const soundName = document.getElementById('sound-name');
const timeSlider = document.getElementById('time-slider');
const sliderTime = document.getElementById('slider-time');
const settingsOverlay = document.getElementById('settings-overlay');
const calendarOverlay = document.getElementById('calendar-overlay');

function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

function updateSlider() {
  timeSlider.max = totalTime;
  timeSlider.value = timeLeft;
  timeSlider.disabled = isRunning;
  sliderTime.textContent = formatTime(timeLeft);
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  document.title = `${formatTime(timeLeft)} - ${timerType === 'work' ? '专注' : '休息'}`;
  updateSlider();
}

function updateRing() {
  const progress = 1 - (timeLeft / totalTime);
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
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

function updateStartButton() {
  startBtn.textContent = isRunning ? '暂停' : '开始';
  startBtn.className = isRunning ? 'btn btn-primary pause' : 'btn btn-primary';
  updateSlider();
}

function renderCalendar() {
  const year = shownMonth.getFullYear();
  const month = shownMonth.getMonth();
  document.getElementById('month-title').textContent = `${year}年${month + 1}月`;
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  ['一', '二', '三', '四', '五', '六', '日'].forEach(day => {
    grid.insertAdjacentHTML('beforeend', `<div class="weekday">${day}</div>`);
  });

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < offset; i++) grid.insertAdjacentHTML('beforeend', '<div class="calendar-date empty"></div>');

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const count = dailyRecords[localDay(date)] || 0;
    const selected = localDay(date) === localDay(selectedDay);
    grid.insertAdjacentHTML('beforeend', `<button class="calendar-date ${count ? 'has-record' : ''} ${selected ? 'selected' : ''}" data-day="${day}"><span>${day}</span>${count ? `<small>${count}个</small>` : ''}</button>`);
  }

  grid.querySelectorAll('[data-day]').forEach(button => {
    button.addEventListener('click', () => {
      selectedDay = new Date(year, month, Number(button.dataset.day));
      renderCalendar();
    });
  });
  const count = dailyRecords[localDay(selectedDay)] || 0;
  document.getElementById('calendar-detail').innerHTML = `<span>${selectedDay.getMonth() + 1}月${selectedDay.getDate()}日</span><strong>${count} 个番茄</strong>`;
}

function playDoneSound() {
  if (customSound.src) {
    customSound.currentTime = 0;
    customSound.play().catch(() => {});
    return;
  }
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = timerType === 'work' ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25];
    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + index * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.2 + 0.4);
      oscillator.start(ctx.currentTime + index * 0.2);
      oscillator.stop(ctx.currentTime + index * 0.2 + 0.4);
    });
  } catch {}
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(tick, 1000);
  updateStartButton();
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
  updateStartButton();
}

function switchMode() {
  timerType = timerType === 'work' ? 'break' : 'work';
  totalTime = timerType === 'work' ? WORK_TIME : BREAK_TIME;
  timeLeft = totalTime;
  updateModeLabel(); updateDisplay(); updateRing();
}

async function tick() {
  timeLeft--;
  updateDisplay(); updateRing();
  if (timeLeft > 0) return;
  clearInterval(timerInterval);
  isRunning = false;
  if (timerType === 'work') {
    dailyRecords = await window.pomodoro.recordSession();
    sessionCount = dailyRecords[localDay()] || 0;
    sessionSpan.textContent = sessionCount;
    if (!calendarOverlay.hidden) renderCalendar();
  }
  playDoneSound();
  switchMode();
  startTimer();
}

document.getElementById('open-settings').addEventListener('click', () => { settingsOverlay.hidden = false; });
document.getElementById('close-settings').addEventListener('click', () => { settingsOverlay.hidden = true; });
document.getElementById('open-calendar').addEventListener('click', () => {
  settingsOverlay.hidden = true;
  selectedDay = new Date();
  shownMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1);
  renderCalendar();
  calendarOverlay.hidden = false;
});
document.getElementById('back-settings').addEventListener('click', () => {
  calendarOverlay.hidden = true;
  settingsOverlay.hidden = false;
});
document.getElementById('close-calendar').addEventListener('click', () => { calendarOverlay.hidden = true; });
settingsOverlay.addEventListener('click', event => { if (event.target === settingsOverlay) settingsOverlay.hidden = true; });
calendarOverlay.addEventListener('click', event => { if (event.target === calendarOverlay) calendarOverlay.hidden = true; });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { settingsOverlay.hidden = true; calendarOverlay.hidden = true; }
});

document.getElementById('prev-month').addEventListener('click', () => {
  shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1);
  selectedDay = new Date(shownMonth);
  renderCalendar();
});
document.getElementById('next-month').addEventListener('click', () => {
  shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1);
  selectedDay = new Date(shownMonth);
  renderCalendar();
});

timeSlider.addEventListener('input', () => {
  if (isRunning) return;
  timeLeft = Number(timeSlider.value);
  updateDisplay(); updateRing();
});

document.getElementById('choose-sound').addEventListener('click', async () => {
  const chosen = await window.pomodoro.chooseSound();
  if (chosen) { customSound.src = chosen.soundDataUrl; soundName.textContent = chosen.name; }
});

document.getElementById('save-durations').addEventListener('click', async () => {
  const workMinutes = Number(document.getElementById('work-minutes').value);
  const breakMinutes = Number(document.getElementById('break-minutes').value);
  const message = document.getElementById('settings-message');
  if (!Number.isInteger(workMinutes) || workMinutes < 1 || workMinutes > 120 || !Number.isInteger(breakMinutes) || breakMinutes < 1 || breakMinutes > 60) {
    message.textContent = '专注需为 1–120 分钟，休息需为 1–60 分钟';
    return;
  }
  await window.pomodoro.saveDurations({ workMinutes, breakMinutes });
  WORK_TIME = workMinutes * 60; BREAK_TIME = breakMinutes * 60;
  totalTime = timerType === 'work' ? WORK_TIME : BREAK_TIME;
  timeLeft = Math.min(timeLeft, totalTime);
  message.textContent = '时长已保存';
  updateDisplay(); updateRing();
});

startBtn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
resetBtn.addEventListener('click', () => {
  pauseTimer(); timerType = 'work'; totalTime = WORK_TIME; timeLeft = WORK_TIME;
  updateModeLabel(); updateDisplay(); updateRing(); updateStartButton();
});

ringProgress.style.strokeDasharray = CIRCUMFERENCE;
updateModeLabel(); updateDisplay(); updateRing(); updateStartButton();

window.pomodoro.loadData().then(data => {
  WORK_TIME = (data.workMinutes || DEFAULT_WORK_MINUTES) * 60;
  BREAK_TIME = (data.breakMinutes || DEFAULT_BREAK_MINUTES) * 60;
  totalTime = timeLeft = WORK_TIME;
  document.getElementById('work-minutes').value = WORK_TIME / 60;
  document.getElementById('break-minutes').value = BREAK_TIME / 60;
  dailyRecords = data.records || {};
  sessionCount = dailyRecords[localDay()] || 0;
  sessionSpan.textContent = sessionCount;
  if (data.soundDataUrl) { customSound.src = data.soundDataUrl; soundName.textContent = data.soundPath.split(/[\\/]/).pop(); }
  updateDisplay(); updateRing();
}).catch(() => {});
