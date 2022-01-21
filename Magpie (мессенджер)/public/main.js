'use strict';

// Cloud Firestore

function signIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

function signOut() {
  firebase.auth().signOut();
}

// Удаление профиля
function deleteProfile() {
  firebase.auth().currentUser.delete().then(function () {
    showNotification('Аккаунт успешно удалён!');
  }).catch(function (error) {
    console.error('Error delete profile', error);;
    showNotification('Войдите заново, чтобы удалить аккаунт!');
  });
}

function initFirebaseAuth() {
  firebase.auth().onAuthStateChanged(authStateObserver);
}

function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

function getUserName() {
  return firebase.auth().currentUser.displayName;
}
function editName() {
  inputName.style.display = 'block';
  inputName.value = userNameElement.textContent;
  inputName.focus();
  inputName.addEventListener('keyup', buttonView);
}

function buttonView() {
  editNameButton.style.display = 'block';
  editNameButton.addEventListener('click', onNameSubmit);
}

// Изменение имени
function newUserName() {
  firebase.auth().currentUser.updateProfile({
    displayName: inputName.value
  }).then(function () {
    showNotification('Имя успешно обновлено! Войдите в аккаунт заново!');
    inputName.style.display = 'none';
    editNameButton.style.display = 'none';
    updateNameRequest(inputName.value);
    userNameElement.textContent = inputName.value;
  }).catch(function (error) {
    console.error('Error updating new name', error);
  });
}
function onNameSubmit(e) {
  e.preventDefault();
  // Проверка на ввод и "белые" символы сообщения и вход в систему
  if (/\S/.test(inputName.value) && isUserSignedIn()) {
    newUserName(inputName.value);
  };
}
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}
var postCount = 0;
setTimeout(() => { postCount = 0; }, 10000);
function saveMessage(messageText) {
  // Добавьте новую запись сообщения в базу данных
  postCount++;

  if (postCount < 6) {
    return firebase.firestore().collection('messages').add({
      name: getUserName(),
      text: messageText,
      profilePicUrl: getProfilePicUrl(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function (error) {
      console.error('Error writing new message to database', error);
    });
  } else {
    removespam();
    messageFormElement.style.display = 'none';
    imageFormElement.style.display = 'none';
    showNotification('Перестаньте злоупотреблять отправкой сообщений!');
  }
}
function removespam() {
  var queryRemove = firebase.firestore().collection('messages').orderBy('timestamp', 'desc').limit(5).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      firebase.firestore().collection('messages').doc(doc.id.toString()).delete().then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });
    })
  }).catch((error) => {
    console.error("Error removing document: ", error);
  });
}

// Лимит сообщений
var inc = 1;
var messageListElement = document.getElementById('messages');
var scrollActive;
messageListElement.addEventListener('scroll', () => {
  if (messageListElement.scrollTop < 100 && scrollActive !== true) {
    scrollActive = true;
    setTimeout(() => { scrollActive = false; }, 1500);
    inc += 20
    loadMessages();
  }
})

var inc = 20;

function loadMessages() {
  var query = firebase.firestore()
    .collection('messages')
    .orderBy('timestamp', 'desc')
    .limit(inc);
  // Начинает прислушиваться к запросу.
  query.onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(change.doc.id, message.timestamp, message.name,
          message.text, message.profilePicUrl, message.imageUrl);
      }
    },
      loadElement.classList.toggle('active')
    );
  });
}

function viewChat(root, type, photoChat, nameChat) {
  var query = firebase.firestore()
    .collection(root)
    .orderBy('timestamp', 'desc')
    .limit(1);
  query.onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        if (type == "chat") {
          var timestamp = message.timestamp;
          var name = message.name;
          var text = message.text;
          var photo = message.profilePicUrl;
          var id = change.doc.id;
          displayChat(id, nameChat, photoChat, timestamp, name, text, photo);
        }
        if (type == "channel") {
          var timestamp = message.timestamp;
          var messageText = message.text;
          var id = change.doc.id;
          displayChat(id, nameChat, photoChat, timestamp, messageText);
        }
      }
    });
  });
}

function displayChat(id, nameChat, photoChat, timestamp, messageText, name, text, photo) {
  var div = createAndInsertChat(id, timestamp);

  if (photo) {
    div.querySelector('.activity-pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(photo) + ')';
  }

  div.querySelector('.activity-name').textContent = name;
  div.querySelector('.activity-timestamp').textContent = timeConverter(timestamp);
  var chatElement = div.querySelector('.activity-message');

  if (text || messageText) { // Если сообщение - текст
    chatElement.textContent = text || messageText;
    // Заменяет все разрывы строк на <br>
    chatElement.innerHTML = chatElement.innerHTML.replace(/\n/g, '<br>');
  }
}

function saveImageMessage(file) {
  // 1 - Мы добавляем сообщение со значком загрузки, которое будет обновляться вместе с общим изображением
  firebase.firestore().collection('messages').add({
    name: getUserName(),
    imageUrl: LOADING_IMAGE_URL,
    profilePicUrl: getProfilePicUrl(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function (messageRef) {
    // 2 - Загрузка изображения в облачное хранилище
    var filePath = firebase.auth().currentUser.uid + '/' + messageRef.id + '/' + file.name;
    return firebase.storage().ref(filePath).put(file).then(function (fileSnapshot) {
      // 3 - Создание общедоступного URL для файла
      return fileSnapshot.ref.getDownloadURL().then((url) => {
        // 4 - Обновите сообщение чата, указав URL-адрес изображения
        return messageRef.update({
          imageUrl: url,
          storageUri: fileSnapshot.metadata.fullPath
        });
      });
    });
  }).catch(function (error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  });
}

// Сохраняет токен устройства обмена сообщениями в хранилище данных
function saveMessagingDeviceToken() {
  firebase.messaging().getToken().then(function (currentToken) {
    if (currentToken) {
      firebase.firestore().collection('fcmTokens').doc(currentToken)
        .set({ uid: firebase.auth().currentUser.uid });
    } else {
      requestNotificationsPermissions();
    }
  }).catch(function (error) {
    console.error('Unable to get messaging token.', error);
  });
}

// Запрашивает разрешение на показ уведомлений.
function requestNotificationsPermissions() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function () {
    saveMessagingDeviceToken();
  }).catch(function (error) {
    console.error('Unable to get permission to notify.', error);
  });
}

function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
  if (pasteEvent.clipboardData == false) {
    if (typeof (callback) == "function") {
      callback(undefined);
    }
  };

  var items = pasteEvent.clipboardData.items;

  if (items == undefined) {
    if (typeof (callback) == "function") {
      callback(undefined);
    }
  };

  for (var i = 0; i < items.length; i++) {
    // Skip content if not image
    if (items[i].type.indexOf("image") == -1) continue;
    // Retrieve image on clipboard as blob
    var blob = items[i].getAsFile();

    if (typeof (callback) == "function") {
      callback(blob);
    }
  }
}

// Вставка фото через Ctrl + V:

// проверяем, поддерживает ли браузер объект Clipboard
// если нет создаем элемент с атрибутом contenteditable
if (!window.Clipboard) {
  var pasteCatcher = document.createElement("div");

  // Firefox вставляет все изображения в элементы с contenteditable
  pasteCatcher.setAttribute("contenteditable", "");

  pasteCatcher.style.position = "absolute";
  pasteCatcher.style.left = "-3000px";
  document.body.appendChild(pasteCatcher);

  // элемент должен быть в фокусе
  pasteCatcher.focus();
  document.addEventListener("click", function () { pasteCatcher.focus(); });
}
// добавляем обработчик событию
window.addEventListener("paste", pasteHandler);

function pasteHandler(e) {
  // если поддерживается event.clipboardData (Chrome)
  if (e.clipboardData && e.clipboardData.items) {
    // получаем все содержимое буфера
    var items = e.clipboardData.items;
    if (items) {
      // находим изображение
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          // представляем изображение в виде файла
          var file = items[i].getAsFile();
          if (file.size > 5 * 1024 * 1024) {
            showNotification('Изображение не должно превышать 5 МБ!');
            return;
          }
          saveImageMessage(file);
        }
      }
    }
    // для Firefox проверяем элемент с атрибутом contenteditable
  } else {
    setTimeout(checkInput, 1);
  }
}

// Срабатывает, когда файл выбирается с помощью средства выбора мультимедиа
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];
  imageFormElement.reset();

  // Проверка на тип файла
  if (!file.type.match('image.*')) {
    showNotification('Это не изображение!');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Изображение не должно превышать 5 МБ!');
    return;
  }
  saveImageMessage(file);
}

// Срабатывает при отправке формы для отправки нового сообщения
function onMessageFormSubmit(e) {
  // Проверка на ввод "белыx" символов сообщения и вход в систему
  if (/\S/.test(messageInputElement.value)) {
    saveMessage(messageInputElement.value);
    messageListElement.scrollBy(0, messageListElement.scrollTop);
  };
  resetMaterialTextfield(messageInputElement);
  toggleButton();
}

// Срабатывает при изменении состояния аутентификации, например, когда пользователь входит в систему или выходит из системы
function authStateObserver(user) {
  if (user) { // Пользователь вошёл
    // Получаем фото и имя пользователя
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Устанавливает имя и фото профиля
    userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
    userNameElement.textContent = userName;

    // Показывает имя, фото профиля и кнопку выхода
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Скрывает кнопку входа
    signInButtonElement.setAttribute('hidden', 'true');

    deleteUserButtonElement.style.display = 'block';
    messageFormElement.style.display = 'flex';
    imageFormElement.style.display = 'flex';

    saveMessagingDeviceToken();
  } else {
    // Скрывает имя, фото профиля и кнопку выхода
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    userPicElement.style.backgroundImage = '';
    signOutButtonElement.setAttribute('hidden', 'true');
    messageFormElement.style.display = 'none';
    imageFormElement.style.display = 'none';

    // Показывает кнопку входа
    signInButtonElement.removeAttribute('hidden');

    deleteUserButtonElement.style.display = 'none';
    window.location.href = 'sign.html';
  }
}

// Очищаем поле ввода
function resetMaterialTextfield(element) {
  element.value = '';
}

// Шаблон для сообщений
var MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<div class="name"></div>' +
  '<div class="timestamp"></div>' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '</div>';

// Шаблон для чатов
var CHAT_TEMPLATE =
  '<div class="activity-container">' +
  '<div class="acivity-name"></div>' +
  '<div class="acivity-timestamp"></div>' +
  '<div class="acivity-spacing"><div class="acivity-pic"></div></div>' +
  '<div class="acivity-message"></div>' +
  '</div>';

// Добавляет размер для фото профиля
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// Загрузочный спиннер
var LOADING_IMAGE_URL = 'images/loading.gif';

// Удаляем сообщение из UI
function deleteMessage(id) {
  var div = document.getElementById(id);
  // Если элемент для этого сообщения существует, мы его удаляем
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function createAndInsertMessage(id, timestamp) {
  const container = document.createElement('div');
  container.innerHTML = MESSAGE_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('id', id);

  // Если отметка времени равна нулю, предположим, что мы получили новое сообщение
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // Выясняет, куда вставить новое сообщение
  const existingMessages = messageListElement.children;
  if (existingMessages.length === 0) {
    messageListElement.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    messageListElement.insertBefore(div, messageListNode);
  }

  return div;
}

var chatListElement = document.querySelector("#chats");

function createAndInsertChat(id, timestamp) {
  const container = document.createElement('div');
  container.innerHTML = CHAT_TEMPLATE;
  const div = container.firstChild;
  div.setAttribute('id', id);
  div.setAttribute('activity-timestamp', timestamp);

  // Выясняет, куда вставить новое сообщение
  const existingChats = chatListElement.children;
  if (existingChats.length === 0) {
    chatListElement.appendChild(div);
  } else {
    let chatListNode = existingChats[0];

    while (chatListNode) {
      const chatListNodeTime = chatListNode.getAttribute('timestamp');

      if (!chatListNodeTime) {
        throw new Error(
          `Child ${chatListNode.id} has no 'timestamp' attribute`
        );
      }

      if (chatListNodeTime > timestamp) {
        break;
      }

      chatListNode = chatListNode.nextSibling;
    }

    chatListElement.insertBefore(div, chatListNode);
  }

  return div;
}

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  if (min < 10) {
    min = '0' + min;
  }
  if (hour < 10) {
    hour = '0' + hour;
  }
  var time = date + ' ' + month + ' ' + hour + ':' + min;
  return time;
}

// Показывает сообщение в UI
function displayMessage(id, timestamp, name, text, picUrl, imageUrl) {
  var div = document.getElementById(id) || createAndInsertMessage(id, timestamp);

  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
  }

  div.querySelector('.name').textContent = name;
  div.querySelector('.timestamp').textContent = timeConverter(timestamp);
  var chatElement = div.querySelector('.message');

  if (text) { // Если сообщение - текст
    chatElement.textContent = text;
    // Заменяет все разрывы строк на <br>
    chatElement.innerHTML = chatElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUrl) { // Если сообщение - изображение
    var href = document.createElement('a');
    var image = document.createElement('img');
    image.addEventListener('load', function () {
      messageListElement.scrollTop = messageListElement.scrollHeight;
    });
    image.src = imageUrl + '&' + new Date().getTime();
    href.setAttribute('href', image.src);
    href.setAttribute('target', '_blank');
    chatElement.innerHTML = '';
    chatElement.appendChild(href);
    href.appendChild(image);
  }
  inc++;
  // Постепенное появление карточки и прокрутка, чтобы просмотреть новое сообщение
  setTimeout(function () { div.classList.add('visible') }, 1);
  if (messageListElement.scrollHeight - messageListElement.scrollTop <= messageListElement.clientHeight + 200) {
    messageListElement.scrollTop = messageListElement.scrollHeight;
  }
}

// Включает или отключает кнопку отправки в зависимости от значений поля ввода
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Проверяем правильность установки и настройки Firebase SDK.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions and make ' +
      'sure you are running the codelab using `firebase serve`');
  }
}

// Проверяем была ли Firebase импортирована
checkSetup();

var closeSearchPopup = document.querySelector('#search-close');
var closeChatPopup = document.querySelector('#chat-close');
var addChat = document.querySelector('#add-chat');
var addChatId = document.querySelector('#addId');
var inputAddChat = document.querySelector('#input-add');
var addChatDisplay = document.querySelector('.add-chat-display');
var viewChatDisplay = document.querySelector('.chatView');
var chat_pic = document.getElementById('chat-pic');
var chat_name = document.getElementById('chat-name');
var chat_cid = document.getElementById('chat-cid');
var chat_cid = document.getElementById('chat-cid');
var chat_type = document.getElementById('chat-type');
var loadElement = document.getElementById('load');
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var inputName = document.querySelector('#input-name');
var editNameButton = document.querySelector('#edit-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signOutButtonElement = document.getElementById('sign-out');
var deleteUserButtonElement = document.getElementById('delete-user');
var profileId = document.querySelector('.profileId');
var notificationText = document.querySelector('.notification-text');
var notification = document.querySelector('.notification');

// Сохраняем сообщения в форму при нажатии
// на Enter
messageFormElement.addEventListener('keydown', function (e) {
  if (e.keyCode === 13) {
    onMessageFormSubmit();
  }
});
// на кнопки
addChat.addEventListener('click', addSearchShow);
messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);
deleteUserButtonElement.addEventListener('click', deleteProfile);

addChatId.addEventListener('click', chatIdFunc);
closeSearchPopup.addEventListener('click', addSearchHide);
closeChatPopup.addEventListener('click', addChatHide);

function addSearchShow() {
  addChat.style.display = 'none';
  addChatDisplay.style.display = 'flex';
}
function addSearchHide() {
  addChat.style.display = 'block';
  addChatDisplay.style.display = 'none';
}
function addChatShow() {
  addChat.style.display = 'none';
  viewChatDisplay.style.display = 'flex';
}
function addChatHide() {
  addChat.style.display = 'block';
  viewChatDisplay.style.display = 'none';
  chat_cid.textContext = '';
  chat_name.textContext = '';
  chat_pic.style.backgroundImage = '';
  chat_type.textContext = '';
}

// Событие для кнопки изменения имени
userNameElement.addEventListener('click', editName);

// Переключатель для кнопки
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// События для загрузки изображений
imageButtonElement.addEventListener('click', function (e) {
  e.preventDefault();
  messageListElement.scrollBy(0, messageListElement.scrollTop);
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);

// Инициализация Firebase
initFirebaseAuth();

// Загружаем существующие сообщения чата и слушаем новые
loadMessages();

// Уведомления
function hideNotification() {
  notification.classList.remove('anim');
}
function showNotification(text) {
  notificationText.textContent = text;
  notification.classList.add('anim');
  setTimeout(hideNotification, 3000);
}

// Меню бургер
document.querySelector('.menu-icon-wrapper').onclick = function () {
  document.querySelector('.menu-icon').classList.toggle('menu-icon-active');
  document.querySelector('#user-card-container').classList.toggle('user-card-container-active');
  document.querySelector('#messages-card-container').classList.toggle('passive');
  messageListElement.scrollTop += messageListElement.scrollHeight - messageListElement.scrollTop;
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(function (registration) {
    })
    .catch(function (err) {
      console.error('Service Worker error!')
    });
}

// Realtime DB

var database = firebase.database();

function addUser(email, userId, onlineState, userName, imageUrl) {
  firebase.database().ref('user/' + userId).set({
    email: email,
    id: userId,
    lastOnline: onlineState,
    name: userName,
    photoURL: imageUrl
  });
}

function showChats() {
  var chats = firebase.database().ref('user/' + idProperty + '/member');
  chats.on('value', (snapshot) => {
    const data = snapshot.val();
    for (var chat = 0; chat < data.length; chat++) {
      var idChat = data[chat];
      var chat = firebase.database().ref('chat/' + idChat);
      chat.on('value', (snapshot) => {
        const data = snapshot.val();
        for (var i = 0; i < data.members.length; i++) {
          if (data.members[i] == idProperty) {
            var nameChat = data.name;
            var photoChat = data.photoURL;
            var root = data.root;
            var type = data.type;
            viewChat(root, type, photoChat, nameChat);
          }
        }
      });
    }
  });
  global();
}

function global() {
  for (var i = 1; i < 3; i++) {
    var global = firebase.database().ref('global/' + i);
    global.on('value', (snapshot) => {
      const data = snapshot.val();
      console.log(data);
    });
  }
}

function chatIdFunc() {
  var idChat = inputAddChat.value;
  if (/\S/.test(inputAddChat.value)) {
    var chatId = firebase.database().ref('chat/' + idChat);
    chatId.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        var creatorId = data.creatorId;
        var id = data.id;
        var name = data.name;
        var photoURL = data.photoURL;
        var root = data.root;
        var type = data.type;
        var members = data.members;
        chat_cid.textContent = id;
        chat_name.textContext = name;
        chat_pic.style.backgroundImage = 'url(' + photoURL + ')';
        chat_type.textContext = type;
        console.log(members);
        console.log(root);
        addChatShow();
      } else {
        showNotification("Такого чата не существует");
      }
      resetMaterialTextfield(inputAddChat);
    });
  } else {
    showNotification("Введите число (ID чата)");
  }
}

function userIdFunc(id) {
  var chatId = firebase.database().ref('user/' + id);
  chatId.on('value', (snapshot) => {
    const data = snapshot.val();
    var email = data.email;
    var id = data.id;
    var lastOnline = data.lastOnline;
    var member = data.member;
    var name = data.name;
    var photoURL = data.photoURL;
    console.log(email);
    console.log(id);
    console.log(lastOnline);
    console.log(member);
    console.log(name);
    console.log(photoURL);
  });
}

var nameRequest = firebase.database().ref('user');
var idProperty;
function getListings() {
  nameRequest.on('value', setListing, createNewAcc);
};
getListings();

function setListing(snapshot) {
  const lenValueOfName = snapshot.val().length;
  for (var id = 1; id < lenValueOfName; id++) {
    var nameId = firebase.database().ref('user/' + id);
    return nameId.on('value', (snapshot) => {
      const data = snapshot.val();
      var email1 = data.email;
      var email2 = firebase.auth().currentUser.email;
      if (email1 == email2) {
        profileId.textContent = 'Ваш ID: ' + id;
        idProperty = id;
        showChats();
      }
    });
  }
}

function createNewAcc(snapshot) {
  const lenValueOfName = snapshot.val().length;
  addUser(firebase.auth().currentUser.email, lenValueOfName, "", firebase.auth().currentUser.dispalyName, firebase.auth().currentUser.photoURL);
}

function updateNameRequest(name) {
  var nameId = firebase.database().ref('user/' + idProperty);
  nameId.update({
    name: name
  })
}