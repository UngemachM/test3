// JavaScript to toggle the "New Project" form
document.getElementById('new-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'block';    document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
    document.getElementById('edit-input-project-container').style.display = 'none'; // hide edit project section
});

// Toggle the "Edit User" section and hide other sections
document.getElementById('edit-user').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none'; // Hide new project section
    document.getElementById('edit-input-project-container').style.display = 'none'; // Hide edit project section
    document.getElementById('edit-user-container').style.display = 'block'; // Show edit user section

    // Load users when "Edit User" is clicked
    loadUsers();
});

// Fetch and display users in the table
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

// Handle user editing
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



// JavaScript to go back to "Projects Overview"
document.getElementById('overview-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
    document.getElementById('edit-input-project-container').style.display = 'none'; // hide edit project section
    restoreDetailsButtons();
});

// JavaScript to show "Edit Project" form and hide "New Project" form
document.getElementById('edit-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none'; // hide new project section
    document.getElementById('edit-project-container').style.display = 'block'; // show edit project section
    document.getElementById('edit-input-project-container').style.display = 'none'; // hide edit project section
});

// Restore "View Details" buttons when switching back to Projects Overview
function restoreDetailsButtons() {
    var detailsButtons = document.querySelectorAll('#project-view a.btn-details');
    detailsButtons.forEach(function (button) {
        button.textContent = 'View Details';
    });
}

// Event delegation for dynamic elements like the "View Details" button
document.addEventListener('click', function (event) {
    // Handle 'View Details' button click
    if (event.target.classList.contains('project-details-btn')) {
        const projectRow = event.target.closest('tr');
        const projectId = projectRow.dataset.projectId; // Assuming the project ID is stored in a data attribute
        const projectName = projectRow.children[0].textContent; // Assuming the project name is in the first column

        // Redirect to the dashboard with the project ID and name as query parameters
        window.location.href = `/taskDashboard.html?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`;
    }

    // Handle 'Edit This Project' button click
    if (event.target.id === 'project-details-btn-edit') {
        document.getElementById('new-project-container').style.display = 'none'; // hide new project section
        document.getElementById('main-container').style.display = 'none'; // hide main project section
        document.getElementById('edit-input-project-container').style.display = 'block'; // show edit project section
        document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("Loading projects...");

    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            console.log('Projects fetched:', data);

            // Get the tbody element
            const tableBody = document.getElementById('project-body');
            
            // Set innerHTML to new content
            tableBody.innerHTML = data.map(project => `
                <tr data-project-id="${project.id}"> <!-- Assuming project has an id -->
                    <td>${project.projectname}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td>
                        <button class="project-details-btn">View Details</button>
                    </td>
                </tr>
            `).join(''); // join('') combines all rows into a single HTML string

        })
        .catch(error => console.error('Error fetching projects:', error));
});
