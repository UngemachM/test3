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

// Registrierung eines neuen Benutzers
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
            req.session.rank = rank;

            res.json({ success: true, rank });
        } else {
            res.status(401).json({ success: false, message: 'Falsches Passwort.' });
        }
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    } else {
        res.redirect('/');
    }
}

// Dashboard-Routen für verschiedene Ränge
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'taskDashboard.html'));
});
app.get('/projectDashboardUser', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'projectDashboardUser.html'));
});
app.get('/projectDashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'projectDashboard.html'));
});
app.get('/projectDashboardAdmin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'projectDashboardAdmin.html'));
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
    const { taskname, prio, owner, assigned, description, project } = req.body;

    // Logging each field to confirm data retrieval
    console.log('Received Data:', {
        taskname,
        prio,
        owner,
        assigned,
        description,
        project
    });

    // SQL query to insert task into the database, including the project
    const insertTaskSql = `
        INSERT INTO tasks (taskname, prio, owner, assigned, description, status, projectName)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Insert task into the database, with project as a field
    db.query(insertTaskSql, [taskname, prio, owner, assigned, description, "1", project], (err, result) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).send('Fehler beim Hinzufügen der Aufgabe.');
        }
        res.send('Aufgabe erfolgreich hinzugefügt.');
    });
});


// Route zum Abrufen der Aufgabenerstellungsseite
app.get('/taskCreator', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'taskCreator.html'));  // Serve your task creation page here
});

// Route zum Abrufen aller Aufgaben für ein bestimmtes Projekt
app.post('/getTasks', (req, res) => {
    const projectName = req.body.projectName; // Projektname aus den Formulardaten abrufen
    const sql = 'SELECT * FROM tasks WHERE projectname = ?'; // SQL-Abfrage mit Filter

    db.query(sql, [projectName], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).send('Fehler beim Abrufen der Aufgaben.');
        }
        if (results.length === 0) {
            return res.status(404).send('Keine Aufgaben gefunden für dieses Projekt.'); // Keine Aufgaben gefunden
        }
        console.log('Aufgaben für Projekt abgerufen:', results); // Debug-Ausgabe
        res.json(results); // JSON-Antwort senden
    });
});

// Route zum Abrufen der Details zu einer bestimmten Aufgabe
app.get('/taskDetail', (req, res) => {
    const taskname = req.query.taskname;

    // Überprüfen, ob der taskname bereitgestellt wurde
    if (!taskname) {
        return res.status(400).send('Taskname ist erforderlich.');
    }

    // Benutzer-Rang aus der Session abrufen
    const userRank = req.session.rank;

    // Sanitizing taskname to avoid SQL injection
    const sanitizedTaskName = taskname.trim();

    // Abfrage der Datenbank für die Aufgabe basierend auf dem taskname
    db.query('SELECT * FROM tasks WHERE taskname = ?', [sanitizedTaskName], (err, results) => {
        if (err) {
            console.error('Datenbankabfragefehler:', err);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }

        if (results.length === 0) {
            return res.status(404).send('Aufgabe nicht gefunden.');
        }

        // Aufgabendaten erfolgreich abgerufen; jetzt die EJS-Seite basierend auf dem Rang rendern
        const task = results[0];
        if (userRank === 1) {
            res.render('taskDetailUser', { task }); // Render für Rang 1 Benutzer
        } else if (userRank === 2) {
            res.render('taskDetailManager', { task }); // Render für Rang 2 Benutzer
            } else if (userRank === 3) {
            res.render('taskDetailManager', { task }); // Render für Rang 2 Benutzer
        } else {
            return res.status(403).send('Zugriff verweigert.'); // Anderen Rängen ggf. behandeln
        }
    });
});

// Route zum Aktualisieren der Task-Details
app.post('/updateTask', (req, res) => {
    const { taskname, prio, owner, assigned, description, comments } = req.body;

    if (!taskname || prio === undefined || owner === undefined || assigned === undefined || description === undefined) {
        return res.status(400).send('Alle Felder sind erforderlich.' + taskname + prio + owner + assigned + description);
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
                db.query('INSERT INTO comments (text, user, time, taskname) VALUES (?, ?, NOW(), ?)',
                    [comments, currentUser, taskname],
                    (err, results) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.send('Task aktualisiert und Kommentar gespeichert.');
                    });
            } else {
                res.send('Task aktualisiert.');
            }
        });
});

// Route zum Abrufen von Kommentaren
app.post('/getComments', (req, res) => {
    const taskname = req.body.taskname;

    if (!taskname) {
        return res.status(400).send('Kein Taskname bereitgestellt.');
    }

    const query = `
        SELECT * FROM comments WHERE taskname = ?
        ORDER BY time DESC
    `;

    db.query(query, [taskname], (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Kommentare:', err);
            return res.status(500).send('Datenbankabfragefehler.');
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
            commentsHtml = '<p>Keine Kommentare verfügbar.</p>';
        }

        res.send(commentsHtml); // HTML-Antwort senden
    });
});

// Route zum Abrufen aller Benutzer
app.get('/users', (req, res) => {
    let sql = 'SELECT username FROM namen';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Route zum Abrufen aller Projekte
app.get('/projects', (req, res) => {
    const sql = 'SELECT * FROM projects';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Projekte:', err);
            res.status(500).send('Fehler beim Abrufen der Projekte aus der Datenbank');
            return;
        }
        // Sende die Projekte als JSON
        res.json(results);
    });
});


app.post('/projects/tasks', (req, res) => {
    const projectName = req.body.projectName; // Get projectName from URL-encoded form data

    // SQL query to select all required fields
    const sql = 'SELECT taskname, prio, owner, assigned, description, status FROM tasks WHERE projectname = ?'; 
    db.query(sql, [projectName], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).send('Fehler beim Abrufen der Aufgaben.'); // Send plain text error message
        }

        if (results.length === 0) {
            return res.status(404).send('Keine Aufgaben gefunden für dieses Projekt.'); // Send plain text for no tasks found
        }

        // Prepare a response in a format that can be easily processed
        const tasksByStatus = results.reduce((acc, task) => {
            const status = task.status; // Get the task status
            if (!acc[status]) {
                acc[status] = []; // Initialize array for this status if it doesn't exist
            }
            acc[status].push({
                taskname: task.taskname,
                prio: task.prio,
                owner: task.owner,
                assigned: task.assigned,
                description: task.description,
                status: task.status
            }); // Add task object to the corresponding status
            return acc;
        }, {});

        // Format the tasks by status into a response string
        let responseString = '';
        for (let i = 1; i <= 5; i++) {
            if (tasksByStatus[i]) {
                responseString += `Progress ${i}:\n`;
                tasksByStatus[i].forEach(task => {
                    responseString += `Task: ${task.taskname}\n`;
                    responseString += `Priority: ${task.prio}\n`;
                    responseString += `Owner: ${task.owner}\n`;
                    responseString += `Assigned: ${task.assigned}\n`;
                    responseString += `Description: ${task.description}\n`;
                    responseString += `Status: ${task.status}\n`;
                    responseString += `---------------------------------\n`; // Divider for tasks
                });
                responseString += `\n`; // Extra newline for spacing
            } else {
                responseString += `Progress ${i}:\nKeine Aufgaben gefunden.\n\n`; // Indicate no tasks for this progress
            }
        }
        res.send(responseString); // Send tasks organized by status as plain text
    });
});


// Respond with plain text for project details
app.post('/projects/details', isAuthenticated, (req, res) => {
    const projectName = req.body.projectName; // Get projectName from URL-encoded form data

    const sql = 'SELECT name FROM projects WHERE projectname = ?'; // Adjust as needed
    db.query(sql, [projectName], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).send('Fehler beim Abrufen der Projektdaten.'); // Send plain text error message
        }

        if (results.length === 0) {
            return res.status(404).send('Projekt nicht gefunden.'); // Send plain text for project not found
        }

        // Return project name as plain text
        res.send(results[0].name); // Send project name as plain text
    });
});


// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
