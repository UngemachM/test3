const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2'); // Importiere mysql2

const app = express();
const port = 3000;

// Middleware zum Parsen von Formulardaten
app.use(bodyParser.urlencoded({ extended: true }));

// Statische Dateien (HTML, CSS, JS) aus dem aktuellen Verzeichnis bedienen
app.use(express.static(path.join(__dirname, 'public')));
// MySQL-Datenbankverbindung konfigurieren
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'name_db'
});

// Verbindung zur Datenbank herstellen
connection.connect((err) => {
    if (err) {
        console.error('Fehler beim Verbinden zur Datenbank:', err);
        return;
    }
    console.log('Erfolgreich mit der Datenbank verbunden.');
});

// POST-Route zum Verarbeiten des Formulars
app.post('/submit', (req, res) => {
    
    const namet = req.body.name;

    // SQL-Query, um den Namen in die Tabelle einzufügen
    const query = 'INSERT INTO namen (name) VALUES (?)';

    // Führe die Datenbankabfrage aus
    console.log(namet)
    connection.query(query, [namet], (error, results) => {
        if (error) {
            console.error('2222Fehler beim Einfügen in die Datenbank:', error);
            return res.status(500).send('Fehler beim Einfügen in die Datenbank.');
        }
        // Erfolgreiche Einfügung, sende Bestätigungsnachricht
        res.send(`Hallo, ${namet}! Dein Name wurde erfolgreich in die Datenbank eingetragen.`);
    });
});


// GET-Route zum Auslesen der Daten
app.get('/benutzer', (req, res) => {
    connection.query('SELECT * FROM namen', (error, results) => {
        if (error) {
            console.error('Fehler beim Auslesen der Daten:', error);
            return res.status(500).send('Fehler beim Auslesen der Daten.');
        }
        res.json(results); // Sende die Daten als JSON zurück
    });
});

// Starte den Server
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
