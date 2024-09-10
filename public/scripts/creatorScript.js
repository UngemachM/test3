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