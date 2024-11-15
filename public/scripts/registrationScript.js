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
            document.getElementById('result').textContent = 'Error registering';
            console.error('Error:', error);
        });
});


function goBack() {
    const prevPage = document.referrer || window.history.back(); // Holt die URL der vorherigen Seite oder navigiert zurück
    if (prevPage) {
        // Fügt einen Cache-Busting-Parameter (`reload=true`) hinzu, um sicherzustellen, dass die vorherige Seite aktualisiert wird
        window.location.href = prevPage + (prevPage.includes('?') ? '&' : '?') + 'reload=true';
    } else {
        // Fallback: Gehe zurück zur vorherigen Seite, wenn `document.referrer` nicht verfügbar ist
        window.history.back();
        setTimeout(() => {
            location.reload(); // Erzwingt ein Neuladen der Seite
        }, 100); // Verzögerung, um sicherzustellen, dass die Navigation abgeschlossen ist
    }
}