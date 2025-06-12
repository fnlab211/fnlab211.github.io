// 달력 및 날짜별 할 일 관리 기능
function toLocalYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function initCalendar() {
    const today = new Date();
    const prevMonthFirst = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const nextMonthLast = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    const minDate = toLocalYYYYMMDD(prevMonthFirst);
    const maxDate = toLocalYYYYMMDD(nextMonthLast);

    flatpickr.localize(flatpickr.l10ns.ko);
    flatpickr("#datepicker", {
        inline: true,
        locale: "ko",
        allowInput: false,
        disableMonthSelector: false,
        monthSelectorType: "static",
        defaultDate: new Date(),
        minDate: minDate,
        maxDate: maxDate,
        showMonths: 1,
        disableMobile: true,
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const date = dayElem.dateObj;
            // 로컬 타임존 기준 yyyy-mm-dd 문자열 생성
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
        onChange: function(selectedDates, dateStr) {
            showTodoListForDate(dateStr);
        },
        onReady: function(selectedDates, dateStr, instance) {
            // 달력 렌더링 후, 오늘(혹은 defaultDate)의 할 일 표시
            let dateToShow = dateStr;
            if (!dateToShow) {
                // dateStr이 비어있으면 defaultDate 사용
                const d = instance.selectedDates[0] || new Date();
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                dateToShow = `${y}-${m}-${day}`;
            }
            setTimeout(() => {
                showTodoListForDate(dateToShow || toLocalYYYYMMDD(new Date()));
            }, 50);
            
            updateMonthTitle(instance);
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
function showTodoListForDate(dateStr) {
    const todos = todoData[dateStr] || [];
    const todoListDiv = document.getElementById('todo-list');
    if (!todoListDiv) return; // 요소가 없으면 아무것도 하지 않음
    todoListDiv.innerHTML = `<strong>${dateStr}</strong>`;
    if (todos.length === 0) {
        todoListDiv.innerHTML += ` : 할 일이 없습니다`;
    } else {
        todoListDiv.innerHTML += todos.map(todo => `<div>• ${todo.text}</div>`).join('');
    }
}
