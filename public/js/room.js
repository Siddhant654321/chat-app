const form = document.getElementById('join');
const button = document.getElementById('submit')
const displayName = document.querySelector('#floatingInput');
const displayError = document.querySelector('#name_error');
const roomNumber = document.querySelector('#floatingRoom');
const roomError = document.querySelector('#room_error');

const isNotValid = async (username, room) => {
    const request = await fetch(`${window.location.href}isValid?username=${username}&room=${room}`)
    const response = (await request.json())
    return (response.isValid == 'false');
}

button.addEventListener('click', async (e) => {
    e.preventDefault();
    if(displayName.value.length <= 2){
        displayError.innerHTML = 'Display Name should be atleast 3 characters long!'
    } else if (await isNotValid(displayName.value, roomNumber.value)) {
        displayError.innerHTML = 'This name is already taken by another user in the same room!'
    } else {
        displayError.innerHTML = ''
    }
    if(roomNumber.value.toString().length <= 5){
        roomError.innerHTML = 'Room Number should be atleast 6 numbers long!'
    } else if (roomNumber.value instanceof String) {
        roomError.innerHTML = 'Room Number should be Numeric only!'
    } else {
        roomError.innerHTML = ''
    }
    if(roomError.innerHTML == '' && displayError.innerHTML == ''){
        location.href = `/chat.html?username=${displayName.value}&room=${roomNumber.value}`
    }
})
