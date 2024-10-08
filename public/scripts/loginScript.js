
        

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
                if (result.rank === 1) {
                        window.location.href = '/dashboardUser';
                    } else if (result.rank === 2) {
                        window.location.href = '/dashboardManager';
                    } else if (result.rank === 3) {
                        window.location.href = '/dashboardAdmin';
                    }
                } else {
                    // Zeige Fehlermeldung an
                    document.getElementById('result').textContent = result.message;
                }
        })
        .catch(error => {
            document.getElementById('result').textContent = 'Fehler bei der Anmeldung.';
            console.error('Fehler:', error);
        });
});