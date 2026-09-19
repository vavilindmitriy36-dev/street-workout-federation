const form = document.querySelector(".question-form");

if (form) {
    form.addEventListener("submit", function(event) {

        const name = document.querySelector("#name").value.trim();
        const email = document.querySelector("#email") ? document.querySelector("#email").value.trim() : "";
        const question = document.querySelector("#question").value.trim();

        if (name === "" || email === "" || question === "") {
            event.preventDefault();

            alert("Пожалуйста, заполните все поля.");
        }

    });
}
