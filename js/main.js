// 컴포넌트 동적 로드 함수만 정의
function loadComponent(path) {
    fetch(path)
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').insertAdjacentHTML('beforeend', html);
        });
} 