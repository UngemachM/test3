const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const session = require('express-session');

const app = express();
const port = 3001;

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

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
        const rank = results[0].rank;

        // Passwort vergleichen
        if (password === storedPassword) {
            req.session.loggedIn = true;
            req.session.username = username;
            console.log(req.session.username)
            req.session.rank = rank;

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
    res.sendFile(path.join(__dirname, 'public', 'projectboard.html'));
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
        db.query(insertTaskSql, [taskname, prio, owner, assigned, `commentFiles/${filename}`, description, "1"], (err, result) => {
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
    const sql = 'SELECT * FROM tasks';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error fetching tasks.');
        }
        console.log('Tasks fetched:', results); // Debug-Ausgabe
        res.json(results); // JSON-Antwort senden
    });
});
app.get('/taskDetail', (req, res) => {
    const taskname = req.query.taskname;
    if (!taskname) {
        return res.status(400).send('Taskname is required.');
    }

    // Hole den Task aus der Datenbank basierend auf dem taskname
    db.query('SELECT * FROM tasks WHERE taskname = ?', [taskname], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).send('Task not found.');
        }

        // Task-Daten erfolgreich abgerufen, jetzt rendern wir die EJS-Seite
        res.render('taskDetail', { task: results[0] });
    });
});


// Route zum Aktualisieren der Task-Details
app.post('/updateTask', (req, res) => {
    const { taskname, prio, owner, assigned, description, comments } = req.body;
    console.log(req)

    if (!taskname || prio === undefined || owner === undefined || assigned === undefined || description === undefined) {
        return res.status(400).send('All fields are required1.'+taskname+prio+owner+assigned+description);
    }

    // Update der Task in der Datenbank
    db.query('UPDATE tasks SET prio = ?, owner = ?, assigned = ?, description = ? WHERE taskname = ?',
        [prio, owner, assigned, description, taskname],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Speichern des Kommentars, falls vorhanden
            if (comments) {
                const currentUser = req.session.username;
                console.log(currentUser) // Benutzername aus der Session
                db.query('INSERT INTO comments (text, user, time, taskname) VALUES (?, ?, NOW(), ?)',
                    [comments, currentUser, taskname],
                    (err, results) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.send('Task updated and comment saved.');
                    });
            } else {
                res.send('Task updated.');
            }
        });
});

app.post('/getComments', (req, res) => {
    const taskname = req.body.taskname;
   // Taskname aus dem POST-Body erhalten

    if (!taskname) {
        return res.status(400).send('No task name provided.');
    }

    const query = `
        SELECT * FROM comments WHERE taskname = ?
        ORDER BY time DESC
    `;

    db.query(query, [taskname], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).send('Database query error.');
        }

        let commentsHtml = '';
        results.forEach(comment => {
            commentsHtml += `
                <div class="comment">
                    <div class="comment-author">${comment.user}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-time">${new Date(comment.time).toLocaleString()}</div>
                </div>
            `;
        });

        if (results.length === 0) {
            commentsHtml = '<p>No comments available.</p>';
        }

        res.send(commentsHtml); // HTML-Antwort senden
    });
});






app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
