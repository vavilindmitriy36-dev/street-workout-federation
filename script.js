// Находим форму вопросов
const form = document.querySelector(".question-form");

if (form) {
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const nameInput = document.querySelector("#name");
        const questionInput = document.querySelector("#question");

        const name = nameInput.value.trim();
        const question = questionInput.value.trim();

        // Проверка заполнения полей
        if (name === "" || question === "") {
            alert("Пожалуйста, заполните все поля.");
            return;
        }

        // Удаляем старое сообщение об успехе, если оно уже было выведено
        const oldMessage = form.querySelector(".question-success");
        if (oldMessage) {
            oldMessage.remove();
        }

        // Создаем новое сообщение об успехе
        const message = document.createElement("p");
        message.textContent = "Спасибо, " + name + "! Ваш вопрос отправлен.";
        message.className = "question-success";

        // Добавляем сообщение в форму
        form.appendChild(message);

        // Очищаем поля ввода
        form.reset();
    });
}
