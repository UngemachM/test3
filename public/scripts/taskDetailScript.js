
function loadComments(taskname) {
    const form = document.getElementById('taskForm');
    const formData = new FormData(form);

    fetch('/getComments', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
        .then(response => response.text())
        .then(commentsHtml => {
            const commentsSection = document.getElementById('commentsSection');
            commentsSection.innerHTML = commentsHtml; // HTML-Inhalt einfügen
        })
        .catch(error => {
            console.error('Error fetching comments:', error); //Fehlerbehandlung
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const taskname = document.getElementById('taskname').value;
    loadComments(taskname);
});

function updateTask() {
    const form = document.getElementById('taskForm');
    const formData = new FormData(form);

    // Entferne leere Felder aus FormData
    for (let [key, value] of formData.entries()) {
        if (!value) { // Wenn das Feld leer ist
            formData.delete(key); // Entferne es aus FormData
        }
    }

    const params = new URLSearchParams();
    for (let [key, value] of formData.entries()) {
        params.append(key, value); // Form-Daten in URL-Parameter konvertieren
    }

    // XMLHTTPRequest verwenden
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/updateTask', true); // POST-Anfrage an den Server

    // Content-Type setzen
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // Ereignislistener für die Anfrage
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) { // Anfrage abgeschlossen
            if (xhr.status === 200) {
                const prevPage = document.referrer || window.history.back(); // Holt die URL der vorherigen Seite oder navigiert zurück
                if (prevPage) {
                    // Fügt einen Cache-Busting-Parameter (`reload=true`) hinzu, um sicherzustellen, dass die vorherige Seite aktualisiert wird
                    window.location.href = prevPage + (prevPage.includes('?') ? '&' : '?') + 'reload=true';
                } else {
                    // Fallback: Gehe zurück zur vorherigen Seite, wenn `document.referrer` nicht verfügbar ist
                    window.history.back();
                    setTimeout(() => {
                        location.reload(); // Erzwingt ein Neuladen der Seite
                    }, 100); // Verzögerung, um sicherzustellen, dass die Navigation abgeschlossen ist
                }
            } else {
                alert('Fehler beim Aktualisieren der Aufgabe: ' + xhr.statusText);
            }
        }
    };

    // Anfrage senden
    xhr.send(params.toString());
}




// Lade die Kommentare, wenn die Seite geladen wird
document.addEventListener('DOMContentLoaded', () => {
    const taskname = document.getElementById('taskname').value;
    loadComments(taskname);
});

document.addEventListener('DOMContentLoaded', () => {
    // Funktion zum Laden der Benutzer
    function loadUsers() {
        fetch('/users') // API-Endpunkt zum Abrufen der Benutzer
            .then(response => response.json())
            .then(users => {
                // Dropdown-Elemente für Owner und Assigned
                const ownerSelect = document.getElementById('owner');
                const assignedSelect = document.getElementById('assigned');

                // Benutzer in Dropdown-Menüs einfügen
                users.forEach(user => {
                    const optionOwner = document.createElement('option');
                    optionOwner.value = user.username;
                    optionOwner.textContent = user.username;
                    ownerSelect.appendChild(optionOwner);

                    const optionAssigned = document.createElement('option');
                    optionAssigned.value = user.username;
                    optionAssigned.textContent = user.username;
                    assignedSelect.appendChild(optionAssigned);
                });
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }

    // Benutzer laden, sobald die Seite vollständig geladen ist
    loadUsers();
});

// function goBack() {
//     const historyLength = window.history.length;
//     const currentPage = window.location.href;
//     const prevPage = document.referrer;

//     // Check if there is a referrer (previous page)
//     if (prevPage) {
//         // If we're coming from the same page (same URL), avoid reload loop
//         if (currentPage === prevPage) {
//             location.reload();
//         } else {
//             // Navigate back to the previous page and add a cache-busting parameter to refresh it
//             window.location.href = prevPage + (prevPage.includes('?') ? '&' : '?') + 'reload=true';
//         }
//     } else {
//         // If there is no referrer (direct navigation), we check history stack length
//         if (historyLength > 1) {
//             // If the user has more than 1 entry in history, safely navigate back
//             window.history.back();
//         } else {
//             // If there is no history (history length is 1), force a page reload
//             location.reload();
//         }
//     }
// }


