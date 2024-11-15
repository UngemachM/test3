document.getElementById('taskForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Verhindert das Standard-Verhalten des Formulars

    // Werte aus den Dropdowns holen
    const taskName = document.getElementById('taskName').value;
    const prio = document.getElementById('prio').value;
    const project = document.getElementById('project').value;
    const owner = document.getElementById('owner').value;
    const assigned = document.getElementById('assigned').value;
    const description = document.getElementById('description').value;
    const deadlineDate = document.getElementById('deadline').value;  // Datum holen
    const deadlineTime = document.getElementById('time').value;  // Uhrzeit holen

    // Sicherstellen, dass alle erforderlichen Felder ausgefüllt sind
    if (!taskName || !prio || !project || !owner || !assigned || !description || !deadlineDate || !deadlineTime) {
        alert('Please fill in all required fields.');
        return;
    }

    // Kombinieren von Datum und Uhrzeit zu einem einzigen Parameter
    const deadline = `${deadlineDate} ${deadlineTime}`;

    // Formulardaten in URLSearchParams umwandeln
    const formData = new URLSearchParams();
    formData.append('taskName', taskName);
    formData.append('prio', prio);
    formData.append('project', project);
    formData.append('owner', owner);
    formData.append('assigned', assigned);
    formData.append('description', description);
    formData.append('deadline', deadline);  // Kombiniertes Datum und Uhrzeit zu den Formulardaten hinzufügen

    // Formulardaten an den Server senden
    fetch('/addTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    })
        .then(response => response.text())
        .then(message => {
            alert(message);  // Erfolgsnachricht
        })
        .catch(error => {
            console.error('Error adding task:', error);
        });
});



document.addEventListener('DOMContentLoaded', () => {
    // Funktion zum Laden von Benutzern
    function loadUsers() {
        fetch('/users') // API-Endpunkt zum Abrufen von Benutzern
            .then(response => response.json())
            .then(users => {
                const ownerSelect = document.getElementById('owner');
                const assignedSelect = document.getElementById('assigned');

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

    // Funktion zum Laden von Projekten und zum Befüllen des Projekt-Dropdowns
    function loadProjects() {
        fetch('/projects') // API-Endpunkt zum Abrufen von Projekten
            .then(response => response.json())
            .then(projects => {
                const projectSelect = document.getElementById('project');

                // Vorhandene Optionen löschen (außer der Standardaufforderung)
                projectSelect.innerHTML = '<option value="">Select Project</option>';

                projects.forEach(project => {
                    const optionProject = document.createElement('option');
                    optionProject.value = project.projectName;  // Angenommen, `project.id` ist der Projektbezeichner
                    optionProject.textContent = project.projectName; // Angenommen, `project.projectname` ist der Projektname
                    projectSelect.appendChild(optionProject);
                });
            })
            .catch(error => {
                console.error('Error fetching projects:', error); // Fehlerbehandlung
            });
    }

    // Benutzer und Projekte laden, wenn die Seite vollständig geladen ist
    loadUsers();
    loadProjects();
});
function goBack() {
    window.history.back();  // Dies bringt den Benutzer zur vorherigen Seite im Verlauf zurück
}
