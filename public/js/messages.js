const button = document.querySelector('button');
const messageInput = document.querySelector('#input');
const receiverId = window.location.pathname.split('/').pop(); // extract receiver ID from URL
const chatLog = document.querySelector('#chat-log');

chatLog.scrollTop = chatLog.scrollHeight;

const socket = io();

socket.emit('join_room', receiverId);


socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on('message', (messageData) =>{
  let currTimestamp = new Date();
  currTimestamp = currTimestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const message = document.createElement('p');
  const sender = document.createElement('p');
  const messageTimestamp = document.createElement('p');

  const usernameLog = document.createElement('div');
  const messageLog = document.createElement('div');
  const col9 = document.createElement('div');
  const col3 = document.createElement('div');

  const hr = document.createElement('hr');

  if(Number(receiverId) === messageData.senderId){
    col9.className=('col-9');
    col3.className=('col-3');

    messageLog.classList.add('row','message-log');
    usernameLog.classList.add('row','username-log');

    sender.textContent = messageData.senderUsername + ' said: ';;
    sender.classList.add('Montserrat', 'username');

    message.textContent = messageData.text;
    message.classList.add('message', 'Montserrat');

    messageTimestamp.textContent = currTimestamp;
    messageTimestamp.classList.add('time', 'Montserrat', 'float-end');

    usernameLog.appendChild(sender);
    col9.appendChild(message);
    col3.appendChild(messageTimestamp);
    messageLog.appendChild(col9);
    messageLog.appendChild(col3);
    chatLog.appendChild(usernameLog);
    chatLog.appendChild(messageLog);
    chatLog.appendChild(hr);
  }else{
    col9.className=('col-11');
    col3.className=('col-1');

    messageLog.classList.add('row','message-log');
    usernameLog.classList.add('row','username-log');

    sender.textContent = 'You said: ';
    sender.classList.add('Montserrat', 'username', 'userSent');

    message.textContent = messageData.text;
    message.classList.add('message', 'Montserrat', 'userSent');

    messageTimestamp.textContent = currTimestamp;
    messageTimestamp.classList.add('time', 'Montserrat', 'float-end');

    usernameLog.appendChild(sender);
    col9.appendChild(message);
    col3.appendChild(messageTimestamp);
    messageLog.appendChild(col9);
    messageLog.appendChild(col3);
    chatLog.appendChild(usernameLog);
    chatLog.appendChild(messageLog);
    chatLog.appendChild(hr);
  }

  

  chatLog.scrollTop = chatLog.scrollHeight;

})

button.addEventListener('click', () => {

  event.preventDefault();

  const message = messageInput.value;

  socket.emit('chat message', {
    receiverId: receiverId,
    message: message
  }); 
  messageInput.value = '';
});
