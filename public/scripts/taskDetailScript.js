
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
        // Erstelle ein FormData-Objekt mit dem Formular
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);
    
        // Konvertiere FormData zu URLSearchParams (damit es in der fetch-Abfrage funktioniert)
        const params = new URLSearchParams(formData);
    
    
    
        fetch('/updateTask', {
            method: 'POST',
            body: params
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
        })
        .catch(error => {
            console.error('Error updating task:', error);
        });
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
    
    function goBack() {
        window.history.back();  // Dies bringt den Benutzer zur vorherigen Seite im Verlauf zurück
    }
    