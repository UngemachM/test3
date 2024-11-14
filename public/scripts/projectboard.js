// JavaScript, um das Formular für "Neues Projekt" umzuschalten
document.getElementById('new-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'block';
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('edit-project-container').style.display = 'none'; // Abschnitt zum Bearbeiten des Projekts ausblenden
    document.getElementById('edit-input-project-container').style.display = 'none'; // Bearbeitungsbereich ausblenden
});

// JavaScript, um zur "Projektübersicht" zurückzukehren
document.getElementById('overview-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    document.getElementById('edit-project-container').style.display = 'none'; // Abschnitt zum Bearbeiten des Projekts ausblenden
    document.getElementById('edit-input-project-container').style.display = 'none'; // Bearbeitungsbereich ausblenden
    restoreDetailsButtons();
});

// JavaScript, um das Formular "Projekt bearbeiten" anzuzeigen und das Formular "Neues Projekt" auszublenden
document.getElementById('edit-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none'; // neuen Projektbereich ausblenden
    document.getElementById('main-container').style.display = 'none'; // Hauptprojektbereich ausblenden
    document.getElementById('edit-project-container').style.display = 'block'; // Bearbeitungsbereich für das Projekt anzeigen
    document.getElementById('edit-input-project-container').style.display = 'none'; // Bearbeitungsbereich ausblenden
});

// "Details anzeigen"-Schaltflächen wiederherstellen, wenn zur Projektübersicht gewechselt wird
function restoreDetailsButtons() {
    var detailsButtons = document.querySelectorAll('#project-view a.btn-details');
    detailsButtons.forEach(function (button) {
        button.textContent = 'View Details';
    });
}

// Ereignisdelegierung für dynamische Elemente wie den "Dieses Projekt bearbeiten"-Button
document.addEventListener('click', function (event) {
  // Klick auf den Button "Details anzeigen" behandeln
    if (event.target.id === 'project-details-btn') {
        document.getElementById('new-project-container').style.display = 'none'; // neuen Projektbereich ausblenden
        document.getElementById('main-container').style.display = 'none'; // Hauptprojektbereich ausblenden
        document.getElementById('edit-project-container').style.display = 'none'; // Bearbeitungsbereich für das Projekt ausblenden
        document.getElementById('edit-input-project-container').style.display = 'none'; // Bearbeitungsbereich ausblenden
    }
    
// Klick auf den Button "Dieses Projekt bearbeiten" behandeln
    if (event.target.id === 'project-details-btn-edit') {
        document.getElementById('new-project-container').style.display = 'none';// neuen Projektbereich ausblenden
        document.getElementById('main-container').style.display = 'none'; // Hauptprojektbereich ausblenden
        document.getElementById('edit-input-project-container').style.display = 'block'; // Bearbeitungsbereich für das Projekt anzeigen
        document.getElementById('edit-project-container').style.display = 'none'; // Bearbeitungsbereich ausblenden
    }
});
