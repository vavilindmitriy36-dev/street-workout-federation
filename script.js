// Конфигурация Firebase (такая же, как в админке и index.html)
const firebaseConfig = {
    apiKey: "AIzaSyAbIUmK6OS7Sd5jcDygCtxMgXi_Tznc56o",
    authDomain: "street-workout-federation.firebaseapp.com",
    projectId: "street-workout-federation",
    storageBucket: "street-workout-federation.firebasestorage.app",
    messagingSenderId: "281767473596",
    appId: "1:281767473596:web:71c290af7a5fac1472fbb9",
    measurementId: "G-ZEZBRRHKHJ"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Загрузка данных при открытии страницы
document.addEventListener("DOMContentLoaded", () => {
    loadNewsPublic();
    loadEventsPublic();
    checkAdminAuth();
});

// 1. ЗАГРУЗКА НОВОСТЕЙ НА ГЛАВНУЮ СТРАНИЦУ
async function loadNewsPublic() {
    const container = document.getElementById('news-container');
    if (!container) return;

    try {
        const q = firebase.firestore().collection("news").orderBy("createdAt", "desc");
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="section-description">Пока нет добавленных новостей.</p>';
            return;
        }

        container.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const imageUrl = data.image ? data.image : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';
            
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <div class="news-img-wrap">
                    <img src="${imageUrl}" alt="${escapeHtml(data.title)}" style="width:100%; height:200px; object-fit:cover;">
                    <span class="news-tag">${escapeHtml(data.tag || 'НОВОСТИ')}</span>
                </div>
                <div class="news-content" style="padding: 20px;">
                    <h3 style="color: white; margin-bottom: 10px; font-size: 18px;">${escapeHtml(data.title)}</h3>
                    <p style="color: #aaa; font-size: 14px; line-height: 1.5;">${escapeHtml(data.text)}</p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Ошибка загрузки новостей:", error);
        container.innerHTML = '<p class="section-description">Ошибка загрузки новостей.</p>';
    }
}

// 2. ЗАГРУЗКА МЕРОПРИЯТИЙ НА ГЛАВНУЮ СТРАНИЦУ
async function loadEventsPublic() {
    const container = document.getElementById('events-container');
    if (!container) return;

    try {
        const q = firebase.firestore().collection("events").orderBy("createdAt", "desc");
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="section-description">Пока нет предстоящих мероприятий.</p>';
            return;
        }

        container.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const imageUrl = data.image ? data.image : 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80';

            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-img-wrap" style="position: relative;">
                    <img src="${imageUrl}" alt="${escapeHtml(data.title)}" style="width:100%; height:200px; object-fit:cover;">
                    <span style="position: absolute; top: 15px; left: 15px; background: var(--orange); color: black; padding: 4px 10px; font-weight: bold; font-size: 12px; border-radius: 4px;">${escapeHtml(data.status || 'ПРЕДСТОЯЩЕЕ')}</span>
                </div>
                <div class="event-content" style="padding: 20px;">
                    <h3 style="color: white; margin-bottom: 10px; font-size: 18px;">${escapeHtml(data.title)}</h3>
                    <p style="color: #aaa; font-size: 14px; line-height: 1.5;">${escapeHtml(data.text)}</p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Ошибка загрузки мероприятий:", error);
        container.innerHTML = '<p class="section-description">Ошибка загрузки мероприятий.</p>';
    }
}

// 3. УПРАВЛЕНИЕ АВТОРИЗАЦИЕЙ НА ГЛАВНОЙ
function checkAdminAuth() {
    auth.onAuthStateChanged((user) => {
        const loggedOutBar = document.getElementById('admin-logged-out');
        const loggedInBar = document.getElementById('admin-logged-in');
        const adminElements = document.querySelectorAll('.admin-only');

        if (user) {
            if (loggedOutBar) loggedOutBar.style.display = 'none';
            if (loggedInBar) loggedInBar.style.display = 'flex';
            adminElements.forEach(el => el.style.display = 'inline-block');
        } else {
            if (loggedOutBar) loggedOutBar.style.display = 'flex';
            if (loggedInBar) loggedInBar.style.display = 'none';
            adminElements.forEach(el => el.style.display = 'none');
        }
    });
}

// Модальное окно входа
function openLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

// Обработка формы входа в модалке
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const errDiv = document.getElementById('login-error');

            try {
                await auth.signInWithEmailAndPassword(email, password);
                closeLoginModal();
                loginForm.reset();
                if (errDiv) errDiv.style.display = 'none';
            } catch (error) {
                if (errDiv) {
                    errDiv.style.display = 'block';
                    errDiv.textContent = 'Ошибка входа: ' + error.message;
                }
            }
        });
    }
});

function adminLogout() {
    auth.signOut();
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
