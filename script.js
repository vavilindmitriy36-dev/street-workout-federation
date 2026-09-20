/*==========================================================================
   STREET WORKOUT FEDERATION - CORE & ADMIN SCRIPT
   ========================================================================== */

// ==================== 1. FIREBASE CONFIG & INITIALIZATION ====================
const firebaseConfig = {
    apiKey: "AIzaSyAbIUmK6OS7Sd5jcDygCtxMgXi_Tznc56o",
    authDomain: "street-workout-federation.firebaseapp.com",
    projectId: "street-workout-federation",
    storageBucket: "street-workout-federation.firebasestorage.app",
    messagingSenderId: "281767473596",
    appId: "1:281767473596:web:71c290af7a5fac1472fbb9",
    measurementId: "G-ZEZBRRHKHJ"
};

// Инициализация Firebase SDK
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;


// ==================== 2. АВТОРИЗАЦИЯ И РЕЖИМ АДМИНИСТРАТОРА ====================
if (auth) {
    auth.onAuthStateChanged((user) => {
        const adminBarIn = document.getElementById('admin-logged-in');
        const adminBarOut = document.getElementById('admin-logged-out');

        if (user) {
            // Режим админа активен
            if (adminBarIn) adminBarIn.style.display = 'block';
            if (adminBarOut) adminBarOut.style.display = 'none';
            document.body.classList.add('is-admin');
        } else {
            // Обычный пользователь
            if (adminBarIn) adminBarIn.style.display = 'none';
            if (adminBarOut) adminBarOut.style.display = 'block';
            document.body.classList.remove('is-admin');
        }
        
        // Перезагрузка динамических блоков при смене статуса
        loadNews();
        loadEvents();
    });
}

function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    const errEl = document.getElementById('login-error');
    if (modal) modal.style.display = 'none';
    if (errEl) errEl.style.display = 'none';
}

const loginForm = document.getElementById('admin-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        if (auth) {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    closeLoginModal();
                    alert('Вы успешно вошли в режим администратора!');
                })
                .catch((error) => {
                    const errEl = document.getElementById('login-error');
                    if (errEl) {
                        errEl.textContent = 'Ошибка входа: ' + error.message;
                        errEl.style.display = 'block';
                    }
                });
        }
    });
}

function adminLogout() {
    if (auth) {
        auth.signOut().then(() => alert('Вы вышли из режима администратора'));
    }
}


// ==================== 3. РЕДАКТИРОВАНИЕ ТЕКСТОВЫХ БЛОКОВ ====================
function editDocText(docName, fieldKey, subField, elementId) {
    const currentElem = document.getElementById(elementId);
    const oldText = currentElem ? currentElem.innerText.trim() : '';
    
    const newText = prompt('Введите новый текст:', oldText);
    
    if (newText !== null && newText.trim() !== '' && db) {
        const docRef = db.collection('site_content').doc(docName);
        
        docRef.set({
            [fieldKey]: {
                [subField]: newText.trim()
            }
        }, { merge: true })
        .then(() => {
            if (currentElem) currentElem.innerText = newText.trim();
            alert('Изменения успешно сохранены!');
        })
        .catch(err => alert('Ошибка при сохранении: ' + err.message));
    }
}

function loadSiteContent() {
    if (!db) return;

    // Секция Hero
    db.collection('site_content').doc('hero').get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.hero && data.hero.title && document.getElementById('hero-title-text')) {
                document.getElementById('hero-title-text').innerText = data.hero.title;
            }
            if (data.hero && data.hero.description && document.getElementById('hero-desc-text')) {
                document.getElementById('hero-desc-text').innerText = data.hero.description;
            }
        }
    });

    // Секция About
    db.collection('site_content').doc('about').get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.about && data.about.title && document.getElementById('about-title-text')) {
                document.getElementById('about-title-text').innerText = data.about.title;
            }
            if (data.about && data.about.p1 && document.getElementById('about-p1-text')) {
                document.getElementById('about-p1-text').innerText = data.about.p1;
            }
            if (data.about && data.about.p2 && document.getElementById('about-p2-text')) {
                document.getElementById('about-p2-text').innerText = data.about.p2;
            }
        }
    });

    // Секция Contacts
    db.collection('site_content').doc('contacts').get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.contacts && data.contacts.address && document.getElementById('contact-address-text')) {
                document.getElementById('contact-address-text').innerText = data.contacts.address;
            }
            if (data.contacts && data.contacts.phone && document.getElementById('contact-phone-text')) {
                document.getElementById('contact-phone-text').innerText = data.contacts.phone;
            }
            if (data.contacts && data.contacts.email && document.getElementById('contact-email-text')) {
                document.getElementById('contact-email-text').innerText = data.contacts.email;
            }
            if (data.contacts && data.contacts.social && document.getElementById('contact-social-text')) {
                document.getElementById('contact-social-text').innerText = data.contacts.social;
            }
        }
    });
}


// ==================== 4. РЕДАКТИРОВАНИЕ СТАТИСТИКИ ====================
function editStat(statKey, numId, labelId) {
    const numEl = document.getElementById(numId);
    const labelEl = document.getElementById(labelId);

    const oldNum = numEl ? numEl.innerText.trim() : '';
    const oldLabel = labelEl ? labelEl.innerText.trim() : '';

    const newNum = prompt('Новое числовое значение (например: 15+):', oldNum);
    const newLabel = prompt('Новая подпись:', oldLabel);

    if (newNum !== null && newLabel !== null && db) {
        db.collection('site_content').doc('stats').set({
            [statKey]: { num: newNum.trim(), label: newLabel.trim() }
        }, { merge: true }).then(() => {
            if (numEl) numEl.innerText = newNum.trim();
            if (labelEl) labelEl.innerText = newLabel.trim();
            alert('Статистика обновлена!');
        });
    }
}


// ==================== 5. УПРАВЛЕНИЕ НОВОСТЯМИ (БАННЕРНЫЙ СТИЛЬ) ====================
function loadNews() {
    if (!db) return;

    db.collection('news').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const container = document.getElementById('news-container');
        if (!container) return;
        
        container.innerHTML = '';

        if (snapshot.empty) {
            container.innerHTML = '<p class="section-description">Новостей пока нет.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const item = doc.data();
            const id = doc.id;
            
            const card = document.createElement('article');
            
            // Проверяем, есть ли картинка. Если нет — добавляем класс дефолтной заглушки
            const hasImage = item.image && item.image.trim() !== '';
            card.className = hasImage ? 'banner-card' : 'banner-card default-bg';
            
            if (hasImage) {
                card.style.backgroundImage = `url('${item.image}')`;
            }

            // Рендерим HTML карточки-баннера
            card.innerHTML = `
                <div class="banner-badge">${item.tag || 'НОВОСТИ'}</div>
                
                ${!hasImage ? `
                    <div class="banner-logo-placeholder">
                        <span>🇰🇿</span>
                    </div>
                ` : ''}

                <div class="banner-content" onclick="window.location.href='news.html?id=${id}'">
                    <h3 class="banner-title">${item.title}</h3>
                    <div class="banner-footer">
                        <span class="banner-meta">Читать новость</span>
                        <div class="banner-arrow">→</div>
                    </div>
                </div>
                
                <div class="admin-only news-admin-actions" style="position: absolute; bottom: 16px; left: 16px; z-index: 10;">
                    <button class="edit-btn" onclick="event.stopPropagation(); editNews('${id}', '${escapeHtml(item.title)}', '${escapeHtml(item.text)}', '${escapeHtml(item.tag || '')}', '${escapeHtml(item.image || '')}')">✏️ Изменить</button>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteNews('${id}')">🗑️ Удалить</button>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

function addNewsItem() {
    const title = prompt('Заголовок новости:');
    const text = prompt('Текст новости:');
    const tag = prompt('Тег (например: НОВОСТИ, СОРЕВНОВАНИЯ):', 'НОВОСТИ');
    const image = prompt('Ссылка на картинку (оставьте пустым для фирменной заглушки):', '');

    if (title && text && db) {
        db.collection('news').add({
            title: title.trim(),
            text: text.trim(),
            tag: tag ? tag.trim() : 'НОВОСТИ',
            image: image ? image.trim() : '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => alert('Новость успешно добавлена!'));
    }
}

function editNews(id, oldTitle, oldText, oldTag, oldImage) {
    const newTitle = prompt('Новый заголовок:', oldTitle);
    const newText = prompt('Новый текст:', oldText);
    const newTag = prompt('Новый тег:', oldTag);
    const newImage = prompt('Новая ссылка на картинку:', oldImage);

    if (newTitle && newText && db) {
        db.collection('news').doc(id).update({
            title: newTitle.trim(),
            text: newText.trim(),
            tag: newTag ? newTag.trim() : 'НОВОСТИ',
            image: newImage ? newImage.trim() : ''
        });
    }
}

function deleteNews(id) {
    if (confirm('Удалить эту новость?') && db) {
        db.collection('news').doc(id).delete();
    }
}


// ==================== 6. УПРАВЛЕНИЕ МЕРОПРИЯТИЯМИ (БАННЕРНЫЙ СТИЛЬ) ====================
function loadEvents() {
    if (!db) return;

    db.collection('events').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const container = document.getElementById('events-container');
        if (!container) return;

        container.innerHTML = '';

        if (snapshot.empty) {
            container.innerHTML = '<p class="section-description">Предстоящих мероприятий нет.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const item = doc.data();
            const id = doc.id;

            const card = document.createElement('article');
            
            const hasImage = item.image && item.image.trim() !== '';
            card.className = hasImage ? 'banner-card' : 'banner-card default-bg';
            
            if (hasImage) {
                card.style.backgroundImage = `url('${item.image}')`;
            }

            card.innerHTML = `
                <div class="banner-badge">${item.status || 'ПРЕДСТОЯЩЕЕ'}</div>
                
                ${!hasImage ? `
                    <div class="banner-logo-placeholder">
                        <span>🏆</span>
                    </div>
                ` : ''}

                <div class="banner-content" onclick="window.location.href='event.html?id=${id}'">
                    <h3 class="banner-title">${item.title}</h3>
                    <div class="banner-footer">
                        <span class="banner-meta">Подробнее о турнире</span>
                        <div class="banner-arrow">→</div>
                    </div>
                </div>
                
                <div class="admin-only news-admin-actions" style="position: absolute; bottom: 16px; left: 16px; z-index: 10;">
                    <button class="edit-btn" onclick="event.stopPropagation(); editEvent('${id}', '${escapeHtml(item.title)}', '${escapeHtml(item.text)}', '${escapeHtml(item.status || '')}', '${escapeHtml(item.image || '')}')">✏️ Изменить</button>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteEvent('${id}')">🗑️ Удалить</button>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

function addEventItem() {
    const title = prompt('Название мероприятия:');
    const text = prompt('Описание мероприятия:');
    const status = prompt('Статус (например: ПРЕДСТОЯЩЕЕ, ТУРНИР):', 'ПРЕДСТОЯЩЕЕ');
    const image = prompt('Ссылка на картинку (оставьте пустым для фирменной заглушки):', '');

    if (title && text && db) {
        db.collection('events').add({
            title: title.trim(),
            text: text.trim(),
            status: status ? status.trim() : 'ПРЕДСТОЯЩЕЕ',
            image: image ? image.trim() : '',
            icon: '🏆',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => alert('Мероприятие успешно добавлено!'));
    }
}

function editEvent(id, oldTitle, oldText, oldStatus, oldImage) {
    const newTitle = prompt('Новое название:', oldTitle);
    const newText = prompt('Новый описание:', oldText);
    const newStatus = prompt('Новый статус:', oldStatus);
    const newImage = prompt('Новая ссылка на картинку:', oldImage);

    if (newTitle && newText && db) {
        db.collection('events').doc(id).update({
            title: newTitle.trim(),
            text: newText.trim(),
            status: newStatus ? newStatus.trim() : 'ПРЕДСТОЯЩЕЕ',
            image: newImage ? newImage.trim() : ''
        });
    }
}

function deleteEvent(id) {
    if (confirm('Удалить это мероприятие?') && db) {
        db.collection('events').doc(id).delete();
    }
}


// ==================== 7. ИНТЕРАКТИВНОСТЬ И АВТОЗАГРУЗКА ДЕТАЛЕЙ ====================
document.addEventListener("DOMContentLoaded", () => {
    
    // Загрузка контента из базы данных на главной
    loadSiteContent();

    // Автоматическая загрузка конкретной новости на странице news.html
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    if (newsId && db) {
        db.collection('news').doc(newsId).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                const titleEl = document.getElementById('news-title');
                const tagEl = document.getElementById('news-tag');
                const contentBox = document.getElementById('news-content-box');

                if (titleEl) titleEl.innerText = data.title;
                if (tagEl) tagEl.innerText = data.tag || 'НОВОСТИ';
                if (contentBox) {
                    contentBox.innerHTML = `<p style="color: #ccc; line-height: 1.7; font-size: 16px;">${data.text}</p>`;
                }
            } else {
                const titleEl = document.getElementById('news-title');
                if (titleEl) titleEl.innerText = 'Новость не найдена';
            }
        }).catch(err => console.error("Ошибка загрузки новости:", err));
    }

    // Автоматическая загрузка конкретного мероприятия на странице event.html
    const eventId = urlParams.get('id');
    if (eventId && db) {
        db.collection('events').doc(eventId).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                const titleEl = document.getElementById('event-title');
                const statusEl = document.getElementById('event-status');
                const contentBox = document.getElementById('event-content-box');

                if (titleEl) titleEl.innerText = data.title;
                if (statusEl) statusEl.innerText = data.status || 'ПРЕДСТОЯЩЕЕ';
                if (contentBox) {
                    contentBox.innerHTML = `<p style="color: #ccc; line-height: 1.7; font-size: 16px;">${data.text}</p>`;
                }
            } else {
                const titleEl = document.getElementById('event-title');
                if (titleEl) titleEl.innerText = 'Мероприятие не найдено';
            }
        }).catch(err => console.error("Ошибка загрузки мероприятия:", err));
    }

    // Плавный скролл по навигационным ссылкам
    const navLinks = document.querySelectorAll('nav a[href^="#"], .footer-links a[href^="#"], .hero-button[href^="#"], .card a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
   
    // Обработка формы «Задать вопрос» (Formspree + Ajax)
    const questionForm = document.querySelector(".question-form");

    if (questionForm) {
        questionForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const nameInput = questionForm.querySelector("[name='name']");
            const emailInput = questionForm.querySelector("[name='email']");
            const questionInput = questionForm.querySelector("[name='message'], [name='question'], #question");

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const question = questionInput ? questionInput.value.trim() : "";

            if (name === "" || email === "" || question === "") {
                alert("Пожалуйста, заполните все обязательные поля.");
                return;
            }

            const formData = new FormData(questionForm);
            const submitBtn = questionForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            fetch(questionForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    let successMsg = document.querySelector('.question-success');
                    if (!successMsg) {
                        successMsg = document.createElement('div');
                        successMsg.className = 'question-success';
                        questionForm.appendChild(successMsg);
                    }
                    successMsg.textContent = 'Ваше сообщение успешно отправлено! Мы ответим вам в ближайшее время.';
                    questionForm.reset();
                } else {
          
