let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    if (!sessionStorage.getItem('hidePWA')) document.querySelector(".install").style.display = "flex";
    deferredPrompt = e;
    setTimeout(() => document.querySelector(".install").classList.add("disp"), 100);

    document.querySelector("#installPWA").addEventListener('click', async () => {
        hideUI();
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
    });
    document.querySelector("#continuePWA").addEventListener('click', async () => {
        sessionStorage.setItem('hidePWA', true);
        hideUI();
    });
    document.onclick = function (e) {
        if (!e.target.classList.contains("install")) {
            sessionStorage.setItem('hidePWA', true);
            hideUI();
        }
    }
    window.onappinstalled = function () {
        hideUI();
    };
});
window.addEventListener("load", () => {
    document.head.innerHTML += `<link rel="manifest" href="index.webmanifest">
    <meta name="theme-color" content="#1e1e1e">`;
    document.body.innerHTML += `<div class="install">
    <div class="imgContainerPWA"></div>
    <div class="contain">
        <button id="continuePWA">Не сейчас</button>
        <button id="installPWA">Установить</button>
    </div>
</div>`;
    document.head.innerHTML += `<style>
    body {
        overflow: hidden;
    }
    .install {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        max-width: 100%;
        border: none;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        background-color: white;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        display: none;
        z-index: 10000;
        transition: .3s ease;
        transition-delay: .2s;
        transform: translateY(200px);
        box-shadow: rgb(14 30 37 / 12%) 0px 2px 4px 0px, rgb(14 30 37 / 32%) 0px 2px 16px 0px;
    }
    .disp {
        transform: translateY(0);
    }
    @media (min-width: 768px) {
        .install {
            left: calc(50% - 180px);
            max-width: 360px;
        }
    }
    @media (max-width: 767px) {
        .install {
            left: 10px;
            max-width: calc(100% - 20px);
        }
    }
    button {
        border-radius: 20px;
        padding: 10px;
        margin: 5px;
        appearance: none;
        border: 0;
        outline: 0;
        color: #fff;
        cursor: pointer;
        transition: .3s;
        width: 120px;
    }
    .imgContainerPWA {
        height: 60px;
        width: 60px;
        padding: 5px;
        background-image: url(img/icon.png);
        background-repeat: no-repeat;
        background-size: 70%;
        background-position: center;
        background-color: white;
        position: relative;
        top: -20px;
        border-radius: 20px;
        box-shadow: rgb(0 0 0 / 30%) 0px 1px 10px, rgb(0 0 0 / 30%) 0px 1px 10px;
    }
    #installPWA {
        background-color: #007aff;
    }
    #continuePWA {
        background-color: #1e1e1e;
    }
    .contain {
        position: relative;
        top: -10px;
    }
    </style>`;

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
});

function hideUI() {
    document.querySelector(".install").classList.remove("disp");
    document.querySelector("body").style.overflow = "auto";
    setTimeout(() => document.querySelector(".install").style.display = "none", 300);
}