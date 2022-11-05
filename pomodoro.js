// sound
const sound = new Audio("sound/alarm.wav");

// 디폴트값 설정
const pomodoroOriginalTime = 5;
const originalSecond = 0;

// State
const STATE = { pomodoro: 0, short_break: 1, long_break: 2, pause: 3 };
let nowState = STATE.pause;  // pause 상태일 때만 브레이크 타임 조정 가능.

// display
const timerDisplay = document.getElementById("pomodoroTimer_wrap");
const shortBreakDisplay = document.getElementById("shortBreakTimer_wrap");
const longBreakDisplay = document.getElementById("longBreakTimer_wrap");

const timer = document.getElementById("pomodoroTimer");
const shortBreakTimer = document.getElementById("shortBreakTimer");
const longBreakTimer = document.getElementById("longBreakTimer");

// START, CANCEL Buttons
var timerID;
const startBtn = document.querySelector("#startBtn");
const cancelBtn = document.querySelector("#cancelBtn");

function displayTimeString(minute, second) {
  return `${("0" + minute).slice(-2)}:${("0" + second).slice(-2)}`;
}

startBtn.addEventListener("click", () => {
  // 할 일이 설정되어 있지 않으면 알람.
  if (currentTask == null) {
    alert("You need to set up a new task first.");
    return;
  }

  nowState = STATE.pomodoro;

  // 뽀모도로 화면으로 전환부터
  timerDisplay.style.display = "block";
  shortBreakDisplay.style.display = "none";
  longBreakDisplay.style.display = "none";
    // CSS clicked 효과도 마찬가지
  pomodoroBtn.classList.add("clicked");
  shortBtn.classList.remove("clicked");
  longBtn.classList.remove("clicked");

  // START 버튼 사라지게 & CALCEL 버튼 활성화
  startBtn.style.display = "none";
  cancelBtn.style.display = "inline-block";

  // 화면에 출력할 시/분
  var minute = pomodoroOriginalTime;
  var second = originalSecond;
  var startTime = new Date();

  // 메인 동작 실행 (중요!!! 이 어플의 메인 기능)
  timerID = setInterval( function() {
    var now = new Date();
    var interval = (now - startTime) / 1000;
    if (interval >= 1) {
      second--;
      if (second < 0) { 
        minute--;
        second = 59;
      }
      if (minute < 0) { // 25분이 전부 지났다면..
        // 0) 사운드 
        sound.play();
        // 1) 타이머 초기화
        minute = pomodoroOriginalTime; 
        second = originalSecond; // 원래는 25분, 0초
        // 2) 종료
        clearInterval(timerID);
        // 3) 체크리스트 갱신
        currentTask.isDone = true;
        currentTask.firstChild.classList.add("completeTask");
        if ( isEverythingDone(currentCategory) ) {
          currentCategory.isEverythingDone = true;
          currentCategory.firstChild.classList.add("completeTask");
        }

        // 4) 브레이크 타임으로 분기
        selectBreak(); startBreak();
      }
      timer.innerText = displayTimeString(minute, second);
      startTime = now;
    }
    
  }, 10);
});

cancelBtn.addEventListener("click", () => {
  // START 버튼 활성화 & CALCEL 버튼 사라지게
  startBtn.style.display = "inline-block";
  cancelBtn.style.display = "none";

  // 현재 실행 중인 (종류를 막론하고) 타이머 중단
  if (timerID) clearInterval(timerID);

  // 포모도로 타이머 초기화
  timer.innerText = displayTimeString(pomodoroOriginalTime, originalSecond);

  // break time 초기화
  shortBreakTimer.innerText = "05:00";
  longBreakTimer.innerText = "15:00";

  // up/down 버튼 활성화
  upShortBtn.style.visibility = "visible";
  downShortBtn.style.visibility = "visible";
  upLongBtn.style.visibility = "visible";
  downLongBtn.style.visibility = "visible";

  // 포모도로 화면으로 전환
  timerDisplay.style.display = "block";
  shortBreakDisplay.style.display = "none";
  longBreakDisplay.style.display = "none";
    // 네비게이션도 화면 전환
  pomodoroBtn.classList.add("clicked");
  shortBtn.classList.remove("clicked");
  longBtn.classList.remove("clicked");

  // 할 일 목록 전환
  checkListUpdate();
  changeCurrentTaskName();

  nowState = STATE.pause;
});


// BREAK 동작
function selectBreak() {
  // short? or long break? 판단하는 함수 -> nowState 값을 바꾼다.
  // 현재 선택된 카테고리 내부의 서브테스크를 순회한다.
  let isFind = false;
  
  for (let i = 0; i < currentCategory.subTasks.length; i++) {
    if ( !currentCategory.subTasks[i].isDone ) {
      isFind = true;
    }
  }

  if (isFind) {
    nowState = STATE.short_break;
  }
  else {
    nowState = STATE.long_break;
  }

  // currentTask 갱신
  checkListUpdate();
}

function startBreak() {
  // nowState 값에 따라 분기한다.
  if (nowState === STATE.short_break) shortBreakTime();
  else if (nowState === STATE.long_break) longBreakTime();
}

function longBreakTime() {
  // 타이머가 동작하고 있다면 휴식시간이 아니다. (return;)
  if (nowState === STATE.pomodoro) return;

  // 뽀모도로 타이머를 숨기고, 브레이크 타임 디스플레이를 불러오자.
  timerDisplay.style.display = "none";
  longBreakDisplay.style.display = "block";
  shortBreakDisplay.style.display = "none";

  // 네비게이션도 LONG BREAK 모드로..
  pomodoroBtn.classList.remove("clicked");
  shortBtn.classList.remove("clicked");
  longBtn.classList.add("clicked");

  // 위 아래 버튼도 없애야 한다.
  upLongBtn.style.visibility = "hidden";
  downLongBtn.style.visibility = "hidden";

  // 사용자가 설정한 minute, second 값을 가져온다.
  var minute = parseInt( longBreakDisplay.innerText.split(":")[0] );
  var second = parseInt( longBreakDisplay.innerText.split(":")[1] );

  // 타이머 종료 후 다시 원상복구할 때를 위한 변수 저장
  var originalMin = minute;
  var originalSec = second;

  // 화면에 출력할 시/분 계산의 베이스 시각
  var startTime = new Date();

  // 새로운 메인 동작 실행
  timerID = setInterval( function() {
    var now = new Date();
    var interval = (now - startTime) / 1000;
    if (interval >= 1) {
      second--;
      if (second < 0) { 
        minute--;
        second = 59;
      }
      if (minute < 0) { // 특정 분이 전부 지났다면..
        // 0) 사운드
        sound.play();
        // 1) 타이머 초기화
        minute = originalMin; second = originalSec;
        // 2) 종료
        clearInterval(timerID);
        // 3) 현재 할 일 제목 바꾸기
        changeCurrentTaskName();
        // 4) up.down 활성화
        upLongBtn.style.visibility = "visible";
        downLongBtn.style.visibility = "visible";
        // 3) 포모도로 타임으로 되돌아가기
        backToPomodoro();
      }

      longBreakTimer.innerText = displayTimeString(minute, second);
      startTime = now;
    }
    
  }, 10);

}

function shortBreakTime() {
  // 타이머가 동작하고 있다면 휴식시간이 아니다. (return;)
  if (nowState === STATE.pomodoro) return;

  // 뽀모도로 타이머를 숨기고, 브레이크 타임 디스플레이를 불러오자.
  timerDisplay.style.display = "none";
  longBreakDisplay.style.display = "none";
  shortBreakDisplay.style.display = "block";

  // 네비게이션도 SHORT BREAK 모드로..
  pomodoroBtn.classList.remove("clicked");
  shortBtn.classList.add("clicked");
  longBtn.classList.remove("clicked");

  // 위 아래 버튼도 없애야 한다.
  upShortBtn.style.visibility = "hidden";
  downShortBtn.style.visibility = "hidden";

  // 사용자가 설정한 minute, second 값을 가져온다.
  var minute = parseInt( shortBreakDisplay.innerText.split(":")[0] );
  var second = parseInt( shortBreakDisplay.innerText.split(":")[1] );

  // 타이머 종료 후 다시 원상복구할 때를 위한 변수 저장
  var originalMin = minute;
  var originalSec = second;

  // 화면에 출력할 시/분 계산의 베이스 시각
  var startTime = new Date();

  // 새로운 메인 동작 실행
  timerID = setInterval( function() {
    var now = new Date();
    var interval = (now - startTime) / 1000;
    if (interval >= 1) {
      second--;
      if (second < 0) { 
        minute--;
        second = 59;
      }
      if (minute < 0) { // 특정 분이 전부 지났다면..
        // 0) 사운드
        sound.play();
        // 1) 타이머 초기화
        minute = originalMin; second = originalSec;
        // 2) 종료
        clearInterval(timerID);
        // 3) 현재 할 일 제목 바꾸기
        changeCurrentTaskName();
        // 4) up.down 활성화
        upShortBtn.style.visibility = "visible";
        downShortBtn.style.visibility = "visible";
        // 3) 포모도로 타임으로 되돌아가기
        backToPomodoro();
      }

      shortBreakTimer.innerText = displayTimeString(minute, second);
      startTime = now;
    }
    
  }, 10);
}

function backToPomodoro() {
  nowState = STATE.pause;

  // 뽀모도로 화면으로 전환
  timerDisplay.style.display = "block";
  shortBreakDisplay.style.display = "none";
  longBreakDisplay.style.display = "none";

  // 뽀모도로 네비게이션 전환
  pomodoroBtn.classList.add("clicked");
  shortBtn.classList.remove("clicked");
  longBtn.classList.remove("clicked");

  // 버튼도 전환
  startBtn.style.display = "inline-block";
  cancelBtn.style.display = "none";
}

// short and long Btn event
const pomodoroBtn = document.getElementById("pomodoroBtn");
const shortBtn = document.getElementById("shortBreakBtn");
const longBtn = document.getElementById("longBreakBtn");

pomodoroBtn.addEventListener("click", () => {
  // 타이머가 실행 중이면 브레이크 화면으로 전환 안 된다.
  if (nowState !== STATE.pause) return;

  // CSS clicked 효과
  pomodoroBtn.classList.add("clicked");
  shortBtn.classList.remove("clicked");
  longBtn.classList.remove("clicked");

  // 화면 전환
  timerDisplay.style.display = "block";
  shortBreakDisplay.style.display = "none";
  longBreakDisplay.style.display = "none";
});

shortBtn.addEventListener("click", () => {
  // 타이머가 실행 중이면 브레이크 화면으로 전환 안 된다.
  if (nowState !== STATE.pause) return;

  // CSS clicked 효과
  pomodoroBtn.classList.remove("clicked");
  shortBtn.classList.add("clicked");
  longBtn.classList.remove("clicked");

  // 1) 화면 전환
  timerDisplay.style.display = "none";
  longBreakDisplay.style.display = "none";
  shortBreakDisplay.style.display = "block";
});

longBtn.addEventListener("click", () => {
  // 타이머가 실행 중이면 브레이크 화면으로 전환 안 된다.
  if (nowState !== STATE.pause) return;
  
  // CSS clicked 효과
  pomodoroBtn.classList.remove("clicked");
  shortBtn.classList.remove("clicked");
  longBtn.classList.add("clicked");

  // 1) 화면 전환
  timerDisplay.style.display = "none";
  shortBreakDisplay.style.display = "none";
  longBreakDisplay.style.display = "block";
});


// UP DOWN 버튼 동작
const upShortBtn = document.querySelector("#shortBreakTimer_wrap > div:first-child");
const downShortBtn = document.querySelector("#shortBreakTimer_wrap > div:last-child");
const upLongBtn = document.querySelector("#longBreakTimer_wrap > div:first-child");
const downLongBtn = document.querySelector("#longBreakTimer_wrap > div:last-child");

upShortBtn.addEventListener("click", () => {
  // 사용자가 설정한 minute 값을 가져온다.
  var minute = parseInt( shortBreakTimer.innerText.split(":")[0] );
  var second = parseInt( shortBreakTimer.innerText.split(":")[1] );

  // +1을 하자.
  if (minute !== 10) minute++;

  // 새로 설정하기.
  shortBreakTimer.innerText = displayTimeString(minute, second);
});

downShortBtn.addEventListener("click", () => {
  // 사용자가 설정한 minute 값을 가져온다.
  var minute = parseInt( shortBreakTimer.innerText.split(":")[0] );
  var second = parseInt( shortBreakTimer.innerText.split(":")[1] );

  // -1을 하자.
  minute--;
  if (minute === 0) minute = 1;

  // 새로 설정하기.
  shortBreakTimer.innerText = displayTimeString(minute, second);
});

upLongBtn.addEventListener("click", () => {
// 사용자가 설정한 minute 값을 가져온다.
var minute = parseInt( longBreakTimer.innerText.split(":")[0] );
var second = parseInt( longBreakTimer.innerText.split(":")[1] );

// +1을 하자.
if (minute !== 20) minute++;

// 새로 설정하기.
longBreakTimer.innerText = displayTimeString(minute, second);
});

downLongBtn.addEventListener("click", () => {
  // 사용자가 설정한 minute 값을 가져온다.
  var minute = parseInt( longBreakTimer.innerText.split(":")[0] );
  var second = parseInt( longBreakTimer.innerText.split(":")[1] );

  // -1을 하자. Long Break 라도 아래 제한은 Short break 와 같게 하자.
  minute--;
  if (minute === 0) minute = 1;

  // 새로 설정하기.
  longBreakTimer.innerText = displayTimeString(minute, second);
});

const pomodoroContainer = document.querySelector("#clock_container");
const addTaskContainer = document.querySelector("#container");

// 체크리스트로 이동
const backToListSetting = document.querySelector("#toToDoList");
backToListSetting.addEventListener("click", () => {
  if (nowState !== STATE.pause) return;
  // 디스플레이 전환
  pomodoroContainer.style.display = "none";
  addTaskContainer.style.display = "block";
});

// 포모도로 페이지로 이동 (추가 기능 있음!!)
var currentTask = null;
var currentCategory = null;
const taskNow = document.querySelector("#current_list");
const backToPomodoroBtn = document.querySelector("#backToPomodoro");
backToPomodoroBtn.addEventListener("click", () => {
  // 포모도로 페이지 상단의 현재 할 일 목록 제목으로 설정하기
  checkListUpdate();
  changeCurrentTaskName();

  // 디스플레이 전환
  pomodoroContainer.style.display = "block";
  addTaskContainer.style.display = "none";
});

// 현재 할 일 제목 바꾸기
function changeCurrentTaskName() {
  if (currentTask === null || currentCategory === null) {
    taskNow.innerText = "No More Task..";
  }
  else {
    taskNow.innerText = currentCategory.firstChild.innerText + " : " + currentTask.firstChild.innerText;
  }
}

// currentTask 갱신
function checkListUpdate() {
  const categoryList = document.querySelectorAll("#taskadded > div.task");

  // 첫 번째 카테고리로 들어가, 내부 서브태스크를 순회하면서 isDone = false; 를 발견하면 바로 currentTask에 넣는다.
  for (let i = 0; i < categoryList.length; i++) {
    for (let j = 0; j < categoryList[i].subTasks.length; j++) {
      if ( !categoryList[i].subTasks[j].isDone ) {
        currentCategory = categoryList[i];
        currentTask = currentCategory.subTasks[j];
        return;
      }
    }
  }

  // 못 찾았으면 null 을 넣는다.
  currentTask = null;
}