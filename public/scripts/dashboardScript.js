function loadTasks() {
    fetch('/getTasks')
        .then(response => response.json())
        .then(tasks => {
            for (let i = 1; i <= 5; i++) {
                const column = document.getElementById('progress' + i);
                if (column) {
                    column.innerHTML = `<h2>Progress ${i}</h2>`;
                }
            }

            tasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.classList.add('task-card');
                taskCard.innerHTML = `
                    <h3>${task.taskname}</h3>
                    <p>Priority: ${task.prio}</p>
                    <p>Owner: ${task.owner}</p>
                    <p>Assigned: ${task.assigned}</p>
                    <p>Description: ${task.description}</p>
                    <button onclick="window.location.href='/taskDetail?taskname=${encodeURIComponent(task.taskname)}'" class="details-btn">Details</button>
                `;
                document.getElementById('progress' + task.prio).appendChild(taskCard);
            });
        })
        .catch(err => {
            console.error('Error loading tasks:', err);
        });
}

window.onload = loadTasks;