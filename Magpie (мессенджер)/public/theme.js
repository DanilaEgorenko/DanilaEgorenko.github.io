// Тёмная тема
var box = document.querySelector('#box');
box.addEventListener('click', changeTheme);
function changeTheme() {
    if (box.checked) {
        localStorage.setItem('theme', 'dark');

        document.documentElement.style.setProperty('--main-bg-color', '#222226');
        document.documentElement.style.setProperty('--color', '#bbb');
        document.documentElement.style.setProperty('--header-bg-color', 'rgba(0, 0, 0, 0.8)');
        document.documentElement.style.setProperty('--header-color', 'white');
        document.documentElement.style.setProperty('--activity-bg-color', '#081d14');
        document.documentElement.style.setProperty('--user-bg-color', '#251511');
        document.documentElement.style.setProperty('--invert', '60%');
    } else {
        localStorage.setItem('theme', 'light');

        document.documentElement.style.setProperty('--main-bg-color', 'white');
        document.documentElement.style.setProperty('--color', 'black');
        document.documentElement.style.setProperty('--header-bg-color', 'rgba(0, 0, 0, 0.3)');
        document.documentElement.style.setProperty('--header-color', 'black');
        document.documentElement.style.setProperty('--activity-bg-color', 'rgba(0, 255, 0, 0.3)');
        document.documentElement.style.setProperty('--user-bg-color', 'rgba(255, 0, 0, 0.3)');
        document.documentElement.style.setProperty('--invert', '0%');
    }
}
if (localStorage.getItem('theme') == 'dark') {
    box.checked = true;
    changeTheme();
} else {
    box.checked = false;
    changeTheme();
}