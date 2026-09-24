const firebaseConfig = {
    apiKey: "AIzaSyAbIUmK6OS7Sd5jcDygCtxMgXi_Tznc56o",
    authDomain: "street-workout-federation.firebaseapp.com",
    projectId: "street-workout-federation",
    storageBucket: "street-workout-federation.firebasestorage.app",
    messagingSenderId: "281767473596",
    appId: "1:281767473596:web:e4c311c1d81b2da5f3844f",
    measurementId: "G-DQJDKLMR9"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    loadDynamicContent();
});

async function loadDynamicContent() {
    try {
        // 1. Загрузка контента для секции "О нас" и "Контакты"
        const aboutDoc = await db.collection("site_content").doc("about").get();
        if (aboutDoc.exists) {
            const data = aboutDoc.data();
            const aboutWrapper = document.querySelector(".about-text-wrapper");
            if (aboutWrapper && data.p1) {
                aboutWrapper.innerHTML = `
                    <h3 style="color: var(--orange); margin-bottom: 10px;">${data.title || ''}</h3>
                    <p style="margin-bottom: 15px;">${data.p1}</p>
                    <p>${data.p2 || ''}</p>
                `;
            }
        }

        const contactsDoc = await db.collection("site_content").doc("contacts").get();
        if (contactsDoc.exists) {
            const data = contactsDoc.data();
            const phoneEl = document.querySelector(".contact-list li:nth-child(1) span");
            const emailEl = document.querySelector(".contact-list li:nth-child(2) span");
            if (phoneEl && data.phone) phoneEl.innerText = data.phone;
            if (emailEl && data.email) emailEl.innerText = data.email;
        }

        // 2. Загрузка участников и тренеров из коллекции "members"
        const membersContainer = document.getElementById("members-container");
        if (membersContainer) {
            const membersSnapshot = await db.collection("members").orderBy("createdAt", "desc").get();
            if (!membersSnapshot.empty) {
                membersContainer.innerHTML = "";
                membersSnapshot.forEach(doc => {
                    const data = doc.data();
                    membersContainer.innerHTML += `
                        <div class="member-card">
                            <div class="member-img-wrap">
                                <img src="${data.image || ''}" alt="${data.name}" onerror="this.src='https://via.placeholder.com/300x300?text=Workout'">
                            </div>
                            <div class="member-content">
                                <h3 class="member-title">${data.name}</h3>
                                <div class="member-role">${data.role}</div>
                                <p class="member-desc">${data.description}</p>
                            </div>
                        </div>
                    `;
                });
            }
        }

        // 3. Загрузка мероприятий из коллекции "events"
        const eventsContainer = document.getElementById("events-container");
        if (eventsContainer) {
            const eventsSnapshot = await db.collection("events").orderBy("createdAt", "desc").get();
            if (!eventsSnapshot.empty) {
                eventsContainer.innerHTML = "";
                eventsSnapshot.forEach(doc => {
                    const data = doc.data();
                    eventsContainer.innerHTML += `
                        <div class="event-card">
                            <span class="member-role">${data.status || 'ПРЕДСТОЯЩЕЕ'}</span>
                            <h3 class="member-title" style="margin-top: 5px;">${data.title}</h3>
                            <p class="member-desc" style="margin-top: 8px;">${data.text}</p>
                        </div>
                    `;
                });
            }
        }

        // 4. Загрузка новостей из коллекции "news"
        const newsContainer = document.getElementById("news-container");
        if (newsContainer) {
            const newsSnapshot = await db.collection("news").orderBy("createdAt", "desc").get();
            if (!newsSnapshot.empty) {
                newsContainer.innerHTML = "";
                newsSnapshot.forEach(doc => {
                    const data = doc.data();
                    newsContainer.innerHTML += `
                        <div class="news-card">
                            ${data.image ? `<div class="member-img-wrap" style="height: 180px; margin-bottom: 15px; border-radius: 4px;"><img src="${data.image}" alt="News"></div>` : ''}
                            <span class="member-role">${data.tag || 'НОВОСТИ'}</span>
                            <h3 class="member-title" style="margin-top: 5px;">${data.title}</h3>
                            <p class="member-desc" style="margin-top: 8px;">${data.text}</p>
                        </div>
                    `;
                });
            }
        }

    } catch (e) {
        console.error("Ошибка при загрузке данных с Firestore:", e);
    }
}
