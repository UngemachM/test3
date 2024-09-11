
    function loadComments(taskname) {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);

        fetch('/getComments', {
            method: 'POST',
            body: new URLSearchParams(formData)
        })
        .then(response => response.text())
        .then(commentsHtml => {
            const commentsSection = document.getElementById('commentsSection');
            commentsSection.innerHTML = commentsHtml; // HTML-Inhalt einfügen
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const taskname = document.getElementById('taskname').value;
        loadComments(taskname);
    });
