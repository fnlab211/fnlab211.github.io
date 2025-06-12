async function loadPage(page) {
    const header = document.getElementById('header');
    const mainContent = document.getElementById('main-content');
    const footer = document.getElementById('footer');
    // header, footer 고정 로드
    header.innerHTML = '';
    footer.innerHTML = '';
    header.innerHTML = await (await fetch('components/header.html')).text();
    footer.innerHTML = await (await fetch('components/footer.html')).text();
    const navs = document.querySelectorAll('footer .nav-item');
    navs.forEach(n => n.classList.remove('active'));
    // 본문(main-content)만 동적으로 변경
    mainContent.innerHTML = '';
    if (page === 'home') {
        const weatherHtml = await (await fetch('components/weather.html')).text();
        mainContent.insertAdjacentHTML('beforeend', weatherHtml);
        if (window.fetchWeather) window.fetchWeather();

        const todoListHtml = await (await fetch('components/todo-list.html')).text();
        mainContent.insertAdjacentHTML('beforeend', todoListHtml);
        if (window.renderTodos) window.renderTodos(true);

        const el = document.getElementById('nav-home');
        if (el) el.classList.add('active');
    } else if (page === 'todo') {
        const todoEditHtml = await (await fetch('components/todo-edit.html')).text();
        mainContent.insertAdjacentHTML('beforeend', todoEditHtml);
        if (window.initTodoCalendar) window.initTodoCalendar();
        if (window.renderTodos) window.renderTodos(false);
        if (window.bindTodoEvents) window.bindTodoEvents();

        const el = document.getElementById('nav-todo');
        if (el) el.classList.add('active');
    } else if (page === 'template') {
        const templateListHtml = await (await fetch('components/template-list.html')).text();
        mainContent.insertAdjacentHTML('beforeend', templateListHtml);
        if (window.loadTemplateList) window.loadTemplateList();
        
        const el = document.getElementById('nav-template');
        if (el) el.classList.add('active');
    }
}
// 기본 진입 시 홈으로 이동
if (!window.location.hash || window.location.hash === '#home') {
    document.addEventListener('DOMContentLoaded', () => loadPage('home'));
}

// 템플릿 리스트 SPA 상세 이동 이벤트 위임
function bindTemplateListEvents() {
    const list = document.querySelector('.template-list');
    if (!list) return;
    list.addEventListener('click', function(e) {
        const item = e.target.closest('.template-item');
        if (item) {
            const type = item.getAttribute('data-type') || '';
            loadTemplateDetail(type);
        }
    });
}

// template-list.html이 로드된 후 이벤트 바인딩
if (window.loadPage) {
    const origLoadPage = window.loadPage;
    window.loadPage = function(page) {
        origLoadPage(page);
        if (page === 'template') {
            setTimeout(bindTemplateListEvents, 100); // DOM 렌더 후 바인딩
        }
    };
} 