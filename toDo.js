const addButton = document.querySelector("#addBtn");
const inputText = document.querySelector("#new_task input");
const taskDisplay = document.querySelector("#taskadded");
const categoryName = document.querySelector("#current_category");

// ADD 버튼 : 새로운 카테고리를 추가한다.
addButton.addEventListener("click", () => {
  // 제대로 입력했는지부터 확인하자.
  if ( inputText.value.length === 0 ) {
    alert("You can't add blank task..");
    return;
  }
  else { // 제대로 입력했다면,
    // 1) 새로운 카테고리(task) 노드 만들기 (그릇)
    const task = document.createElement("div");
    task.classList.add("task");
    task.isEverythingDone = false; // 카테고리 내부 모든 태스크를 완료했는지 확인하는 플래그.

    // 2) 첫 번째 부품 : 텍스트(무슨 일인지)
    const taskName = document.createElement("span");
    taskName.classList.add("task_name");
    taskName.innerText = `# ${inputText.value}`;
    taskName.onclick = function() {
      displaySubTasks(this.parentNode); // 텍스트 부분을 클릭하면 서브 태스크 화면을 열어준다.
    };

    // 3) 두 번째 부품 : 삭제 버튼
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("deleteBtn");
    deleteBtn.innerHTML = `<i class="fa-sharp fa-solid fa-trash"></i>`;
    deleteBtn.onclick = function() {
      this.parentNode.remove();
    };

    // 4) 부모 노드에 합치기
    task.appendChild(taskName);
    task.appendChild(deleteBtn);

    // 5) 서브 태스크 관리를 위한 배열 만들어 할당.
    task.subTasks = [];

    // 6) 최종 결과물을 HTML 노드에 넣는다.
    taskDisplay.appendChild( task );

    // 7) 마지막 작업 : 입력한 텍스트 초기화.
    inputText.value = "";
  }
});

// SUB ADD 버튼 : 할 일 목록(sub task)을 추가한다.
const subTaskDisplay = document.querySelector("#sub_task_container");
const categoryDisplay = document.querySelector("#container");
const subTaskList = document.querySelector("#sub_tasks");
const subAddBtn = document.querySelector("#subAddBtn");
function displaySubTasks(category /* task category 노드 */) {
  // DISPLAY ON
  subTaskDisplay.style.display = "block";
  categoryDisplay.style.display = "none";

  // 현재 카테고리 이름 출력
  categoryName.innerHTML = category.firstChild.innerHTML;

  // 선택된 category에 저장된 서브 태스크 리스트를 보여지게 해야 함.
  for (let i = 0; i < category.subTasks.length; i++) {
    category.subTasks[i].style.display = "block";
  }

  // 버튼 동작 파트 (category 인자를 사용하기 때문에 여기 있어야 한다.)
  subAddBtn.onclick = function() {
    const inputTask = document.querySelector("#sun_topnav > input");
    if ( inputTask.value.length === 0 ) {
      alert("You can't add blank task..");
      return;
    }
    else { // 제대로 입력했다면, 서브 태스크를 category에 추가한다.
      // 0) 부모 노드 만들기
      const task = document.createElement("div");
      task.classList.add("subtask");
      task.isDone = false; // 처음 형성된 것이므로 "끝나지 않은 일"로 설정

      // 1) Task Name Element.
      const taskName = document.createElement("span");
      taskName.classList.add("subtask_name");
      taskName.innerText = `${inputTask.value}`;

      // 2) Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("subdeleteBtn");
      deleteBtn.innerHTML = `<i class="fa-sharp fa-solid fa-trash"></i>`;
      deleteBtn.onclick = function() {
        const thisTaskNode = this.parentNode;

        // 삭제 버튼을 통해 해당 카테고리의 서브 task를 배열에서 삭제해야 한다.
        for (let i = 0; i < category.subTasks.length; i++) {
          if (category.subTasks[i] === thisTaskNode) {
            category.subTasks.splice(i, 1);
          }
        }

        thisTaskNode.remove();
      };

      // 3) insert children nodes into Parent
      task.appendChild(taskName);
      task.appendChild(deleteBtn);

      // 4) insert everything into list
      // subTaskList.insertAdjacentElement("beforebegin", task);
      subTaskList.appendChild(task);

      // 5) 해당 카테고리에 리스트를 추가한다.
      category.subTasks.push( task );

      // 새로운 작업이 추가되었으므로, 카테고리 완료는 다시 갱신되어야 한다.
      category.isEverythingDone = false;
      category.firstChild.classList.remove("completeTask");
      
      // 6) 마지막으로 input text 내용을 초기화하자.
      inputTask.value = "";
    }
    
  };
}

// SUB DONE 버튼 : 서브 태스크 화면 종료;
document.querySelector("#done").addEventListener("click", () => {
  // SUB 화면을 끄자. 
  subTaskDisplay.style.display = "none";

  // 모든 subtask의 display도 none으로 해야 한다.
  document.querySelectorAll(".subtask").forEach( (e) => {
    e.style.display = "none";
  } );

  // 추가된 목록이 있을 시 카테고리와 현재 일을 업데이트 해야 한다.
  checkListUpdate();

  // 원래의 화면은 켜자.
  categoryDisplay.style.display = "block";
});



// SAVE 버튼
const savaBtn = document.querySelector("#saveBtn");
saveBtn.addEventListener("click", () => {
  if ( !confirm("기존 세이브 파일 위에 덮혀 쓰입니다. 하시겠습니까?") ) return;

  const categoryList = document.querySelectorAll("#taskadded > div.task");

  // 로컬 스토리지 파일 모두 삭제
  localStorage.clear();

  // 카테고리를 Key로, 서브태스크를 value로 설정하자.
  for (let i = 0; i < categoryList.length; i++) {
    if ( categoryList[i].isEverythingDone ) continue;

    const k = categoryList[i].firstChild.innerText;
    const v = [];
    
    for (let j = 0; j < categoryList[i].subTasks.length; j++) {  
      if ( !categoryList[i].subTasks[j].isDone )  // 넣을 때 isDone = true; 인 것은 자동으로 빼야 한다.
        v.push( categoryList[i].subTasks[j].firstChild.innerText );
    }

    localStorage.setItem( k, JSON.stringify(v) );
  }
});

// IMPORT 버튼
const importBtn = document.querySelector("#importBtn");
importBtn.addEventListener("click", () => {
  if ( !confirm("현재 설정한 리스트는 삭제됩니다. 하시겠습니까?") ) return;

  // 현재 설정한 리스트는 모두 삭제.
  while( taskDisplay.firstChild ) {
    taskDisplay.firstChild.remove();
  }

  // JSON 로컬 파일을 가져와 DOM 노드에 추가하자.
  for (let i = 0; i < localStorage.length; i++) {
    // 0) 카테고리 노드 이름 불러오기.
    const keyStr = localStorage.key(i);
    let taskNode; // 작업 중인 현 카테고리 노드

    // 1) 카테고리 노드 만들기
    {
      // 1) 새로운 카테고리(task) 노드 만들기 (그릇)
      taskNode = document.createElement("div");
      taskNode.classList.add("task");

      // 2) 첫 번째 부품 : 텍스트(무슨 일인지)
      const taskName = document.createElement("span");
      taskName.classList.add("task_name");
      taskName.innerText = keyStr;
      taskName.onclick = function() {
        displaySubTasks(this.parentNode); // 텍스트 부분을 클릭하면 서브 태스크 화면을 열어준다.
      };

      // 3) 두 번째 부품 : 삭제 버튼
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("deleteBtn");
      deleteBtn.innerHTML = `<i class="fa-sharp fa-solid fa-trash"></i>`;
      deleteBtn.onclick = function() {
        this.parentNode.remove();
      };

      // 4) 부모 노드에 합치기
      taskNode.appendChild(taskName);
      taskNode.appendChild(deleteBtn);

      // 5) 서브 태스크 관리를 위한 배열 만들어 할당.
      taskNode.subTasks = [];

    }

    // 2) 서브태스크 노드 만들어 현 카테고리에 집어넣기
    const subTaskStrings = JSON.parse( localStorage.getItem(keyStr) );
    for (let i = 0; i < subTaskStrings.length; i++) {
      const subTaskStr = subTaskStrings[i];

      // 0) 부모 노드 만들기
      const task = document.createElement("div");
      task.classList.add("subtask");
      task.isDone = false; // 처음 형성된 것이므로 "끝나지 않은 일"로 설정

      // 1) Task Name Element.
      const taskName = document.createElement("span");
      taskName.classList.add("subtask_name");
      taskName.innerText = subTaskStr;

      // 2) Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("subdeleteBtn");
      deleteBtn.innerHTML = `<i class="fa-sharp fa-solid fa-trash"></i>`;
      deleteBtn.onclick = function() {
        const thisTaskNode = this.parentNode;

        // 삭제 버튼을 통해 해당 카테고리의 서브 task를 배열에서 삭제해야 한다.
        for (let i = 0; i < taskNode.subTasks.length; i++) {
          if (taskNode.subTasks[i] === thisTaskNode) {
            taskNode.subTasks.splice(i, 1);
          }
        }

        thisTaskNode.remove();
      };

      // 3) insert children nodes into Parent
      task.appendChild(taskName);
      task.appendChild(deleteBtn);

      task.style.display = "none";
      subTaskList.appendChild( task );

      // 4) 해당 카테고리에 리스트를 추가한다.
      taskNode.subTasks.push( task );
    }

    // 최종 결과물을 HTML 노드에 넣는다.
    taskDisplay.appendChild( taskNode );
  }
});

// 카테고리의 모든 서브태스크를 완료했는지 체크 후 true or false 반환.
function isEverythingDone(category) {
  for (let i = 0; i < category.subTasks.length; i++) {
    if ( !category.subTasks[i].isDone ) {
      return false;
    }
  }

  return true;
}


// 카테고리 분수 계산해서 String 반환
  // 언제 호출? : Sub Done 버튼, 포모도로에서 체크리스트 화면으로 들어갈 때.
function taskLeftOverCategory(category) {
  if (category === null) return;

  // 1) 전체 서브태스크 개수 구하기
  const numAll = category.subTasks.length;

  // 2) isDone 계산하기
  let num = 0;
  for (let i = 0; i < numAll; i++) {
    if (category.subTasks[i].isDone) num++;
  }

  return `${num} / ${numAll}`;
}