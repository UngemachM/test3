const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const session = require('express-session');
const config = require("./config.json"); // Konfiguration aus der JSON-Datei einbinden

const app = express();
const port = config.port || 3001; // Port aus der Konfiguration oder Standardport

// Middleware zum Parsen von Formulardaten
app.use(bodyParser.urlencoded({ extended: true }));

// Statische Dateien (HTML, CSS, JS) aus dem aktuellen Verzeichnis bedienen
app.use(express.static(path.join(__dirname, 'public')));

// MySQL-Datenbankverbindung konfigurieren
const db = mysql.createConnection(config.db);

db.connect(err => {
    if (err) throw err;
    console.log('Datenbank verbunden.');
});

// Session-Konfiguration
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: config.sessionMaxAge }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

// Registrierung eines neuen Benutzers mit Überprüfung ob ein Benutzer bereits existiert und hinzufügen eines Ranges
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    // Überprüfen, ob der Benutzername bereits existiert
    const checkUsernameSql = 'SELECT * FROM users WHERE username = ?';
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
        const checkUserCountSql = 'SELECT COUNT(*) AS count FROM users';
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

            // Benutzer mit entsprechendem Rang und Email in die Datenbank einfügen
            const insertUserSql = 'INSERT INTO users (username, password, email, rank) VALUES (?, ?, ?, ?)';
            db.query(insertUserSql, [username, password, email, rank], (err, result) => {
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

    const sql = 'SELECT password, rank FROM users WHERE username = ?';
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



// Einfügen einer neuen Aufgabe mit Überrprüfung ob eine Task mit dem Namen bereits existiert
app.post('/addTask', (req, res) => {
    const { taskname, prio, owner, assigned, description, project, deadline } = req.body;

<<<<<<< HEAD
    // SQL Abfrage ob eine Aufgabe mit dem Namen bereits existiert
=======
    // SQL query zum überprüfen ob eine Task mit dem Name breits existiert
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
    const checkTaskSql = 'SELECT COUNT(*) AS count FROM tasks WHERE taskname = ? AND projectName = ?';

    // Überprüfen ob eine Aufgabe mit dem Namen bereits existiert
    db.query(checkTaskSql, [taskname, project], (err, result) => {
        if (err) {
            console.error('Datenbankfehler beim Überprüfen der Aufgabe:', err);
            return res.status(500).send('Fehler beim Überprüfen der Aufgabe.');
        }

<<<<<<< HEAD
        // Fehlermeldung wenn Aufgabe mit dem Namen bereits existiert
=======
        // Wenn ein Task mit dem Namen Existirt, gebe fehler aus
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
        if (result[0].count > 0) {
            return res.status(400).send('Es gibt bereits eine Aufgabe mit diesem Namen in diesem Projekt.');
        }

<<<<<<< HEAD
        // Wenn die Aufgabe nicht bereits existiert, füge die Aufgabe ein
=======
        // Wenn keine Task mit dem Namen existiert, füge sie ein
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
        const insertTaskSql = `
            INSERT INTO tasks (taskname, prio, owner, assigned, description, status, projectName, deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Einfügen der Aufgabe in die Datenbank
        db.query(insertTaskSql, [taskname, prio, owner, assigned, description, "1", project, deadline], (err, result) => {
            if (err) {
                console.error('Datenbankfehler:', err);
                return res.status(500).send('Fehler beim Hinzufügen der Aufgabe.');
            }
            res.send('Aufgabe erfolgreich hinzugefügt.');
        });
    });
});




// Route zum Abrufen der Aufgabenerstellungsseite
app.get('/taskCreator', (req, res) => {
<<<<<<< HEAD
    res.sendFile(path.join(__dirname, 'public', 'taskCreator.html'));  //  Seite zur Erstellung von Aufgaben
=======
    res.sendFile(path.join(__dirname, 'public', 'taskCreator.html'));  
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
});

app.post('/getTasks', (req, res) => {
    const projectName = req.body.projectName; // Projektname aus den Formulardaten abrufen


    const sql = 'SELECT taskname, prio, owner, assigned, description, status, deadline FROM tasks WHERE projectname = ?';

    db.query(sql, [projectName], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).send('Fehler beim Abrufen der Aufgaben.');
        }
        if (results.length === 0) {
            return res.status(404).send('Keine Aufgaben gefunden für dieses Projekt.');
        }


        // Hier senden wir die Aufgaben als JSON-Antwort, einschließlich der Deadline
        res.json(results); 
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
<<<<<<< HEAD
// Bereinigen des Tasknamens, um SQL-Injection zu vermeiden
=======

    // Taskname formatiern um SQL Injection zu vermeiden
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
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
    const { taskname, prio, owner, assigned, description, deadline, comments } = req.body;
    console.log(req.body);



    // Update der Task in der Datenbank, einschließlich des kombinierten DateTime-Werts
    db.query('UPDATE tasks SET prio = ?, owner = ?, assigned = ?, description = ?, deadline = ? WHERE taskname = ?',
        [prio, owner, assigned, description, deadline, taskname],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error111: err.message });
            }

            // Wenn ein Kommentar übermittelt wird, diesen speichern
            if (comments) {
                const currentUser = req.session.username;

                // Kommentar in die Datenbank einfügen
                db.query('INSERT INTO comments (text, user, time, taskname) VALUES (?, ?, NOW(), ?)',
                    [comments, currentUser, taskname],
                    (err, results) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.send('Task erfolgreich aktualisiert und Kommentar gespeichert.');
                    });
            } else {
                res.send('Task erfolgreich aktualisiert.');
            }
        });
});


// Route zum Abrufen von Kommentaren
app.post('/getComments', (req, res) => {
    const taskname = req.body.taskname;

    if (!taskname) {
        return res.status(400).send('Kein Taskname bereitgestellt.');
    }


    // SQL-Abfrage zum Abrufen der Kommentare für die angegebene Aufgabe
    const query = `
        SELECT * FROM comments WHERE taskname = ?
        ORDER BY time DESC
    `;

    // Ausführen der Datenbankabfrage
    db.query(query, [taskname], (err, results) => {
        if (err) {  // Fehlerbehandlung
            console.error('Fehler beim Abrufen der Kommentare:', err);
            return res.status(500).send('Datenbankabfragefehler.');
        }

        let commentsHtml = '';
           // Durchlaufen der Ergebnisse und Erstellen der HTML-Struktur
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
    let sql = 'SELECT id,username,rank FROM users';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});


// PUT-Route zum Aktualisieren eines Benutzers
app.put('/users/:userId', (req, res) => {
    console.log("Benutzer wird aktualisiert");

    // Benutzerinformationen aus dem Request-Body extrahieren
    const userId = req.params.userId;
    const { username, rank } = req.body; // Daten aus dem Form-Body extrahieren

    console.log(`Aktualisiere Benutzer mit ID: ${userId}`);
    console.log(`Neuer Rang: ${rank}`);
    console.log(`Neuer Benutzername: ${username}`);


    // SQL-Abfrage zum Aktualisieren des Benutzers in der Datenbank
    const query = 'UPDATE users SET rank = ?, username = ? WHERE id = ?';

    // Datenbankabfrage ausführen, um den Benutzer zu aktualisieren
    db.query(query, [rank, username, userId], (err, result) => {
        if (err) {
            console.error('Fehler beim Aktualisieren des Benutzers:', err);
            return res.status(500).json({ error: 'Fehler beim Aktualisieren des Benutzers' });
        }

        // Überprüfen, ob der Benutzer existiert und aktualisiert wurde
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // Erfolgreiche Antwort senden
        res.json({ message: 'Benutzer erfolgreich aktualisiert' });
    });
});


// Endpoint zum Hinzufügen eines neuen Projekts
app.post('/addProject', (req, res) => {
    const { projectName, projectDetails } = req.body;

    // SQL-Query, um zu überprüfen, ob der Projektname bereits existiert
    const checkProjectSql = 'SELECT * FROM projects WHERE projectname = ?';

    // Überprüfe, ob das Projekt mit dem gleichen Namen schon existiert
    db.query(checkProjectSql, [projectName], (err, result) => {
        if (err) {
            console.error('Fehler bei der Abfrage:', err);
            return res.status(500).send('Fehler bei der Abfrage des Projektnamens.');
        }

        if (result.length > 0) {
            // Wenn der Projektname bereits existiert
            console.error('Ein Projekt mit diesem Namen existiert bereits.');
            return res.status(409).send('namen gibts schon')
        }

        // SQL-Query, um das neue Projekt in die Datenbank zu speichern
        const insertProjectSql = `
            INSERT INTO projects (projectname, projectDetails, progress)
            VALUES (?, ?, 0)
        `;

        // Füge das Projekt in die Datenbank ein
        db.query(insertProjectSql, [projectName, projectDetails], (err, result) => {
            if (err) {
                console.error('Datenbankfehler:', err);
                return res.status(500).send('Fehler beim Hinzufügen des Projekts.');
            }
            res.json({ message: 'Projekt erfolgreich hinzugefügt!' });
        });
    });
});
app.put('/projects/:name', (req, res) => {
    const projectName = req.params.name;
    const { projectDetails, projectProgress } = req.body; 

    const query = 'UPDATE projects SET projectProgress = ?, projectDetails = ? WHERE projectName = ?';
    db.query(query, [projectProgress, projectDetails, projectName], (err, result) => {
        if (err) { // Fehlerbehandlung
            console.error('Datenbankfehler:', err);
            return res.status(500).json({ error: 'Fehler beim Aktualisieren des Projekts' });
        }
        res.json({ message: 'Projekt erfolgreich aktualisiert', updatedProject: { name: projectName, projectProgress, projectDetails } });
    });
});



// Route zum Abrufen aller Projekte
app.get('/projects', (req, res) => {
    const sql = 'SELECT * FROM projects';

    db.query(sql, (err, results) => {
        if (err) { // Fehlerbehandlung
            console.error('Fehler beim Abrufen der Projekte:', err);
            res.status(500).send('Fehler beim Abrufen der Projekte aus der Datenbank');
            return;
        }
        // Sende die Projekte als JSON
        res.json(results);
    });
});


app.post('/projects/tasks', (req, res) => {
<<<<<<< HEAD
    const projectName = req.body.projectName; // Projektname aus den URL-kodierten Formulardaten abrufen

   // SQL-Abfrage zum Auswählen aller erforderlichen Felder
=======
    const projectName = req.body.projectName;


>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
    const sql = 'SELECT taskname, prio, owner, assigned, description, status FROM tasks WHERE projectname = ?'; 
    db.query(sql, [projectName], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
<<<<<<< HEAD
            return res.status(500).send('Fehler beim Abrufen der Aufgaben.'); // Sende eine Fehlermeldung
        }

        if (results.length === 0) {
            return res.status(404).send('Keine Aufgaben gefunden für dieses Projekt.'); // Sende eine Fehlermeldung für keien Aufgabe gefunden
        }

       // Bereite eine Antwort in einem Format vor, das leicht verarbeitet werden kann
=======
            return res.status(500).send('Fehler beim Abrufen der Aufgaben.'); 
        }

        if (results.length === 0) {
            return res.status(404).send('Keine Aufgaben gefunden für dieses Projekt.'); 
        }

        // Antwort Formatieren
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
        const tasksByStatus = results.reduce((acc, task) => {
            const status = task.status; // Status der Aufgabe
            if (!acc[status]) {
<<<<<<< HEAD
                acc[status] = [];// Initialisiere das Array für diesen Status, falls es nicht existiert
=======
                acc[status] = []; 
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
            }
            acc[status].push({
                taskname: task.taskname,
                prio: task.prio,
                owner: task.owner,
                assigned: task.assigned,
                description: task.description,
                status: task.status
<<<<<<< HEAD
            }); // Füge das Aufgabenobjekt dem entsprechenden Status hinzu
            return acc;
        }, {});

       // Formatiere die Aufgaben nach Status in eine Antwortzeichenkette
=======
            }); 
            return acc;
        }, {});

        // Task formatieren
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
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
<<<<<<< HEAD
                    responseString += `---------------------------------\n`; // Trenner für Aufgaben
                });
                responseString += `\n`; // Zusätzliche Leerzeile für den Abstand
            } else {
                responseString += `Progress ${i}:\nKeine Aufgaben gefunden.\n\n`;// Gebe an, dass keine Aufgaben für diesen Fortschritt vorhanden sind
            }
        }
        res.send(responseString); // Sende die nach Status organisierten Aufgaben im Klartext
=======
                    responseString += `---------------------------------\n`; 
                });
                responseString += `\n`; // Spacing
            } else {
                responseString += `Progress ${i}:\nKeine Aufgaben gefunden.\n\n`; //Keine Aufgabe gefunden
            }
        }
        res.send(responseString); //Aufgaben senden
>>>>>>> 57f76f46d30f03f1a45bef6ce0a12d92b0bd46f2
    });
});



app.post('/projects/details', isAuthenticated, (req, res) => {
    const projectName = req.body.projectName; // Den Projectnamen und Rang aus der URL extrahieren

    const sql = 'SELECT name FROM projects WHERE projectname = ?';
    db.query(sql, [projectName], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).send('Fehler beim Abrufen der Projektdaten.'); //Fehlermeldung
        }

        if (results.length === 0) {
            return res.status(404).send('Projekt nicht gefunden.'); // Fehlermeldung Project nicht gefunden
        }

       
        res.send(results[0].name); 
    });
});


// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
