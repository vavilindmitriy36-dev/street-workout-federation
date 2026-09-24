// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAbIUmK6OS7Sd5jcDygCtxMgXi_Tznc56o",
    authDomain: "street-workout-federation.firebaseapp.com",
    projectId: "street-workout-federation",
    storageBucket: "street-workout-federation.firebasestorage.app",
    messagingSenderId: "281767473596",
    appId: "1:281767473596:web:e4c311c1d81b2da5f3844f",
    measurementId: "G-DQJDKLMR9"
};

// Инициализация Firebase 8.x
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    loadSiteContent();
    loadStats();
    loadNewsPublic();
    loadEventsPublic();
    loadSingleItemPage();
});

// ==========================================
// 1. ДИНАМИЧЕСКАЯ ЗАГРУЗКА НОВОСТЕЙ
// ==========================================
async function loadNewsPublic() {
    const container = document.getElementById('news-container');
    if (!container) return;

    try {
        const querySnapshot = await db.collection("news").orderBy("createdAt", "desc").get();

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="section-description" style="grid-column: 1/-1; text-align: center;">Пока нет добавленных новостей.</p>';
            return;
        }

        container.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const docId = doc.id;
            const imageUrl = data.image ? data.image : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';
            
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <div style="position: relative; overflow: hidden; height: 200px; cursor: pointer;" onclick="location.href='news.html?id=${docId}'">
                    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(data.title)}" style="width:100%; height:100%; object-fit:cover;">
                    <span style="position: absolute; top: 15px; left: 15px; background: var(--orange); color: black; padding: 4px 10px; font-weight: bold; font-size: 12px; border-radius: 4px;">${escapeHtml(data.tag || 'НОВОСТИ')}</span>
                </div>
                <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
                    <h3 style="color: white; margin-bottom: 10px; font-size: 18px; cursor: pointer;" onclick="location.href='news.html?id=${docId}'">${escapeHtml(data.title)}</h3>
                    <p style="color: #aaa; font-size: 14px; line-height: 1.5; margin-bottom: 15px; flex-grow: 1;">${escapeHtml(data.text)}</p>
                    <a href="news.html?id=${docId}" style="color: var(--orange); font-size: 14px; font-weight: bold; margin-bottom: 10px; display: inline-block;">Читать далее →</a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Ошибка загрузки новостей:", error);
        container.innerHTML = '<p class="section-description" style="grid-column: 1/-1; text-align: center; color: var(--red);">Ошибка загрузки новостей.</p>';
    }
}

// ==========================================
// 2. ДИНАМИЧЕСКАЯ ЗАГРУЗКА МЕРОПРИЯТИЙ
// ==========================================
async function loadEventsPublic() {
    const container = document.getElementById('events-container');
    if (!container) return;

    try {
        const querySnapshot = await db.collection("events").orderBy("createdAt", "desc").get();

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="section-description" style="grid-column: 1/-1; text-align: center;">Пока нет предстоящих мероприятий.</p>';
            return;
        }

        container.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const docId = doc.id;
            const imageUrl = data.image ? data.image : 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80';

            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div style="position: relative; overflow: hidden; height: 200px; cursor: pointer;" onclick="location.href='events.html?id=${docId}'">
                    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(data.title)}" style="width:100%; height:100%; object-fit:cover;">
                    <span style="position: absolute; top: 15px; left: 15px; background: var(--orange); color: black; padding: 4px 10px; font-weight: bold; font-size: 12px; border-radius: 4px;">${escapeHtml(data.status || 'ПРЕДСТОЯЩЕЕ')}</span>
                </div>
                <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
                    <h3 style="color: white; margin-bottom: 10px; font-size: 18px; cursor: pointer;" onclick="location.href='events.html?id=${docId}'">${escapeHtml(data.title)}</h3>
                    <p style="color: #aaa; font-size: 14px; line-height: 1.5; margin-bottom: 15px; flex-grow: 1;">${escapeHtml(data.text)}</p>
                    <a href="events.html?id=${docId}" style="color: var(--orange); font-size: 14px; font-weight: bold; margin-bottom: 10px; display: inline-block;">Подробнее →</a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Ошибка загрузки мероприятий:", error);
        container.innerHTML = '<p class="section-description" style="grid-column: 1/-1; text-align: center; color: var(--red);">Ошибка загрузки мероприятий.</p>';
    }
}

// ==========================================
// 3. ЗАГРУЗКА ОТДЕЛЬНОЙ СТРАНИЦЫ
// ==========================================
async function loadSingleItemPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return;

    if (window.location.pathname.includes('news.html')) {
        try {
            const doc = await db.collection("news").doc(id).get();
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('news-title').innerText = data.title;
                document.getElementById('news-tag').innerText = data.tag || 'НОВОСТИ';
                document.getElementById('news-content-box').innerHTML = `<p>${escapeHtml(data.text).replace(/\n/g, '<br>')}</p>`;
                if (data.image) {
                    document.getElementById('news-image-container').innerHTML = `<img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.title)}" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px;">`;
                }
            } else {
                document.getElementById('news-title').innerText = "Новость не найдена";
                document.getElementById('news-content-box').innerHTML = "<p>Запрашиваемая новость была удалена или не существует.</p>";
            }
        } catch (e) {
            console.error(e);
        }
    } else if (window.location.pathname.includes('events.html')) {
        try {
            const doc = await db.collection("events").doc(id).get();
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('event-title').innerText = data.title;
                document.getElementById('event-status').innerText = data.status || 'ПРЕДСТОЯЩЕЕ';
                document.getElementById('event-content-box').innerHTML = `<p>${escapeHtml(data.text).replace(/\n/g, '<br>')}</p>`;
                if (data.image) {
                    document.getElementById('event-image-container').innerHTML = `<img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.title)}" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px;">`;
                }
            } else {
                document.getElementById('event-title').innerText = "Мероприятие не найдено";
                document.getElementById('event-content-box').innerHTML = "<p>Запрашиваемое мероприятие было удалена или не существует.</p>";
            }
        } catch (e) {
            console.error(e);
        }
    }
}

// ==========================================
// 4. ЗАГРУЗКА КОНТЕНТА САЙТА И СТАТИСТИКИ
// ==========================================
async function loadSiteContent() {
    try {
        const heroDoc = await db.collection("site_content").doc("hero").get();
        if (heroDoc.exists) {
            const data = heroDoc.data();
            if (data.title) document.getElementById('hero-title-text').innerText = data.title;
            if (data.description) document.getElementById('hero-desc-text').innerText = data.description;
        }

        const aboutDoc = await db.collection("site_content").doc("about").get();
        if (aboutDoc.exists) {
            const data = aboutDoc.data();
            if (data.title) document.getElementById('about-title-text').innerText = data.title;
            if (data.p1) document.getElementById('about-p1-text').innerText = data.p1;
            if (data.p2) document.getElementById('about-p2-text').innerText = data.p2;
        }

        const contactsDoc = await db.collection("site_content").doc("contacts").get();
        if (contactsDoc.exists) {
            const data = contactsDoc.data();
            if (data.address) document.getElementById('contact-address-text').innerText = data.address;
            if (data.phone) document.getElementById('contact-phone-text').innerText = data.phone;
            if (data.email) document.getElementById('contact-email-text').innerText = data.email;
            if (data.social) document.getElementById('contact-social-text').innerText = data.social;
        }

        // Устанавливаем фотографию команды из Firebase прямо на фон шапки сайта (hero-section)
        const photoDoc = await db.collection("site_content").doc("team_photo").get();
        if (photoDoc.exists && photoDoc.data().url) {
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                heroSection.style.backgroundImage = `url('${photoDoc.data().url}')`;
            }
        }
    } catch (error) {
        console.error("Ошибка загрузки контента сайта:", error);
    }
}

async function loadStats() {
    for (let i = 1; i <= 3; i++) {
        try {
            const doc = await db.collection("site_content").doc(`stat${i}`).get();
            if (doc.exists) {
                const data = doc.data();
                if (data.num) document.getElementById(`stat${i}-num`).innerText = data.num;
                if (data.label) document.getElementById(`stat${i}-label`).innerText = data.label;
            }
        } catch (e) {
            console.error(e);
        }
    }
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
