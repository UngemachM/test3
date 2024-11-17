const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const session = require('express-session');
const config = require("./config.json"); // Konfiguration aus der JSON-Datei einbinden
const nodemailer = require('nodemailer');

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
    console.log('database connected.');
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

// Registrierung eines neuen Benutzers
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    // Überprüfen, ob der Benutzername bereits existiert
    const checkUsernameSql = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUsernameSql, [username], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            res.status(500).send('Error registering in.');
            return;
        }

        // Falls Benutzername bereits existiert, Fehlermeldung zurückgeben
        if (results.length > 0) {
            res.status(400).send('Username already exists.');
            return;
        }

        // Zuerst prüfen, ob bereits Benutzer existieren
        const checkUserCountSql = 'SELECT COUNT(*) AS count FROM users';
        db.query(checkUserCountSql, (err, results) => {
            if (err) {
                console.error('Datenbankfehler:', err);
                res.status(500).send('Error registering in.');
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
                    res.status(500).send('Error while loading database');
                    return;
                }
                res.send('Registration successful , your rank is :' + rank);
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
            res.status(500).send('Login failed.');
            return;
        }

        if (results.length === 0) {
            res.json({ success: false, message: 'Username not found.' });
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
    const { taskname, prio, owner, assigned, description, project, deadline } = req.body;

    // SQL query zum überprüfen ob eine Task mit dem Name breits existiert
    const checkTaskSql = 'SELECT COUNT(*) AS count FROM tasks WHERE taskname = ? AND projectName = ?';

    // Check if a task with the same name already exists in the database
    db.query(checkTaskSql, [taskname, project], (err, result) => {
        if (err) {
            console.error('Datenbankfehler beim Überprüfen der Aufgabe:', err);
            return res.status(500).send('Fehler beim Überprüfen der Aufgabe.');
        }

        // Wenn ein Task mit dem Namen Existirt, gebe fehler aus
        if (result[0].count > 0) {
            return res.status(400).send('Es gibt bereits eine Aufgabe mit diesem Namen in diesem Projekt.');
        }

        // Wenn keine Task mit dem Namen existiert, füge sie ein
        const insertTaskSql = `
            INSERT INTO tasks (taskname, prio, owner, assigned, description, status, projectName, deadline)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Insert the task into the database
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
    res.sendFile(path.join(__dirname, 'public', 'taskCreator.html'));
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

    // Taskname formatiern um SQL Injection zu vermeiden
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
            return res.redirect('/');
        }
    });
});

app.post('/updateTask', (req, res) => {
    const { taskname, prio, owner, assigned, description, deadline, time, comments, status } = req.body;
    const combinedDeadline = `${deadline} ${time}`;    // Validierung: Taskname ist erforderlich
    if (!taskname) {
        return res.status(400).json({ error: 'Taskname is required.' });
    }

    // Dynamisches SQL-Query erstellen
    const fieldsToUpdate = [];
    const values = [];

    if (prio) {
        fieldsToUpdate.push('prio = ?');
        values.push(prio);
    }
    if (owner) {
        fieldsToUpdate.push('owner = ?');
        values.push(owner);
    }
    if (assigned) {
        fieldsToUpdate.push('assigned = ?');
        values.push(assigned);
    }
    if (description) {
        fieldsToUpdate.push('description = ?');
        values.push(description);
    }
    if (deadline) {
        fieldsToUpdate.push('deadline = ?');
        values.push(combinedDeadline);
    }
    if (status) {
        fieldsToUpdate.push('status = ?');
        values.push(status);
    }

    // Wenn keine Felder aktualisiert werden sollen
    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: 'No fields provided to update.' });
    }

    // Task-Name am Ende hinzufügen (WHERE-Bedingung)
    const updateTaskQuery = `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE taskname = ?`;
    values.push(taskname);

    // Query ausführen
    db.promise().query(updateTaskQuery, values)
        .then(() => {
            if (comments) {
                const currentUser = req.session.username || 'Anonymous'; // Fallback auf "Anonymous", falls kein Benutzer eingeloggt ist
                const insertCommentQuery = 'INSERT INTO comments (text, user, time, taskname) VALUES (?, ?, NOW(), ?)';

                return db.promise().query(insertCommentQuery, [comments, currentUser, taskname]);
            }
            return null; // Kein Kommentar zu speichern
        })
        .then(() => {
            // Erfolgsmeldung senden
            res.send('Task erfolgreich aktualisiert' + (comments ? ' und Kommentar gespeichert.' : '.'));
            
        })
        .catch(err => {
            console.error('Fehler bei der Aktualisierung der Aufgabe:', err);
            res.status(500).json({ error: 'Fehler bei der Aktualisierung der Aufgabe. Bitte versuchen Sie es später erneut.' });
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
            INSERT INTO projects (projectname, projectDetails, projectProgress)
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
        if (err) {
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
    const projectName = req.body.projectName;


    const sql = 'SELECT taskname, prio, owner, assigned, description, status FROM tasks WHERE projectname = ?';
    db.query(sql, [projectName], (err, results) => {
        if (err) {
            console.error('Datenbankfehler:', err);
            return res.status(500).send('Fehler beim Abrufen der Aufgaben.');
        }

        if (results.length === 0) {
            return res.status(404).send('Keine Aufgaben gefunden für dieses Projekt.');
        }

        // Antwort Formatieren
        const tasksByStatus = results.reduce((acc, task) => {
            const status = task.status; // Get the task status
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push({
                taskname: task.taskname,
                prio: task.prio,
                owner: task.owner,
                assigned: task.assigned,
                description: task.description,
                status: task.status
            });
            return acc;
        }, {});

        // Task formatieren
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
                    responseString += `---------------------------------\n`;
                });
                responseString += `\n`; // Spacing
            } else {
                responseString += `Progress ${i}:\nKeine Aufgaben gefunden.\n\n`; //Keine Aufgabe gefunden
            }
        }
        res.send(responseString); //Aufgaben senden
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


// Nodemailer-Konfiguration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail oder anderer Service
    auth: {
        user: config.email.user, // Email-Adresse aus der Konfigurationsdatei
        pass: config.email.pass  // Passwort oder App-Passwort
    }
});

// Funktion zum Versenden von Emails
function sendEmail(to, subject, text) {
    const mailOptions = {
        from: config.email.user,
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}
// Deadlines prüfen und E-Mails senden
function checkDeadlinesAndSendEmails() {
    const query = `
        SELECT  tasks.taskname, tasks.deadline, users.email 
        FROM tasks 
        JOIN users ON tasks.owner = users.username 
        WHERE tasks.deadline IS NOT NULL
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Datenbankabfrage-Fehler:', err);
            return;
        }

        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 Stunden in Millisekunden

        results.forEach(row => {
            const deadline = new Date(row.deadline);
            const timeDiff = deadline - now;

            // Falls die Deadline innerhalb der nächsten 24 Stunden liegt
            if (timeDiff <= oneDayInMs && timeDiff > 0) {
                // Überprüfen, ob eine E-Mail schon gesendet wurde (Status = 0)
                db.query('SELECT emailsend FROM tasks WHERE taskname = ?', [row.taskname], (err, result) => {
                    if (err) {
                        console.error('Fehler bei der Überprüfung des E-Mail-Status:', err);
                        return;
                    }

                    const emailSendStatus = result[0]?.emailsend;

                    // Wenn noch keine E-Mail gesendet wurde
                    if (emailSendStatus === 0) {
                        // E-Mail senden
                        sendEmail(
                            row.email,
                            'Aufgabe steht kurz vor Ablauf',
                            `Hallo, die Aufgabe "${row.taskname}" hat eine Deadline am ${deadline}. Bitte bearbeite sie bald.`
                        );

                        // Status auf 1 setzen (E-Mail gesendet)
                        db.query('UPDATE tasks SET emailsend = 1 WHERE taskname = ?', [row.taskname], (err) => {
                            if (err) {
                                console.error('Fehler beim Aktualisieren der Datenbank:', err);
                            }
                        });
                    }
                });
            }

            // Falls die Deadline bereits überschritten ist
            else if (timeDiff <= 0) {
                // Überprüfen, ob eine E-Mail schon gesendet wurde (Status = 0 oder 1)
                db.query('SELECT emailsend FROM tasks WHERE taskname = ?', [row.taskname], (err, result) => {
                    if (err) {
                        console.error('Fehler bei der Überprüfung des E-Mail-Status:', err);
                        return;
                    }

                    const emailSendStatus = result[0]?.emailsend;

                    // Wenn noch keine E-Mail oder bereits eine "24 Stunden"-E-Mail gesendet wurde
                    if (emailSendStatus === 0 || emailSendStatus === 1) {
                        // E-Mail senden
                        sendEmail(
                            row.email,
                            'Deadline überschritten',
                            `Hallo, die Deadline für die Aufgabe "${row.taskname}" ist bereits überschritten (${deadline}).`
                        );

                        // Status auf 2 setzen (abgelaufen)
                        db.query('UPDATE tasks SET emailsend = 2 WHERE taskname = ?', [row.taskname], (err) => {
                            if (err) {
                                console.error('Fehler beim Aktualisieren der Datenbank:', err);
                            }
                        });
                    }
                });
            }
        });
    });
}


// Cron-ähnliche Funktionalität für regelmäßige Prüfungen (jede Stunde)
const intervalInMs = config.email.intervalInMinutes * 60 * 1000; // Intervall aus der Config
setInterval(checkDeadlinesAndSendEmails, intervalInMs); 


// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
