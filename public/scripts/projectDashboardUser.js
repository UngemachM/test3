
// JavaScript, um zur "Projektübersicht" zurückzukehren
document.getElementById('overview-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    document.getElementById('edit-project-container').style.display = 'none'; // Abschnitt zum Bearbeiten des Projekts ausblenden
    document.getElementById('edit-input-project-container').style.display = 'none';// Abschnitt zum Bearbeiten des Projekts ausblenden
    restoreDetailsButtons();
});





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
        document.getElementById('edit-input-project-container').style.display = 'block'; // Bearbeitungsbereich für das Projekt anzeigen
        document.getElementById('edit-project-container').style.display = 'none'; // Bearbeitungsbereich ausblenden
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("Loading projects...");

    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            console.log('Projects fetched:', data);

            // Das tbody-Element abrufen
            const tableBody = document.getElementById('project-body');

            // innerHTML auf neuen Inhalt setzen
            tableBody.innerHTML = data.map(project => `
                <tr >
                    <td>${project.projectName}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td class="project-progress">${project.projectProgress}</td>

                    <td>
                        <button class="project-details-btn">View Details</button>
                    </td>
                </tr>
            `).join(''); // join('') kombiniert alle Zeilen zu einem einzigen HTML-String

        })
        .catch(error => console.error('Error fetching projects:', error));
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
                alert('Error logging in , please try again.');
            }
        })
        .catch(error => {
            console.error('Error logging out', error);
            alert('An error has occurred. Please try again later.');
        });
}

// Event Listener für den Logout-Button
document.getElementById('logout-button').addEventListener('click', logout);

