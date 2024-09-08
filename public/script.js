 document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new URLSearchParams(new FormData(this)).toString();

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
        .then(response => response.text())
        .then(result => {
            document.getElementById('result').textContent = result;
        })
        .catch(error => {
            document.getElementById('result').textContent = 'Fehler bei der Registrierung.';
            console.error('Fehler:', error);
        });
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new URLSearchParams(new FormData(this)).toString();

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Bei erfolgreicher Anmeldung weiterleiten
                window.location.href = '/dashboard'; // Ersetze '/dashboard' durch den Pfad zur neuen Seite
            } else {
                document.getElementById('result').textContent = result.message;
            }
        })
        .catch(error => {
            document.getElementById('result').textContent = 'Fehler bei der Anmeldung.';
            console.error('Fehler:', error);
        });
});