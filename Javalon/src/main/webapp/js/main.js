'use strict';
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var usernamePage = document.querySelector('#username-page');
var gamePage = document.querySelector('#game-page');

// Get the modal
var modal = document.getElementById('myModal');

// Get the image and insert it inside the modal - use its "alt" text as a caption
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() { 
  modal.style.display = "none";
}


var stompClient = null;
var username=null;
var Id=null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];


async function connect() {
    await sleep(300);
    const Url = '/player/logged'; 
    console.log(Url);
    $.ajax({
        url: Url,
        type:"GET",
        success: function(data){
            username=data.object.userName;

            if(username){

                //usernamePage.classList.add('hidden');
                //gamePage.classList.remove('hidden');
                var socket = new SockJS('/ws');
                stompClient = Stomp.over(socket);
                stompClient.connect({}, onConnected, onError);
            }
        },
        error: function(error){
            console.log(`Error ${error}`);
        }
    })
    //username= document.querySelector('#name').value.trim();
}


function onConnected() {
    //////////////////////////////////////////////////////////////////////////////////
    // the topic we subscribe to will be determined from the url - namely the game Id 
    // we can write up a service call to get it but I don't know if we ened it
    //////////////////////////////////////////////////////////////////////////////////
    
    var Url= window.location.href;
    Id = Url.substring(Url.lastIndexOf("/")+1, Url.length);

    // subscribe to the specific game topic
    stompClient.subscribe('/topic/'+Id, onMessageReceived);

    // send username to server
    stompClient.send("/app/chat.addUser/"+Id,
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
    angular.element(document.getElementById('game-page')).scope().playerId = username;
}


function onError(error) {

}


function sendMessage(event) {

    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {

        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage/"+Id, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }

    event.preventDefault();
}


function onMessageReceived(payload) {

    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');
    messageElement.style.fontSize= '0.8em';
    if (message.type === 'JOIN') {

        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';

        console.log(angular.element(document.getElementById('game-page')).scope());
        angular.element(document.getElementById('game-page')).scope().updateConfig();
        angular.element(document.getElementById('game-page')).scope().$apply();

    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content=message.sender + ' left!';

    } else if (message.type === 'MOVE') {
        messageElement.classList.add('event-message');
        message.content=message.sender + ' made a move!';

        console.log(angular.element(document.getElementById('game-page')).scope());
        angular.element(document.getElementById('game-page')).scope().update();
        angular.element(document.getElementById('game-page')).scope().$apply();

    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {

    var hash = 0;
    for (var i=0; i<messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index=Math.abs(hash % colors.length);
    return colors[index];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
//messageForm.addEventListener('submit', connect, true);
connect();


function showCharacter() {
    var page= window.location.href;
    Id = page.substring(page.lastIndexOf("/")+1, page.length);
    const Url = '/game/character/'+Id; 
    console.log(Url);
    $.ajax({
        url: Url,
        type:"GET",
        success: function(data){
            var character = data;
            if(character){
                // Handle the logic for displaying the character
                
                // currently finding the player roles is done client side
                var scope=angular.element(document.getElementById('game-page')).scope();
                scope = scope.gameProperties;
                console.log(scope);
                var merlin = null; 
                var assassin = null; 
                var villager = null; 
                var morgana = null; 
                var percival = null; 

                if (scope.firstPlayerCharacter=="MERLIN"){
                    merlin = scope.firstPlayer.userName;     
                } else if (scope.firstPlayerCharacter=="ASSASSIN"){
                    assassin = scope.firstPlayer.userName;
                } else if (scope.firstPlayerCharacter=="VILLAGER"){
                    villager = scope.firstPlayer.userName;
                } else if (scope.firstPlayerCharacter=="MORGANA"){
                    morgana = scope.firstPlayer.userName;
                } else if (scope.firstPlayerCharacter=="PERCIVAL"){
                    percival = scope.firstPlayer.userName;
                }
                
                if (scope.secondPlayerCharacter=="MERLIN"){
                    merlin = scope.secondPlayer.userName;     
                } else if (scope.secondPlayerCharacter=="ASSASSIN"){
                    assassin = scope.secondPlayer.userName;
                } else if (scope.secondPlayerCharacter=="VILLAGER"){
                    villager = scope.secondPlayer.userName;
                } else if (scope.secondPlayerCharacter=="MORGANA"){
                    morgana = scope.secondPlayer.userName;
                } else if (scope.secondPlayerCharacter=="PERCIVAL"){
                    percival = scope.secondPlayer.userName;
                }

                if (scope.thirdPlayerCharacter=="MERLIN"){
                    merlin = scope.thirdPlayer.userName;     
                } else if (scope.thirdPlayerCharacter=="ASSASSIN"){
                    assassin = scope.thirdPlayer.userName;
                } else if (scope.thirdPlayerCharacter=="VILLAGER"){
                    villager = scope.thirdPlayer.userName;
                } else if (scope.thirdPlayerCharacter=="MORGANA"){
                    morgana = scope.thirdPlayer.userName;
                } else if (scope.thirdPlayerCharacter=="PERCIVAL"){
                    percival = scope.thirdPlayer.userName;
                }

                if (scope.fourthPlayerCharacter=="MERLIN"){
                    merlin = scope.fourthPlayer.userName;     
                } else if (scope.fourthPlayerCharacter=="ASSASSIN"){
                    assassin = scope.fourthPlayer.userName;
                } else if (scope.fourthPlayerCharacter=="VILLAGER"){
                    villager = scope.fourthPlayer.userName;
                } else if (scope.fourthPlayerCharacter=="MORGANA"){
                    morgana = scope.fourthPlayer.userName;
                } else if (scope.fourthPlayerCharacter=="PERCIVAL"){
                    percival = scope.fourthPlayer.userName;
                }

                if (scope.fifthPlayerCharacter=="MERLIN"){
                    merlin = scope.fifthPlayer.userName;     
                } else if (scope.fifthPlayerCharacter=="ASSASSIN"){
                    assassin = scope.fifthPlayer.userName;
                } else if (scope.fifthPlayerCharacter=="VILLAGER"){
                    villager = scope.fifthPlayer.userName;
                } else if (scope.fifthPlayerCharacter=="MORGANA"){
                    morgana = scope.fifthPlayer.userName;
                } else if (scope.fifthPlayerCharacter=="PERCIVAL"){
                    percival = scope.fifthPlayer.userName;
                }

                if (scope.sixthPlayerCharacter=="MERLIN"){
                    merlin = scope.sixthPlayer.userName;     
                } else if (scope.sixthPlayerCharacter=="ASSASSIN"){
                    assassin = scope.sixthPlayer.userName;
                } else if (scope.sixthPlayerCharacter=="VILLAGER"){
                    villager = scope.sixthPlayer.userName;
                } else if (scope.sixthPlayerCharacter=="MORGANA"){
                    morgana = scope.sixthPlayer.userName;
                } else if (scope.sixthPlayerCharacter=="PERCIVAL"){
                    percival = scope.sixthPlayer.userName;
                }

                //TODO add in a check so that you can only see when gameStatus = IN_PROGRESS
                modal.style.display = "block";
                if (character == "MERLIN") {
                    modalImg.src = "../images/Merlin.jpg";
                    var firstDisplay = null;
                    var secondDisplay = null; 

                    // need to randomize 
                    if (Math.floor((Math.random() * 2) + 1)==1){
                        firstDisplay = morgana;
                        secondDisplay = assassin;
                    } else {
                        firstDisplay = assassin;
                        secondDisplay = morgana;
                    }
                    
                    captionText.innerHTML = "Members of Team Evil: <strong>" + firstDisplay + " " + secondDisplay + "</strong>";
                } else if (character == "ASSASSIN") {
                    modalImg.src = "../images/Assassin.jpg";
                    captionText.innerHTML = "Try to Find and Assassinate Merlin <br> Members of Team Evil: <strong>" + morgana + "</strong";
                } else if (character == "MORGANA") {
                    modalImg.src = "../images/Morgana.png";
                    captionText.innerHTML = "Try to Trick Percival into Thinking you are Merlin <br> Members of Team Evil: <strong>" + assassin + "</strong>";
                } else if (character == "VILLAGER") {
                    modalImg.src = "../images/Villager.jpg";
                    captionText.innerHTML = "Ignorance is Bliss";
                } else if (character == "PERCIVAL") {
                    // need to randomize 
                    if (Math.floor((Math.random() * 2) + 1)==1){
                        firstDisplay = merlin;
                        secondDisplay = morgana;
                    } else {
                        firstDisplay = morgana;
                        secondDisplay = merlin;
                    }

                    modalImg.src = "../images/Percival.png";
                    captionText.innerHTML = "Try to Protect Merlin <br> People who may be Merlin or Morgana: <strong>" + firstDisplay + " " + secondDisplay + "</strong>";
                } else {
                    // something went wrong
                }
            }
        },
        error: function(error){
            console.log(`Error ${error}`);
        }
    })
}

function hideCharacter() {
    //modal.style.display = "none";
}