const socket = io();
const params = new URLSearchParams(location.search);
const username = params.get('username');
const room = params.get('room')
const all_messages = document.querySelector('#all-messages');
const span = document.getElementById('error');

const render = (data, username) => {
    all_messages.insertAdjacentHTML('beforeend', `<p class="username">${username}</p>${data}`)
    
}

socket.emit('newConnection', username, room)

socket.on('welcomeMessage', () => {
    const date = new Date();
    render(`<p class="time">${moment().format('hh:mm a')}</p><p class="new_message">Welcome!</p>`, 'System');
    all_messages.scrollTop = all_messages.scrollHeight;
})

document.querySelector('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.querySelector('#message');
    if(message.value != ''){
        error.innerHTML = '';
        socket.emit('sendMessage', message.value, () => {
            error.innerHTML = 'Profanity is not allowed!';
        })
        message.value = '';
        return message.focus();
    }
    error.innerHTML = 'Please type a message to send it!';
})

socket.on('newJoin', (username) => {
    render(`<p class="time">${moment().format('hh:mm a')}</p><p class="new_message">${username} has joined the chat</p>`, 'System');
    all_messages.scrollTop = all_messages.scrollHeight;

})

socket.on('userLeft', (username) => {
    render(`<p class="time">${moment().format('hh:mm a')}</p><p class="new_message">${username} has left the chat</p>`, 'System');
    all_messages.scrollTop = all_messages.scrollHeight;

})

socket.on('message', (message, username) => {
    render(`<p class="time">${moment().format('hh:mm a')}</p><p class="new_message">${message}</p>`, username)
    all_messages.scrollTop = all_messages.scrollHeight;
})


document.querySelector('#loc-btn').addEventListener('click', (e) => {
    const Geolocation = navigator.geolocation;
    e.preventDefault();
    error.innerHTML = '';
    Geolocation.getCurrentPosition((loc) => socket.emit('shareLocation', loc.coords.latitude, loc.coords.longitude, () => {
        render(`<p class="time">${moment().format('hh:mm a')}</p><p class="new_message">Location shared successfully!</p>`, 'System')
        all_messages.scrollTop = all_messages.scrollHeight;

    }), () => {
        error.innerHTML = 'Your browser does not support sharing location. Please try again with a different browser!';
    })
})

socket.on('location', (lat, lon, username) => {
    render(`<p class="time">${moment().format('hh:mm a')}</p><p><a target="_blank" href='http://maps.google.com/maps?q=${lat},${lon}' class="new_message">My Current Location</a></p>`, username);
    all_messages.scrollTop = all_messages.scrollHeight;

})

socket.on('userList', (users, userLeft) => {
    document.querySelector('#room_num').innerHTML = room;
    document.querySelector('#users').innerHTML = '';
    users.forEach((user) => {
        document.querySelector('#users').insertAdjacentHTML('beforeend', `<p>${user}<span id="online">  &#9679;</span></p>`)
    })
    if(userLeft){
        document.querySelector('#usersLeft').innerHTML = '';
        userLeft.forEach((user) => {
            document.querySelector('#usersLeft').insertAdjacentHTML('beforeend', `<p>${user} (Offline)</p>`)
        })
    }
})