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
                    default: rankText = "Unknown";
                }
                return `
                    <tr data-user-id="${user.id}">
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${rankText}</td>
                        <td><button class="edit-user-btn">Edit</button></td>
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

// Zeigt die "Projektübersicht" an und versteckt andere Abschnitte
document.getElementById('overview-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('edit-project-container').style.display = 'none';
    document.getElementById('edit-user-container').style.display = 'none';
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
            console.log('Projekte geladen:', data);
            const tableBody = document.getElementById('project-body');
            tableBody.innerHTML = data.map(project => `
                <tr>
                    <td>${project.projectName}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td class="project.progress">${project.projectProgress}</td>
                    <td><button class="edit-project-btn">Edit</button></td>
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
    .catch(error => alert('Fehler beim Aktualisieren des Projekts: ' + error.message));
});

// Zeigt das Formular für ein neues Projekt an
document.addEventListener('DOMContentLoaded', () => {
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
                throw new Error('Choose another name. A project with this name already exists.');
            } else {
                throw new Error('Error adding project. Please try again.');
            }
        })
        .then(data => {
            alert('Project added successfullyt!');
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
// Funktion für den Logout-Prozess
function logout() {
    // Sende eine POST-Anfrage an die Logout-Route
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // Falls du Daten an den Server senden musst, kannst du sie hier hinzufügen
        body: JSON.stringify({
            message: "User wants to log out"
        })
    })
    .then(response => {
        if (response.ok) {
            // Erfolgreiches Abmelden, Weiterleitung zur Startseite oder Login-Seite
            window.location.href = '/';  // Weiterleitung zur Startseite oder Login-Seite
        } else {
            // Fehlerbehandlung
            alert('Fehler beim Abmelden. Bitte versuche es später erneut.');
        }
    })
    .catch(error => {
        console.error('Fehler beim Logout:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    });
}

// Event Listener für den Logout-Button
document.getElementById('logout-button').addEventListener('click', logout);

