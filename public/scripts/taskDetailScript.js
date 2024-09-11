
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
            console.error('Error fetching comments:', error);
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
    
    
        
        fetch('/updateTask', {
            method: 'POST',
            body: new URLSearchParams(formData)
        })
        .then(response => response.text())
        .then(data => {
            // Erfolgsnachricht anzeigen oder zur Task-Übersicht weiterleiten
            alert(data);
            // Alternativ kannst du hier zu einer anderen Seite weiterleiten:
            // window.location.href = '/dashboard';
        })
        .catch(error => {
            console.error('Fehler beim Aktualisieren der Aufgabe:', error);
        });
    }
    
    // Lade die Kommentare, wenn die Seite geladen wird
    document.addEventListener('DOMContentLoaded', () => {
        const taskname = document.getElementById('taskname').value;
        loadComments(taskname);
    });
    