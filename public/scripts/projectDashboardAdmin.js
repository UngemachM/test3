<<<<<<< HEAD
// JavaScript, um das Formular für "Neues Projekt" umzuschalten
document.getElementById('new-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'block';   
    document.getElementById('edit-project-container').style.display = 'none'; // Bearbeitungsbereich für das Projekt ausblenden
});

// Den Abschnitt "Benutzer bearbeiten" umschalten und andere Abschnitte ausblenden
document.getElementById('edit-user').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none'; // Neuen Projektbereich ausblenden
    document.getElementById('edit-project-container').style.display = 'none'; // Bearbeitungsbereich für Projekte ausblenden
    document.getElementById('edit-user-container').style.display = 'block'; // Bearbeitungsbereich für Benutzer anzeigen

    // Benutzer laden, wenn "Benutzer bearbeiten" angeklickt wird
    loadUsers();
});
// Benutzer abrufen und in der Tabelle anzeigen
=======
// Zeigt das Formular für "Neues Projekt" an und versteckt andere Abschnitte
document.getElementById('new-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'block';
    document.getElementById('edit-project-container').style.display = 'none';
    document.getElementById('edit-user-container').style.display = 'none';
});

// Umschalten des "Benutzer Bearbeiten" Abschnitts, versteckt andere Abschnitte und lädt Benutzer
document.getElementById('edit-user').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('edit-project-container').style.display = 'none';
    document.getElementById('edit-user-container').style.display = 'block';
    loadUsers();
});

// Holt und zeigt Benutzer in der Tabelle an
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
function loadUsers() {
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const userBody = document.getElementById('user-body');
            userBody.innerHTML = users.map(user => {
                let rankText;
                switch (user.rank) {
                    case 3: rankText = "Admin"; break;
                    case 2: rankText = "Manager"; break;
                    case 1: rankText = "User"; break;
                    default: rankText = "Unbekannt";
                }
                return `
                    <tr data-user-id="${user.id}">
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${rankText}</td>
                        <td><button class="edit-user-btn">Bearbeiten</button></td>
                    </tr>
                `;
            }).join('');
        })
        .catch(error => console.error('Fehler beim Abrufen der Benutzer:', error));
}

// Öffnet das Formular "Benutzer Bearbeiten" mit vorbefüllten Daten
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-user-btn')) {
        const userRow = event.target.closest('tr');
        const userId = userRow.dataset.userId;
        const username = userRow.children[1].textContent;
        const rank = userRow.children[2].textContent;
        document.getElementById('user-id').value = userId;
        document.getElementById('edit-username').value = username;
        document.getElementById('edit-user-rank').value = rank;
        document.getElementById('edit-user-form-container').style.display = 'block';
    }
});

// Event-Handler für das Formular-Submit
document.getElementById('edit-user-form').onsubmit = function (e) {
    e.preventDefault();

    // Zugriff auf die Formularelemente
    const userId = document.getElementById('user-id');
    const updatedName = document.getElementById('edit-username');
    const updatedRank = document.getElementById('edit-user-rank');

    // Auslesen der Werte
    const userIdValue = userId.value;
    const updatedNameValue = updatedName.value;
    const updatedRankValue = updatedRank.value;

    // URLSearchParams erstellen, um die Formulardaten zu codieren
    const formData = new URLSearchParams();
    formData.append('username', updatedNameValue);
    formData.append('rank', updatedRankValue);

    // PUT-Anfrage senden
    fetch(`/users/${userIdValue}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => { throw new Error(data.error); });
        }
        return response.json();
    })
    .then(data => {
        console.log('Benutzer erfolgreich aktualisiert:', data);
        loadUsers();
        document.getElementById('edit-user-form-container').style.display = 'none';
    })
    .catch(error => alert('Fehler beim Aktualisieren des Benutzers: ' + error.message));
};

<<<<<<< HEAD
// Behandle Benutzerbearbeitung
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-user-btn')) {
        const userRow = event.target.closest('tr');
        const userId = userRow.dataset.userId;  // Benutzer-ID aus dem data-Attribut der Zeile
        const username = userRow.children[1].textContent;
        const rank = userRow.children[2].textContent;

        // Populiere das Formular mit den Daten des ausgewählten Benutzers
        document.getElementById('edit-username').value = username;
        document.getElementById('edit-user-rank').value = rank;

        // Zeige das Edit-User-Formular
        document.getElementById('edit-user-form-container').style.display = 'block';

        // Update-Formular beim Absenden
        document.getElementById('edit-user-form').onsubmit = function (e) {
            e.preventDefault(); // Verhindert das Standard-Formular-Submit-Verhalten

            const updatedUsername = document.getElementById('edit-username').value;  // Neuer Benutzername
            const updatedRank = document.getElementById('edit-user-rank').value;  // Neuer Rang

            // Sende die PUT-Anfrage an den Server mit den Parametern in der URL
            fetch(`/users/${userId}?username=${updatedUsername}&rank=${updatedRank}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log('Benutzer erfolgreich aktualisiert:', data);
                loadUsers();  // Benutzerliste nach der Aktualisierung neu laden
                document.getElementById('edit-user-form-container').style.display = 'none';  // Formular schließen
            })
            .catch(error => console.error('Fehler beim Aktualisieren des Benutzers:', error));
        };
    }
});



// JavaScript, um zur "Projektübersicht" zurückzukehren
document.getElementById('overview-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('edit-project-container').style.display = 'none'; // Abschnitt zum Bearbeiten des Benutzers ausblenden
    document.getElementById('edit-user-container').style.display = 'none'; // Bearbeitungsbereich für den Benutzer ausblenden

    restoreDetailsButtons();
=======
// Zeigt die "Projektübersicht" an und versteckt andere Abschnitte
document.getElementById('overview-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('edit-project-container').style.display = 'none';
    document.getElementById('edit-user-container').style.display = 'none';
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
});

// Lädt Projekte beim Laden der Seite und zeigt sie in der Tabelle an
document.addEventListener('DOMContentLoaded', function () {
    loadProjects();
});

// Holt und zeigt Projekte in der Tabelle an
function loadProjects() {
    console.log("Lade Projekte...");

    fetch('/projects')
        .then(response => response.json())
        .then(data => {
<<<<<<< HEAD
            console.log('Projects fetched:', data);

            // Hole das tbody Element
            const tableBody = document.getElementById('project-body');
            
           // innerHTML auf neuen Inhalt setzen
=======
            console.log('Projekte geladen:', data);
            const tableBody = document.getElementById('project-body');
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
            tableBody.innerHTML = data.map(project => `
                <tr>
                    <td>${project.projectName}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td class="project.progress">${project.projectProgress}</td>
                    <td><button class="edit-project-btn">Bearbeiten</button></td>
                    <td><button class="project-details-btn">Details</button></td>
                </tr>
            `).join('');
        })
        .catch(error => console.error('Fehler beim Laden der Projekte:', error));
}

// Öffnet das Formular "Projekt Bearbeiten" und befüllt es mit Projektdaten
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-project-btn')) {
        const projectRow = event.target.closest('tr');
        const projectId = projectRow.dataset.projectId;
        const projectName = projectRow.children[0].textContent;
        const projectDetails = projectRow.children[1].textContent;

        document.getElementById('projectNameHidden').value = projectName;
        document.getElementById('edit-project-details').value = projectDetails;

        document.getElementById('edit-project-container').style.display = 'block';
        document.getElementById('edit-user-form-container').style.display = 'none';

    }
});

// Event-Handler für das Aktualisieren von Projektdaten
document.getElementById('edit-project-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const projectName = document.getElementById('projectNameHidden').value;
    const formData = new URLSearchParams(new FormData(this)).toString();

    fetch(`/projects/${encodeURIComponent(projectName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Projekt erfolgreich aktualisiert:', data);
        loadProjects();
        alert('Projekt wurde erfolgreich aktualisiert!');
    })
<<<<<<< HEAD
    .catch(error => {
        console.error('Fehler beim Aktualisieren des Projekts:', error);
        alert('Fehler beim Aktualisieren des Projekts: ' + error.message);
    });
});




// Lade Projekte und zeige sie in der Tabelle an
function loadProjects() {
    console.log("Lade Projekte...");

    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            console.log('Projekte geladen:', data);

            // Holen des tbody-Elements für die Tabelle
            const tableBody = document.getElementById('project-body');

            // Setze den innerHTML der Tabelle auf die neuen Projekt-Daten
            tableBody.innerHTML = data.map(project => `
                <tr data-project-id="${project.id}"> <!-- Angenommene ID des Projekts -->
                    <td>${project.projectname}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td>
                        <button class="project-details-btn">View Details</button>
                    </td>
                </tr>
            `).join(''); // join('') kombiniert alle Zeilen zu einem einzigen HTML-String
        })
        .catch(error => console.error('Fehler beim Laden der Projekte:', error));
}

// Beim Laden der Seite alle Projekte abrufen
document.addEventListener('DOMContentLoaded', function() {
    loadProjects(); // Projekte laden
});


// Funktion zum Laden der Projekte und Anzeigen in der Tabelle
function loadProjects() {
    console.log("Lade Projekte...");

    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            console.log('Projekte geladen:', data);

            const tableBody = document.getElementById('project-body');
            tableBody.innerHTML = data.map(project => `
                <tr data-project-id="${project.id}">
                    <td>${project.projectname}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td>
                        <button class="edit-project-btn">Edit</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => console.error('Fehler beim Laden der Projekte:', error));
}

// "Details anzeigen"-Schaltflächen wiederherstellen, wenn zur Projektübersicht gewechselt wird
function restoreDetailsButtons() {
    var detailsButtons = document.querySelectorAll('#project-view a.btn-details');
    detailsButtons.forEach(function (button) {
        button.textContent = 'View Details';
    });
}

// Ereignisdelegierung für dynamische Elemente wie den "Details anzeigen"-Button
document.addEventListener('click', function (event) {
    // Klick auf den Button "Details anzeigen" behandeln
    if (event.target.classList.contains('project-details-btn')) {
        const projectRow = event.target.closest('tr');
        const projectId = projectRow.dataset.projectId; // Angenommen, die Projekt-ID ist in einem Datenattribut gespeichert
        const projectName = projectRow.children[0].textContent; // Angenommen, der Projektname befindet sich in der ersten Spalte

        // Weiterleiten zum Dashboard mit der Projekt-ID und dem Projektnamen als Abfrageparameter
        window.location.href = `/taskDashboard.html?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`;
    }

    // Klick auf den Button "Dieses Projekt bearbeiten" behandeln
    if (event.target.id === 'project-details-btn-edit') {
        document.getElementById('new-project-container').style.display = 'none'; // neuen Projektbereich ausblenden
        document.getElementById('main-container').style.display = 'none'; // Hauptprojektbereich ausblenden
        document.getElementById('edit-project-container').style.display = 'block'; // Bearbeitungsbereich für das Projekt anzeigen
    }
=======
    .catch(error => alert('Fehler beim Aktualisieren des Projekts: ' + error.message));
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
});

// Zeigt das Formular für ein neues Projekt an
document.addEventListener('DOMContentLoaded', () => {
<<<<<<< HEAD
    console.log("Loading projects...");

    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            console.log('Projects fetched:', data);

            // Hole das tbody Elemnt
            const tableBody = document.getElementById('project-body');
            // innerHTML auf neuen Inhalt setzen
            tableBody.innerHTML = data.map(project => `
                <tr data-project-id="${project.id}"> <!-- Assuming project has an id -->
                    <td>${project.projectname}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td>
                        <button class="project-details-btn">View Details</button>
                    </td>
                </tr>
            `).join(''); /// join('') kombiniert alle Zeilen zu einem einzigen HTML-String

        })
        .catch(error => console.error('Error fetching projects:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    // Zeige das Formular für die Eingabe eines neuen Projekts an
=======
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
    const addProjectButton = document.getElementById('new-project-link');
    const newProjectContainer = document.getElementById('new-project-container');

    addProjectButton.addEventListener('click', () => {
        newProjectContainer.style.display = 'block';
    });

    const cancelProjectButton = document.getElementById('cancel-project-link');
    if (cancelProjectButton) {
        cancelProjectButton.addEventListener('click', () => {
            newProjectContainer.style.display = 'none';
        });
    }

    document.getElementById('new-project-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new URLSearchParams(new FormData(this)).toString();

        fetch('/addProject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 409) {
                throw new Error('Wähle einen anderen Namen. Ein Projekt mit diesem Namen existiert bereits.');
            } else {
                throw new Error('Fehler beim Hinzufügen des Projekts. Bitte versuche es erneut.');
            }
        })
        .then(data => {
            alert('Projekt erfolgreich hinzugefügt!');
            newProjectContainer.style.display = 'none';
            loadProjects();
        })
        .catch(error => alert(error.message));
    });
});

// Delegiert Klick-Events für dynamische Elemente wie den "Details anzeigen"-Button
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('project-details-btn')) {
        const projectRow = event.target.closest('tr');
        const projectId = projectRow.dataset.projectId;
        const projectName = projectRow.children[0].textContent;

        window.location.href = `/taskDashboard.html?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`;
    }
});
