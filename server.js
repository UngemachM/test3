const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session'); // Session Middleware

const app = express();
const port = 3000;

// Middleware zum Parsen von Formulardaten
app.use(bodyParser.urlencoded({ extended: true }));

// Statische Dateien (HTML, CSS, JS) aus dem aktuellen Verzeichnis bedienen
app.use(express.static(path.join(__dirname, 'public')));

// MySQL-Datenbankverbindung konfigurieren
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'name_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Datenbank verbunden.');
});

// Session-Konfiguration
app.use(session({
    secret: 'geheimnisvollerSchlüssel', // Ersetze durch einen echten geheimen Schlüssel
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // Sitzung läuft nach 10 Minuten ab
}));

// Route zum Registrieren
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const sql = 'INSERT INTO namen (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            res.status(500).send('Fehler bei der Registrierung.');
            return;
        }
        res.send('Registrierung erfolgreich!');
    });
});

// Route zum Anmelden
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT password FROM namen WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            res.status(500).send('Fehler bei der Anmeldung.');
            return;
        }

        if (results.length === 0) {
            res.json({ success: false, message: 'Benutzername nicht gefunden.' });
            return;
        }

        const storedPassword = results[0].password;

        // Passwort vergleichen
        if (password === storedPassword) {
            // Benutzer ist eingeloggt, Session setzen
            req.session.loggedIn = true;
            req.session.username = username;
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Falsches Passwort.' });
        }
    });
});

// Middleware zum Überprüfen, ob der Benutzer eingeloggt ist
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    } else {
        res.redirect('/'); // Leite zurück zur Startseite oder Login-Seite, wenn nicht eingeloggt
    }
}

// Route zum Dashboard (geschützt)
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Route zum Abmelden
app.post('/logout', (req, res) => {
    // Session zerstören
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Fehler beim Abmelden.');
        }
        res.redirect('/'); // Zurück zur Startseite nach Abmeldung
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
