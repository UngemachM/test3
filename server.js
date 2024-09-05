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
    const { username, password, rank } = req.body; // Rank wird auch erfasst

    const sql = 'INSERT INTO namen (username, password, rank) VALUES (?, ?, ?)';
    db.query(sql, [username, password, rank], (err, result) => {
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

    const sql = 'SELECT password, rank FROM namen WHERE username = ?';
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
        const rank = results[0].rank; // Hole den Rank aus der Datenbank

        // Passwort vergleichen
        if (password === storedPassword) {
            // Benutzer ist eingeloggt, Session setzen
            req.session.loggedIn = true;
            req.session.username = username;
            req.session.rank = rank; // Rank in der Session speichern

            // Weiterleitung basierend auf dem Rank
            if (rank === 1) {
                res.redirect('/dashboard1');
            } else if (rank === 2) {
                res.redirect('/dashboard2');
            } else if (rank === 3) {
                res.redirect('/dashboard3');
            } else {
                res.status(403).send('Unbekannter Rang.');
            }
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

// Dashboard-Route für Rank 1
app.get('/dashboard1', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboardUser.html'));
});

// Dashboard-Route für Rank 2
app.get('/dashboard2', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboardManager.html'));
});

// Dashboard-Route für Rank 3
app.get('/dashboard3', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboardAdmin.html'));
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
