window.addEventListener("load", () => {
    let button = document.querySelector(".ref")
    let ref = document.querySelector(".ref_active")
    button.addEventListener("click", () => {
        button.classList.toggle("on")
        ref.classList.toggle("on")
    })
    ref.addEventListener("click", (e) => {
        if (!e.target.closest(".rect") && button.classList.contains("on")) {
            button.classList.toggle("on")
            ref.classList.toggle("on")
        }
    })
})