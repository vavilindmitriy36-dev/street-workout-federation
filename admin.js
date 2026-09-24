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
        } else {
            document.getElementById("authScreen").style.display = "flex";
            document.getElementById("dashboardScreen").style.display = "none";
        }
    });

    // Кнопки сохранения
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

// Сохранение расписания тренировок в коллекцию "schedules"
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

// Сохранение учащегося в коллекцию "students"
async function saveStudent() {
    const name = document.getElementById("studentNameInput").value.trim();
    const role = document.getElementById("studentRoleInput").value.trim();
    const image = document.getElementById("studentImgInput").value.trim();
    const description = document.getElementById("studentDescInput").value.trim();

    if (!name || !role) {
        alert("Заполните ФИО и достижение учащегося!");
        return;
    }

    try {
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
        document.getElementById("studentImgInput").value = "";
        document.getElementById("studentDescInput").value = "";
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}

async function saveMember() {
    const name = document.getElementById("memberNameInput").value.trim();
    const role = document.getElementById("memberRoleInput").value.trim();
    const image = document.getElementById("memberImgInput").value.trim();
    const description = document.getElementById("memberDescInput").value.trim();

    if (!name || !role || !image || !description) {
        alert("Заполните все поля для участника/тренера!");
        return;
    }

    try {
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
        document.getElementById("memberImgInput").value = "";
        document.getElementById("memberDescInput").value = "";
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}

async function saveNews() {
    const title = document.getElementById("newsTitleInput").value.trim();
    const text = document.getElementById("newsDescInput").value.trim();
    const image = document.getElementById("newsImgInput").value.trim();

    if (!title || !text) {
        alert("Заполните заголовок и текст новости!");
        return;
    }

    try {
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
        document.getElementById("newsImgInput").value = "";
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
    } catch (e) {
        alert("Ошибка: " + e.message);
    }
}
