document.getElementById('taskForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Verhindert das Standard-Verhalten des Formulars

    // Werte aus den Dropdowns holen
    const taskname = document.getElementById('taskname').value;
    const prio = document.getElementById('prio').value;
    const project = document.getElementById('project').value;
    const owner = document.getElementById('owner').value;
    const assigned = document.getElementById('assigned').value;
    const description = document.getElementById('description').value;
    const deadlineDate = document.getElementById('deadline').value;  // Datum holen
    const deadlineTime = document.getElementById('time').value;  // Uhrzeit holen

    // Sicherstellen, dass alle erforderlichen Felder ausgefüllt sind
    if (!taskname || !prio || !project || !owner || !assigned || !description || !deadlineDate || !deadlineTime) {
        alert('Please fill in all required fields.');
        return;
    }

    // Kombinieren von Datum und Uhrzeit zu einem einzigen Parameter
    const deadline = `${deadlineDate} ${deadlineTime}`;

    // Formulardaten in URLSearchParams umwandeln
    const formData = new URLSearchParams();
    formData.append('taskname', taskname);
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
        console.error('Fehler beim Hinzufügen der Aufgabe:', error);
    });
});



document.addEventListener('DOMContentLoaded', () => {
    // Function to load users
    function loadUsers() {
        fetch('/users') // API endpoint to fetch users
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

    // Function to load projects and populate the project dropdown
    function loadProjects() {
        fetch('/projects') // API endpoint to fetch projects
            .then(response => response.json())
            .then(projects => {
                const projectSelect = document.getElementById('project');

                // Clear any existing options (except the default prompt)
                projectSelect.innerHTML = '<option value="">Select Project</option>';

                projects.forEach(project => {
                    const optionProject = document.createElement('option');
                    optionProject.value = project.projectname;  // assuming `project.id` is the project identifier
                    optionProject.textContent = project.projectname;  // assuming `project.name` is the project name
                    projectSelect.appendChild(optionProject);
                });
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
            });
    }

    // Load users and projects when the page is fully loaded
    loadUsers();
    loadProjects();
});
