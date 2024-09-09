const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs'); 
const session = require('express-session');

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
    secret: 'geheimnisvollerSchlüssel',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}));

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Überprüfen, ob der Benutzername bereits existiert
    const checkUsernameSql = 'SELECT * FROM namen WHERE username = ?';
    db.query(checkUsernameSql, [username], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            res.status(500).send('Fehler bei der Registrierung.');
            return;
        }

        // Falls Benutzername bereits existiert, Fehlermeldung zurückgeben
        if (results.length > 0) {
            res.status(400).send('Benutzername ist bereits vergeben. Bitte wähle einen anderen.');
            return;
        }

        // Zuerst prüfen, ob bereits Benutzer existieren
        const checkUserCountSql = 'SELECT COUNT(*) AS count FROM namen';
        db.query(checkUserCountSql, (err, results) => {
            if (err) {
                console.error('Datenbankfehler:', err);
                res.status(500).send('Fehler bei der Registrierung.');
                return;
            }

            const userCount = results[0].count;
            let rank;

            // Wenn keine Benutzer existieren, erhalte den Rang 3, sonst 1
            if (userCount === 0) {
                rank = 3;
            } else {
                rank = 1;
            }

            // Benutzer mit entsprechendem Rang in die Datenbank einfügen
            const insertUserSql = 'INSERT INTO namen (username, password, rank) VALUES (?, ?, ?)';
            db.query(insertUserSql, [username, password, rank], (err, result) => {
                if (err) {
                    console.error('Datenbankfehler:', err);
                    res.status(500).send('Fehler bei der Registrierung.');
                    return;
                }
                res.send('Registrierung erfolgreich! Dein Rang ist ' + rank);
            });
        });
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

            // Erfolg und Rank zurückgeben
            res.json({ success: true, rank });
        } else {
            res.status(401).json({ success: false, message: 'Falsches Passwort.' });
        }
    });
});

// Middleware zum Überprüfen, ob der Benutzer eingeloggt ist
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    } else {
        res.redirect('/');
    }
}

// Dashboard-Routen für verschiedene Ränge
app.get('/dashboardUser', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboardUser.html'));
});

app.get('/dashboardManager', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboardManager.html'));
});

app.get('/dashboardAdmin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboardAdmin.html'));
});

// Route zum Abmelden
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Fehler beim Abmelden.');
        }
        res.redirect('/');
    });
});
// Serve static files from the "commentFiles" directory
app.use('/commentFiles', express.static(path.join(__dirname, 'commentFiles')));

// Sicherstellen, dass das Verzeichnis für Kommentar-Dateien existiert
const commentFilesDir = path.join(__dirname, 'commentFiles');
if (!fs.existsSync(commentFilesDir)) {
    fs.mkdirSync(commentFilesDir, { recursive: true });
}

app.post('/addTask', (req, res) => {
    const { taskname, prio, owner, assigned, description } = req.body;

    // Generieren des Dateinamens
    const filename = `${taskname.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
    const filePath = path.join(commentFilesDir, filename);

    // Schreiben in die Datei
    fs.writeFile(filePath, description, (err) => {
        if (err) {
            console.error('Fehler beim Schreiben der Datei:', err);
            return res.status(500).send('Fehler beim Speichern der Datei.');
        }

        // Füge die Aufgabe in die Datenbank ein, einschließlich des relativen Dateipfads
        const insertTaskSql = 'INSERT INTO tasks (taskname, prio, owner, assigned, commentfilepath, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(insertTaskSql, [taskname, prio, owner, assigned, `commentFiles/${filename}`, description,"1"], (err, result) => {
            if (err) {
                console.error('Datenbankfehler:', err);
                return res.status(500).send('Fehler beim Hinzufügen der Aufgabe.');
            }
            res.send('Aufgabe erfolgreich hinzugefügt.');
        });
    });
});

// Route to retrieve tasks from the database and send to frontend
app.get('/getTasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error fetching tasks.');
        }
        res.json(results);  // Send tasks as JSON
    });
});

app.get('/taskCreator', (req, res) => {
    res.sendFile(__dirname + '/public/taskCreator.html');  // Serve your task creation page here
});

// Route to retrieve tasks from the database and send to frontend
app.get('/getTasks', (req, res) => {
    // SQL query to select all tasks from the database
    const sql = 'SELECT * FROM tasks';

    // Execute the query
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            // Send an error response if the query fails
            return res.status(500).send('Error fetching tasks.');
        }

        // Send the retrieved tasks as JSON
        res.json(results);
    });
});
app.get('/taskDetail', (req, res) => {
    const taskname = req.query.taskname;
    const sql = 'SELECT * FROM tasks WHERE taskname = ?';
    console.log(sql)
    db.query(sql, [taskname], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error fetching task details.');
        }
        if (results.length > 0) {
            res.json(results[0]);  // Send the task details as JSON
        } else {
            res.status(404).send('Task not found.');
        }
    });
});


app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
