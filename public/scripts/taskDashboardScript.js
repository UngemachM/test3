function loadTasks() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectName = urlParams.get('projectName'); // Projektname aus den URL-Parametern extrahieren

    // Formulardaten für die Anfrage vorbereiten
    const formData = new URLSearchParams();
    formData.append('projectName', projectName); // Projektname hinzufügen

    fetch('/getTasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Setze den Inhaltstyp für URL-codierte Daten
        },
        body: formData.toString() // Sende die Formulardaten
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Erwarte eine JSON-Antwort
        })
        .then(tasks => {
            // Vorhandene Inhalte in den Fortschrittsspalten zurücksetzen
            for (let i = 1; i <= 5; i++) {
                const column = document.getElementById('progress' + i);
                if (column) {
                    column.innerHTML = `<h2>Progress ${i}</h2>`; // Spaltenüberschrift setzen
                }
            }

            // Aufgaben in die entsprechenden Spalten hinzufügen
            tasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.classList.add('task-card');

                // Datum formatieren (optional)
                const deadline = task.deadline ? new Date(task.deadline) : null;
                const formattedDeadline = deadline ? `${deadline.getDate().toString().padStart(2, '0')}.${(deadline.getMonth() + 1).toString().padStart(2, '0')}.${deadline.getFullYear()} ${deadline.getHours().toString().padStart(2, '0')}:${deadline.getMinutes().toString().padStart(2, '0')}` : 'No deadline';

                // Überprüfen, ob die Deadline in der Vergangenheit liegt
                if (deadline && deadline < new Date()) {
                    taskCard.style.background = 'linear-gradient(145deg, #ffdddd, #ffbbbb)'; // Soft, diagonal gradient for depth
                    taskCard.style.border = '1px solid #ff8888'; // Light border for a cleaner outline
                    taskCard.style.borderRadius = '12px'; // Smooth rounded corners for elegance
                    taskCard.style.boxShadow = '0 8px 16px rgba(255, 136, 136, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1)'; // Soft glow and shadow
                    taskCard.style.padding = '15px'; // Extra padding for spacious design
                    taskCard.style.color = '#882222'; // Darker red text color for contrast
                    taskCard.style.fontWeight = '500'; // Medium weight for text emphasis
                    taskCard.style.transition = 'all 0.4s ease'; // Smooth transition for all style properties
                }

                taskCard.innerHTML = `
                <h3>${task.taskname}</h3>
                <p>Priority: ${task.prio}</p>
                <p>Owner: ${task.owner}</p>
                <p>Assigned: ${task.assigned}</p>
                <p>Description: ${task.description}</p>
                <p><strong>Deadline: </strong>${formattedDeadline}</p>  <!-- Deadline anzeigen -->
                <button onclick="window.location.href='/taskDetail?taskname=${encodeURIComponent(task.taskname)}'" class="details-btn">Details</button>
            `;
                document.getElementById('progress' + task.status).appendChild(taskCard); // Aufgabenkarten in die entsprechende Spalte hinzufügen
            });
        })
        .catch(err => {
            console.error('Error loading tasks:', err); // Fehlerprotokollierung
        });
}
function goBack() {
    window.history.back();  // Dies bringt den Benutzer zur vorherigen Seite im Verlauf zurück
}


window.onload = loadTasks; // Aufgaben laden, wenn die Seite geladen wird
