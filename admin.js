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
const auth = firebase.auth();

const SECRET_PIN = "1234"; 

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("adminLoginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = document.getElementById("adminEmail").value.trim();
            const password = document.getElementById("adminPassword").value.trim();
            const pin = document.getElementById("adminPin").value.trim();
            const errorEl = document.getElementById("loginError");
            errorEl.innerText = "";

            if (pin !== SECRET_PIN) {
                errorEl.innerText = "Неверный секретный ПИН-код!";
                return;
            }

            try {
                await auth.signInWithEmailAndPassword(email, password);
            } catch (error) {
                errorEl.innerText = "Ошибка входа: " + error.message;
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            auth.signOut();
        });
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("authScreen").style.display = "none";
            document.getElementById("dashboardScreen").style.display = "block";
            loadAdminData();
            loadAdminMembers();
            loadAdminNews();
            loadAdminEvents();
        } else {
            document.getElementById("authScreen").style.display = "flex";
            document.getElementById("dashboardScreen").style.display = "none";
        }
    });

    const saveGeneralBtn = document.getElementById("saveGeneralBtn");
    if (saveGeneralBtn) saveGeneralBtn.addEventListener("click", saveGeneralContent);

    const saveScheduleBtn = document.getElementById("saveScheduleBtn");
    if (saveScheduleBtn) saveScheduleBtn.addEventListener("click", saveSchedule);

    const saveStudentBtn = document.getElementById("saveStudentBtn");
    if (saveStudentBtn) saveStudentBtn.addEventListener("click", saveStudent);

    const saveMemberBtn = document.getElementById("saveMemberBtn");
    if (saveMemberBtn) saveMemberBtn.addEventListener("click", saveMember);

    const saveNewsBtn = document.getElementById("saveNewsBtn");
    if (saveNewsBtn) saveNewsBtn.addEventListener("click", saveNews);

    const saveEventBtn = document.getElementById("saveEventBtn");
    if (saveEventBtn) saveEventBtn.addEventListener("click", saveEvent);
});

async function loadAdminData() {
    try {
        const aboutDoc = await db.collection("site_content").doc("about").get();
        if (aboutDoc.exists) {
            const data = aboutDoc.data();
            document.getElementById("editAboutTitle").value = data.title || "";
            document.getElementById("editAboutP1").value = data.p1 || "";
            document.getElementById("editAboutP2").value = data.p2 || "";
        }

        const contactsDoc = await db.collection("site_content").doc("contacts").get();
        if (contactsDoc.exists) {
            const data = contactsDoc.data();
            document.getElementById("editAddress").value = data.address || "";
            document.getElementById("editPhone").value = data.phone || "";
            document.getElementById("editEmail").value = data.email || "";
        }
    } catch (e) {
        console.error("Ошибка загрузки данных админки:", e);
    }
}

async function saveGeneralContent() {
    try {
        await db.collection("site_content").doc("about").set({
            title: document.getElementById("editAboutTitle").value,
            p1: document.getElementById("editAboutP1").value,
            p2: document.getElementById("editAboutP2").value
        }, { merge: true });

        await db.collection("site_content").doc("contacts").set({
            address: document.getElementById("editAddress").value,
            phone: document.getElementById("editPhone").value,
            email: document.getElementById("editEmail").value
        }, { merge: true });

        alert("Изменения успешно сохранены!");
    } catch (e) {
        alert("Ошибка сохранения: " + e.message);
    }
}

async function saveSchedule() {
    const day = document.getElementById("scheduleDayInput").value.trim();
    const time = document.getElementById("scheduleTimeInput").value.trim();
    const desc = document.getElementById("scheduleDescInput").value.trim();

    if (!day || !time) {
        alert("Заполните день недели и время тренировки!");
        return;
    }

    try {
        await db.collection("schedules").add({
            day,
            time,
            desc,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Расписание успешно добавлено!");
        document.getElementById("scheduleDayInput").value = "";
        document.getElementById("scheduleTimeInput").value = "";
        document.getElementById("scheduleDescInput").value = "";
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}

// Вспомогательная функция для конвертации файла в картинку
function convertFileToBase64(fileInputId) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput || fileInput.files.length === 0) {
            resolve("");
            return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

async function saveStudent() {
    const name = document.getElementById("studentNameInput").value.trim();
    const role = document.getElementById("studentRoleInput").value.trim();
    const description = document.getElementById("studentDescInput").value.trim();

    if (!name || !role) {
        alert("Заполните ФИО и достижение учащегося!");
        return;
    }

    try {
        const image = await convertFileToBase64("studentImgFile");
        await db.collection("students").add({
            name,
            role,
            image,
            description,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Учащийся успешно добавлен!");
        document.getElementById("studentNameInput").value = "";
        document.getElementById("studentRoleInput").value = "";
        document.getElementById("studentImgFile").value = "";
        document.getElementById("studentDescInput").value = "";
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}

async function saveMember() {
    const name = document.getElementById("memberNameInput").value.trim();
    const role = document.getElementById("memberRoleInput").value.trim();
    const description = document.getElementById("memberDescInput").value.trim();

    if (!name || !role || !description) {
        alert("Заполните основные поля для участника/тренера!");
        return;
    }

    try {
        const image = await convertFileToBase64("memberImgFile");
        await db.collection("members").add({
            name,
            role,
            image,
            description,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Участник/тренер успешно добавлен!");
        document.getElementById("memberNameInput").value = "";
        document.getElementById("memberRoleInput").value = "";
        document.getElementById("memberImgFile").value = "";
        document.getElementById("memberDescInput").value = "";
        loadAdminMembers(); // Обновляем список в админке
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}

async function saveNews() {
    const title = document.getElementById("newsTitleInput").value.trim();
    const text = document.getElementById("newsDescInput").value.trim();

    if (!title || !text) {
        alert("Заполните заголовок и текст новости!");
        return;
    }

    try {
        const image = await convertFileToBase64("newsImgFile");
        await db.collection("news").add({
            title,
            text,
            image,
            tag: "НОВОСТИ",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Новость успешно опубликована!");
        document.getElementById("newsTitleInput").value = "";
        document.getElementById("newsDescInput").value = "";
        document.getElementById("newsImgFile").value = "";
        loadAdminNews(); // Обновляем список в админке
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}

async function saveEvent() {
    const title = document.getElementById("eventTitleInput").value.trim();
    const status = document.getElementById("eventDateInput").value.trim();
    const text = document.getElementById("eventDescInput").value.trim();

    if (!title || !text) {
        alert("Заполните название и описание мероприятия!");
        return;
    }

    try {
        await db.collection("events").add({
            title,
            status: status || "ПРЕДСТОЯЩЕЕ",
            text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Мероприятие успешно добавлено!");
        document.getElementById("eventTitleInput").value = "";
        document.getElementById("eventDateInput").value = "";
        document.getElementById("eventDescInput").value = "";
        loadAdminEvents(); // Обновляем список в админке
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}

// --- УПРАВЛЕНИЕ СПИСКАМИ И УДАЛЕНИЕ ИЗ АДМИНКИ ---

async function loadAdminMembers() {
    let container = document.getElementById("admin-members-list");
    if (!container) return;
    try {
        const snapshot = await db.collection("members").orderBy("createdAt", "desc").get();
        container.innerHTML = snapshot.empty ? "<p style='color:#777; font-size:13px;'>Нет участников</p>" : "";
        snapshot.forEach(doc => {
            const data = doc.data();
            container.innerHTML += `
                <div id="admin-card-${doc.id}" style="display: flex; justify-content: space-between; align-items: center; background: #222; padding: 10px 15px; border-radius: 6px; border: 1px solid #333; margin-bottom: 8px;">
                    <span style="font-size: 14px;">${data.name} <b style="color: var(--orange); font-size: 12px;">(${data.role})</b></span>
                    <button onclick="deleteAdminItem('members', '${doc.id}')" style="background: #ff3333; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Удалить</button>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

async function loadAdminNews() {
    let container = document.getElementById("admin-news-list");
    if (!container) return;
    try {
        const snapshot = await db.collection("news").orderBy("createdAt", "desc").get();
        container.innerHTML = snapshot.empty ? "<p style='color:#777; font-size:13px;'>Нет новостей</p>" : "";
        snapshot.forEach(doc => {
            const data = doc.data();
            container.innerHTML += `
                <div id="admin-card-${doc.id}" style="display: flex; justify-content: space-between; align-items: center; background: #222; padding: 10px 15px; border-radius: 6px; border: 1px solid #333; margin-bottom: 8px;">
                    <span style="font-size: 14px; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${data.title}</span>
                    <button onclick="deleteAdminItem('news', '${doc.id}')" style="background: #ff3333; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Удалить</button>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

async function loadAdminEvents() {
    let container = document.getElementById("admin-events-list");
    if (!container) return;
    try {
        const snapshot = await db.collection("events").orderBy("createdAt", "desc").get();
        container.innerHTML = snapshot.empty ? "<p style='color:#777; font-size:13px;'>Нет мероприятий</p>" : "";
        snapshot.forEach(doc => {
            const data = doc.data();
            container.innerHTML += `
                <div id="admin-card-${doc.id}" style="display: flex; justify-content: space-between; align-items: center; background: #222; padding: 10px 15px; border-radius: 6px; border: 1px solid #333; margin-bottom: 8px;">
                    <span style="font-size: 14px;">${data.title}</span>
                    <button onclick="deleteAdminItem('events', '${doc.id}')" style="background: #ff3333; color: #fff; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Удалить</button>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

async function deleteAdminItem(collectionName, docId) {
    if (confirm("Вы действительно хотите удалить этот элемент?")) {
        try {
            await db.collection(collectionName).doc(docId).delete();
            const el = document.getElementById(`admin-card-${docId}`);
            if (el) el.remove();
            alert("Успешно удалено!");
        } catch (error) {
            console.error("Ошибка удаления: ", error);
            alert("Не удалось удалить элемент.");
        }
    }
}
