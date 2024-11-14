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
function loadUsers() {
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const userBody = document.getElementById('user-body');
            userBody.innerHTML = users.map(user => {
                // Umrechnung der Rangzahl in lesbare Texte
                let rankText;
                switch(user.rank) {
                    case 3:
                        rankText = "Admin";
                        break;
                    case 2:
                        rankText = "Manager";
                        break;
                    case 1:
                        rankText = "User";
                        break;
                    default:
                        rankText = "Unknown";
                }

                // HTML für eine Tabellenzeile erstellen
                return `
                    <tr data-user-id="${user.id}">
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${rankText}</td> <!-- Zeigt die umgerechnete Rangbezeichnung an -->
                        <td>
                            <button class="edit-user-btn">Edit</button>
                        </td>
                    </tr>
                `;
            }).join('');
        })
        .catch(error => console.error('Error fetching users:', error));
}


// Event-Handler, wenn auf "Update User" geklickt wird
document.getElementById('edit-user-form').onsubmit = function(e) {
    e.preventDefault(); // Verhindert das Standard-Formular-Submit-Verhalten
    console.log("knopf gedrückt")
    const userId = document.getElementById('edit-username').value;  // Hier entnimmst du die User-ID
    const updatedRank = document.getElementById('edit-user-rank').value; // Neuen Rang aus dem Dropdown-Feld
    
    // Sende die PUT-Anfrage an den Server
    fetch(`/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rank: updatedRank }) // Body der Anfrage mit dem neuen Rang
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => { throw new Error(data.error); });
        }
        return response.json(); // Erfolgreiche Antwort
    })
    .then(data => {
        console.log('User successfully updated:', data);
        // Optionale Erfolgsnachricht oder Benutzeraktualisierung der Ansicht
        loadUsers(); // Lädt die Benutzerliste erneut
        document.getElementById('edit-user-form-container').style.display = 'none'; // Schließt das Formular
    })
    .catch(error => {
        console.error('Error updating user:', error);
        alert('Fehler beim Aktualisieren des Benutzers: ' + error.message);
    });
};

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
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("Loading projects...");

    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            console.log('Projects fetched:', data);

            // Hole das tbody Element
            const tableBody = document.getElementById('project-body');
            
           // innerHTML auf neuen Inhalt setzen
            tableBody.innerHTML = data.map(project => `
                <tr data-project-id="${project.id}">
                    <td>${project.projectname}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td>
                        <button class="edit-project-btn">Edit</button>
                    </td>
                </tr>
            `).join(''); // join('') kombiniert alle Zeilen zu einem einzigen HTML-String
        })
        .catch(error => console.error('Error fetching projects:', error));
});

// Funktion zum Ersetzen der "View Details"-Buttons durch "Edit"-Buttons
document.getElementById('edit-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none'; // Verstecke "Neues Projekt" Formular
    document.getElementById('edit-project-container').style.display = 'block'; // Zeige "Projekt Bearbeiten" Formular
    replaceDetailsWithEditButtons(); // Ersetze Details-Buttons durch Edit-Buttons
});

// Funktion zum Ersetzen der "View Details"-Buttons durch "Edit"-Buttons
function replaceDetailsWithEditButtons() {
    const projectRows = document.querySelectorAll('#project-body tr');
    projectRows.forEach(row => {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-project-btn');
        
        const detailsButtonCell = row.querySelector('td:last-child');
        detailsButtonCell.innerHTML = ''; // Entferne den "View Details"-Button
        detailsButtonCell.appendChild(editButton); // Füge den "Edit"-Button hinzu
    });
}

// Handle "Edit" Button click
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-project-btn')) {
        const projectRow = event.target.closest('tr');
        const projectId = projectRow.dataset.projectId;
        const projectName = projectRow.children[0].textContent;
        const projectDetails = projectRow.children[1].textContent;

        // Zeige das Editierformular
        document.getElementById('edit-project-container').dataset.projectId = projectId; // Speichere die Projekt-ID
        document.getElementById('edit-project-progress').value = ''; // Reset progress
        document.getElementById('edit-project-details').value = projectDetails; // Zeige Projektdetails im Formular

        // Zeige das Editierformular an
        document.getElementById('edit-project-form-container').style.display = 'block';
    }
});// Handle "Edit" Button click
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-project-btn')) {
        const projectRow = event.target.closest('tr');
        const projectId = projectRow.dataset.projectId;
        const projectName = projectRow.children[0].textContent; // Der Name des Projekts
        const projectDetails = projectRow.children[1].textContent; // Die Details des Projekts

        // Setze den projectName in das versteckte input-Feld
        document.getElementById('projectNameHidden').value = projectName; // Das versteckte Input-Feld mit dem Namen des Projekts setzen

        // Zeige das Editierformular
        document.getElementById('edit-project-container').dataset.projectId = projectId; // Speichere die Projekt-ID
        document.getElementById('edit-project-progress').value = ''; // Reset progress
        document.getElementById('edit-project-details').value = projectDetails; // Zeige Projektdetails im Formular

        // Zeige das Editierformular an
        document.getElementById('edit-project-form-container').style.display = 'block';
    }
});

document.getElementById('edit-project-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Verhindert das Standard-Formular-Verhalten

    // Erstellt den URL-Parameter-String aus dem Formular
    const formData = new URLSearchParams(new FormData(this)).toString();
    console.log(formData)

    const projectName = document.getElementById('projectNameHidden').value; // Name des Projekts aus dem versteckten Input-Feld

    // Sende die PUT-Anfrage an den Server
    fetch(`/projects/${encodeURIComponent(projectName)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Projekt erfolgreich aktualisiert:', data);
        loadProjects();  // Projekte nach der Aktualisierung neu laden
        alert('Projekt wurde erfolgreich aktualisiert!');
    })
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
});

document.addEventListener('DOMContentLoaded', () => {
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
    const addProjectButton = document.getElementById('new-project-link');
    const newProjectContainer = document.getElementById('new-project-container');

    addProjectButton.addEventListener('click', () => {
        newProjectContainer.style.display = 'block'; // Formular anzeigen
    });

    // Verstecke das Formular wieder, wenn das Formular abgesendet wurde oder abgebrochen wird
    const cancelProjectButton = document.getElementById('cancel-project-link');
    if (cancelProjectButton) {
        cancelProjectButton.addEventListener('click', () => {
            newProjectContainer.style.display = 'none';
        });
    }

    document.getElementById('new-project-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new URLSearchParams(new FormData(this)).toString();
        console.log(formData);
    
        // Sende die Daten an den Server
        fetch('/addProject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Erfolgreiche Antwort
            } else {
                // Überprüfen, ob der Fehlerstatus 409 (Konflikt) ist
                if (response.status === 409) {
                    throw new Error('Wähle einen anderen Namen. Ein Projekt mit diesem Namen existiert bereits.');
                } else {
                    throw new Error('Fehler beim Hinzufügen des Projekts. Bitte versuche es erneut.');
                }
            }
        })
        .then(data => {
            alert('Projekt erfolgreich hinzugefügt!');
            newProjectContainer.style.display = 'none'; // Formular nach dem Hinzufügen schließen
            loadProjects(); // Neue Projekte laden
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen des Projekts:', error);
            alert(error.message); // Zeige die Fehlermeldung an
        });
    });
});


// Funktion zum Laden der Projekte und Anzeigen in der Tabelle
function loadProjects() {
    console.log("Lade Projekte...");

    // Abfrage der Projekte vom Server
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

