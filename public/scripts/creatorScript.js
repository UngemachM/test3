document.getElementById('taskForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent default form submission behavior
    const formData = new URLSearchParams(new FormData(this)).toString();

    fetch('/addTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
    .then(response => response.text())
    .then(message => {
        alert(message);  // Show a success message

        // Redirect to the task board after successful creation
        window.location.href = '/dashboardUser';  // Replace with your actual taskboard URL
    })
    .catch(error => {
        document.querySelector('.add-task-form').insertAdjacentHTML('beforeend', `<p>Fehler beim Hinzufügen der Aufgabe.</p>`);
        console.error('Error adding task:', error);
    });
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
                    optionOwner.value = user.id;
                    optionOwner.textContent = user.username;
                    ownerSelect.appendChild(optionOwner);

                    const optionAssigned = document.createElement('option');
                    optionAssigned.value = user.id;
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
