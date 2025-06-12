const todoData = {
    '2025-06-08': [
        { text: '아침 운동하기', checked: false },
        { text: '책 읽기', checked: false },
        { text: '점심 약속', checked: false }
    ],
    '2025-06-09': [
        { text: '업무 보고', checked: false },
        { text: '저녁 산책', checked: false }
    ],
    '2025-06-10': [
        { text: '청소', checked: false },
        { text: '독서', checked: false },
        { text: '요리 연습', checked: false }
    ],
    '2025-06-11': [
        { text: '장보기', checked: false },
        { text: '운동', checked: false }
    ],
    '2025-06-12': [
        { text: '회의 준비', checked: false },
        { text: '친구 만나기', checked: false }
    ]
};

const todayDate = toLocalYYYYMMDD(new Date());
window.dailyTodos = todoData[todayDate] || [];

function renderTodos(readonly = false) {
    const list = document.getElementById('todo-list');
    if (!list) return;
    list.innerHTML = '';
    window.dailyTodos.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = 'template-todo-item';
        // 체크박스
        const checkbox = document.createElement('span');
        checkbox.className = 'todo-checkbox';
        checkbox.style.cursor = 'pointer';
        checkbox.innerHTML = todo.checked ? '✌️' : '<span style="color:#bbb;">○</span>';
        checkbox.onclick = function() {
            todo.checked = !todo.checked;
            renderTodos(readonly);
        };
        li.appendChild(checkbox);
        // 텍스트
        if (!readonly) {
            const span = document.createElement('span');
            span.contentEditable = true;
            span.style.outline = 'none';
            span.onblur = function() { editTodo(idx, span.textContent); };
            span.textContent = todo.text;
            li.appendChild(span);
            // 삭제 버튼
            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.textContent = '❌';
            delBtn.onclick = function() { deleteTodo(idx); };
            li.appendChild(delBtn);
        } else {
            const span = document.createElement('span');
            span.textContent = todo.text;
            li.appendChild(span);
        }
        list.appendChild(li);
    });
}

function addTodo() {
    const selectedDate = document.getElementById('datepicker').value;
    const input = document.getElementById('new-todo-input');
    if (!input) return;
    const value = input.value.trim();
    if (value) {
        todoData[selectedDate] = todoData[selectedDate] || [];
        todoData[selectedDate].push({ text: value, checked: false });
        input.value = '';
        window.dailyTodos = todoData[selectedDate];
        renderTodos(false);
    }
}

function deleteTodo(idx) {
    window.dailyTodos.splice(idx, 1);
    renderTodos(false);
}

function editTodo(idx, value) {
    window.dailyTodos[idx].text = value.trim();
    renderTodos(false);
}

function bindTodoEvents() {
    const addBtn = document.getElementById('add-todo-btn');
    const input = document.getElementById('new-todo-input');
    if (addBtn) addBtn.onclick = addTodo;
    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') addTodo();
        });
    }
    renderTodos(false);
}

function renderQuickTemplateBar() {
    const bar = document.getElementById('quick-template-bar');
    if (!bar || !window.templates) return;
    bar.innerHTML = '';
    window.templates.forEach(tpl => {
        const btn = document.createElement('button');
        btn.className = 'quick-template-btn';
        btn.setAttribute('data-template', tpl.title);
        btn.innerHTML = `<span class="quick-template-icon">${tpl.type === 'weather' ? '☁️' : '📄'}</span>
        <span class="quick-template-title">${tpl.title}</span>`;
        btn.onclick = function() {
            const selectedDate = document.getElementById('datepicker').value;
            if (Array.isArray(tpl.todos)) {
                todoData[selectedDate] = todoData[selectedDate] || [];
                // 템플릿의 문자열 배열을 객체 배열로 변환하여 추가
                const newTodos = tpl.todos.map(t => ({ text: t, checked: false }));
                todoData[selectedDate] = todoData[selectedDate].concat(newTodos);
                window.dailyTodos = todoData[selectedDate];
                renderTodos(false);
            }
        };
        bar.appendChild(btn);
    });
}

// 일일 예보에서 5개만 추출
function renderForecast(dateStr) {
    if (!window.fetchForecast) return;
    window.fetchForecast(dateStr);
}

// flatpickr 달력 및 날짜별 할 일 관리 (할 일 관리 페이지에서만)
function initTodoCalendar() {
    if (!window.flatpickr) return;
    const today = new Date();
    const prevMonthFirst = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const nextMonthLast = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    const minDate = toLocalYYYYMMDD(prevMonthFirst);
    const maxDate = toLocalYYYYMMDD(nextMonthLast);

    flatpickr.localize(flatpickr.l10ns.ko);
    flatpickr('#datepicker', {
        inline: true,
        locale: "ko",
        defaultDate: new Date(),
        minDate: minDate,
        maxDate: maxDate,
        dateFormat: 'Y-m-d',
        allowInput: false,
        disableMonthSelector: false,
        monthSelectorType: "static",
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const date = dayElem.dateObj;
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const ymd = `${y}-${m}-${d}`;
            if (todoData[ymd]) {
                const dot = document.createElement('div');
                dot.className = 'custom-todo-dot';
                dayElem.appendChild(dot);
            }
        },
        onReady: function(selectedDates, dateStr, instance) {
            window.dailyTodos = todoData[dateStr] ? [...todoData[dateStr]] : [];
            updateMonthTitle(instance);
            renderTodos(false);
            renderQuickTemplateBar();
            renderForecast(dateStr);
        },
        onChange: function(selectedDates, dateStr) {
            window.dailyTodos = todoData[dateStr] ? [...todoData[dateStr]] : [];
            renderTodos(false);
            renderForecast(dateStr);
        },
        onMonthChange: function(selectedDates, dateStr, instance) {
            updateMonthTitle(instance);
        }
    });
}

function updateMonthTitle(instance) {
    const monthElement = instance.calendarContainer.querySelector('.cur-month');
    const yearElement = instance.calendarContainer.querySelector('.cur-year');
    if (monthElement && yearElement) {
        // 연도 input을 span으로 교체
        let yearText = yearElement;
        if (yearElement.tagName === 'INPUT') {
            yearText = document.createElement('span');
            yearText.className = 'cur-year';
            yearText.textContent = yearElement.value;
            yearElement.parentNode.replaceChild(yearText, yearElement);
        }
        // 항상 YYYY.MM 형식으로 세팅
        const parent = monthElement.parentNode;
        const monthNum = String(instance.currentMonth + 1).padStart(2, '0');
        yearText.textContent = `${instance.currentYear}.${monthNum}`;
        // 월 텍스트 숨김
        monthElement.style.display = 'none';
        // 연도 텍스트가 월 앞에 오도록 위치 조정
        if (yearText.nextSibling !== monthElement) {
            parent.insertBefore(yearText, monthElement);
        }
    }
}

function toLocalYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// 할 일 관리 페이지 진입 시 flatpickr 달력 초기화
if (document.getElementById('datepicker')) {
    // 할일 관리
    document.addEventListener('DOMContentLoaded', () => {
        initTodoCalendar();
        bindTodoEvents();
    });
} else {
    // 홈
    document.addEventListener('DOMContentLoaded', () => {
        renderTodos(true);
    });
}