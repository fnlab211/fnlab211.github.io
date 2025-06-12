// 템플릿 목록
window.templates = window.templates || [
    { type: 'weather', title: '비', weatherType: '500', desc: '날씨 템플릿', todos: ['우산 챙기기', '장화 신기'] },
    { type: 'weather', title: '맑음', weatherType: '800', desc: '날씨 템플릿', todos: ['선크림 바르기', '모자 챙기기', '물통 준비하기', '자외선 차단제 챙기기'] },
    { type: 'situation', title: '여행 갈 때', desc: '상황 템플릿', todos: ['여권/신분증 확인', '항공권/교통편 확인', '숙소 예약 확인', '여행 보험 가입', '여행 가방 챙기기', '충전기/보조배터리 챙기기', '여행지 날씨 확인', '현지 통화 준비'] },
    { type: 'weather', title: '눈', weatherType: '600', desc: '날씨 템플릿', todos: ['장갑 챙기기', '목도리 챙기기', '방한화 신기'] },
    { type: 'weather', title: '안개', weatherType: '701', desc: '날씨 템플릿', todos: ['안개등 켜기', '운전 주의하기', '마스크 챙기기'] },
    { type: 'situation', title: '운동할 때', desc: '상황 템플릿', todos: ['운동복 챙기기', '물통 준비하기', '수건 챙기기', '스트레칭 하기'] }
];

// 템플릿 상세 페이지 로드 및 파라미터 전달
function loadTemplateDetail(id) {
    fetch('components/template-detail.html')
        .then(res => res.text())
        .then(html => {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const section = temp.querySelector('section');
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = '';
            mainContent.appendChild(section);

            // id 파라미터 전달
            section.dataset.type = id;

            // 템플릿 찾기
            let tpl = null;
            if (id) {
                const [type, key] = id.split('|');
                if (type === 'weather') {
                    tpl = window.templates.find(t => t.type === 'weather' && t.weatherType === key);
                } else if (type === 'situation') {
                    tpl = window.templates.find(t => t.type === 'situation' && t.title === key);
                }
            }

            // 템플릿별 할 일 세팅
            window.templateTodos = tpl && Array.isArray(tpl.todos) ? [...tpl.todos] : [];
            renderTemplateTodos();

            // 할 일 기능/구분 콤보/액션/취소/삭제 버튼 바인딩
            if (typeof bindTemplateTypeEvents === 'function') bindTemplateTypeEvents();
            if (typeof bindTemplateAction === 'function') bindTemplateAction(section);
            if (typeof bindTemplateCancelBtn === 'function') bindTemplateCancelBtn();
            bindTemplateTodoEvents();

            // 상세 내용 반영
            const typeSelect = document.getElementById('template-type');
            const titleInput = document.getElementById('template-title');
            const weatherTypeSelect = document.getElementById('weather-type');
            const descInput = document.getElementById('template-desc');
            if (tpl) {
                // 구분값, 상황명/날씨명, 날씨코드 등 반영
                if (typeSelect) typeSelect.value = tpl.type;
                if (typeSelect.value === 'situation') {
                    if (titleInput) titleInput.parentElement.style.display = '';
                    if (weatherTypeSelect) weatherTypeSelect.parentElement.style.display = 'none';
                    if (titleInput) titleInput.value = tpl.title;
                    if (weatherTypeSelect) weatherTypeSelect.value = '';
                } else if (typeSelect.value === 'weather') {
                    if (titleInput) titleInput.parentElement.style.display = 'none';
                    if (weatherTypeSelect) weatherTypeSelect.parentElement.style.display = '';
                    if (weatherTypeSelect) weatherTypeSelect.value = tpl.weatherType;
                    if (titleInput) titleInput.value = '';
                }
                if (descInput) descInput.value = tpl.desc || '';
            } else {
                // 신규 등록
                if (typeSelect) typeSelect.value = 'situation';
                if (titleInput) titleInput.value = '';
                if (weatherTypeSelect) weatherTypeSelect.value = '';
                if (descInput) descInput.value = '';
            }

            // 삭제 버튼 표시/숨김 및 바인딩
            const deleteBtn = document.getElementById('template-delete-btn');
            if (deleteBtn) {
                if (tpl) {
                    deleteBtn.style.display = '';
                    deleteBtn.onclick = function () {
                        if (confirm('정말 이 템플릿을 삭제하시겠습니까?')) {
                            // 템플릿 삭제
                            if (tpl.type === 'weather') {
                                window.templates = window.templates.filter(t => !(t.type === 'weather' && t.weatherType === tpl.weatherType));
                            } else if (tpl.type === 'situation') {
                                window.templates = window.templates.filter(t => !(t.type === 'situation' && t.title === tpl.title));
                            }
                            if (typeof loadTemplateList === 'function') loadTemplateList();
                        }
                    };
                } else {
                    deleteBtn.style.display = 'none';
                }
            }
        });
}

// 템플릿 리스트 새로고침 함수
function loadTemplateList() {
    fetch('components/template-list.html')
        .then(res => res.text())
        .then(html => {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const section = temp.querySelector('section');
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = '';
            mainContent.appendChild(section);

            // 실제 템플릿 목록을 window.templates로 렌더링
            const list = section.querySelector('.template-list');
            if (list) {
                list.innerHTML = '';
                // "템플릿 추가" 버튼
                const addBtn = document.createElement('div');
                addBtn.className = 'template-item';
                addBtn.setAttribute('data-type', 'add');
                addBtn.innerHTML = `
                    <div class="template-icon">➕</div>
                    <div class="template-info">
                        <div class="template-title">템플릿 추가</div>
                    </div>
                    <div class="template-arrow">&#8250;</div>
                `;
                list.appendChild(addBtn);

                // 실제 템플릿 목록
                window.templates.forEach(t => {
                    const item = document.createElement('div');
                    item.className = 'template-item';
                    // 고유 식별자: type + '|' + (weatherType 또는 title)
                    const id = t.type === 'weather' ? `weather|${t.weatherType}` : `situation|${t.title}`;
                    item.setAttribute('data-type', id);
                    item.innerHTML = `
                        <div class="template-icon">${t.type === 'weather' ? '☁️' : '📄'}</div>
                        <div class="template-info">
                            <div class="template-desc">${t.type === 'weather' ? '날씨' : '상황'}</div>
                            <div class="template-title">${t.title}</div>
                        </div>
                        <div class="template-arrow">&#8250;</div>
                    `;
                    list.appendChild(item);
                });
            }

            // 이벤트 바인딩
            if (typeof bindTemplateListEvents === 'function') bindTemplateListEvents();
        });
}

// 액션 버튼 텍스트 및 동작 설정
function bindTemplateAction(section) {
    const btn = document.getElementById('template-action-btn');
    if (!btn) return;
    const type = section.dataset.type;
    btn.textContent = type ? '저장' : '등록';

    btn.onclick = function () {
        // 값 읽기
        const templateTypeInput = document.getElementById('template-type');
        if (!templateTypeInput) return alert('구분을 선택하세요.');
        const templateType = templateTypeInput.value;

        let title = '';
        let weatherType = '';
        if (templateType === 'situation') {
            const titleInput = document.getElementById('template-title');
            if (!titleInput) return alert('상황명을 입력하세요.');
            title = titleInput.value.trim();
            weatherType = '';
        } else {
            const weatherTypeInput = document.getElementById('weather-type');
            if (!weatherTypeInput) return alert('날씨 유형을 선택하세요.');
            weatherType = weatherTypeInput.value;
            // 날씨 유형 텍스트로 변환
            const weatherMap = {
                '800': '맑음', '801': '구름 조금', '802': '구름 많음', '803': '흐림',
                '500': '비', '600': '눈', '701': '안개', '200': '천둥번개'
            };
            title = weatherMap[weatherType] || '날씨 템플릿';
        }
        const descInput = document.getElementById('template-desc');
        const desc = descInput ? descInput.value.trim() : '';

        if (type) {
            // 수정: 기존 템플릿을 정확히 찾아서 모든 값 갱신
            const [oldType, oldKey] = type.split('|');
            let idx = -1;
            if (oldType === 'weather') {
                idx = window.templates.findIndex(t => t.type === 'weather' && t.weatherType === oldKey);
            } else if (oldType === 'situation') {
                idx = window.templates.findIndex(t => t.type === 'situation' && t.title === oldKey);
            }
            if (idx !== -1) {
                window.templates[idx] = {
                    type: templateType,
                    title,
                    weatherType,
                    desc,
                    todos: [...(window.templateTodos || [])]
                };
            }
        } else {
            // 등록
            window.templates.push({ type: templateType, title, weatherType, desc, todos: [...(window.templateTodos || [])] });
        }

        // 템플릿 리스트 새로고침
        if (typeof loadTemplateList === 'function') loadTemplateList();
    };
}

// 취소 버튼 동작
function bindTemplateCancelBtn() {
    const btn = document.getElementById('template-cancel-btn');
    if (!btn) return;
    btn.onclick = function () {
        if (typeof loadTemplateList === 'function') loadTemplateList();
    };
}

// 구분 콤보박스에 따라 입력 UI 토글
function bindTemplateTypeEvents() {
    const typeSelect = document.getElementById('template-type');
    const situationGroup = document.getElementById('situation-title-group');
    const weatherGroup = document.getElementById('weather-type-group');
    if (!typeSelect || !situationGroup || !weatherGroup) return;

    function updateUI() {
        if (typeSelect.value === 'situation') {
            situationGroup.style.display = '';
            weatherGroup.style.display = 'none';
        } else {
            situationGroup.style.display = 'none';
            weatherGroup.style.display = '';
        }
    }

    typeSelect.addEventListener('change', updateUI);
}

// to-do in template
function renderTemplateTodos() {
    const list = document.getElementById('todo-list');
    if (!list) return;
    list.innerHTML = '';
    window.templateTodos.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = 'template-todo-item';
        li.innerHTML = `
            <span contenteditable="true" onblur="editTemplateTodo(${idx}, this.textContent)" style="outline:none;">${todo}</span>
            <button type="button" onclick="deleteTemplateTodo(${idx})">❌</button>
        `;
        list.appendChild(li);
    });
}

function addTemplateTodo() {
    const input = document.getElementById('new-todo-input');
    if (!input) return;
    const value = input.value.trim();
    if (value) {
        window.templateTodos.push(value);
        input.value = '';
        renderTemplateTodos();
    }
}

function deleteTemplateTodo(idx) {
    window.templateTodos.splice(idx, 1);
    renderTemplateTodos();
}

function editTemplateTodo(idx, value) {
    window.templateTodos[idx] = value.trim();
    renderTemplateTodos();
}

function bindTemplateTodoEvents() {
    const addBtn = document.getElementById('add-todo-btn');
    const input = document.getElementById('new-todo-input');
    if (addBtn) addBtn.onclick = addTemplateTodo;
    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') addTemplateTodo();
        });
    }
}