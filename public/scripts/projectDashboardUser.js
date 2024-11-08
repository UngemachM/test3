
// JavaScript to go back to "Projects Overview"
document.getElementById('overview-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
    document.getElementById('edit-input-project-container').style.display = 'none'; // hide edit project section
    restoreDetailsButtons();
});





// Event delegation for dynamic elements like the "View Details" button
document.addEventListener('click', function (event) {
    // Handle 'View Details' button click
    if (event.target.classList.contains('project-details-btn')) {
        const projectRow = event.target.closest('tr');
        const projectId = projectRow.dataset.projectId; // Assuming the project ID is stored in a data attribute
        const projectName = projectRow.children[0].textContent; // Assuming the project name is in the first column

        // Redirect to the dashboard with the project ID and name as query parameters
        window.location.href = `/taskDashboard.html?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`;
    }

    // Handle 'Edit This Project' button click
    if (event.target.id === 'project-details-btn-edit') {
        document.getElementById('new-project-container').style.display = 'none'; // hide new project section
        document.getElementById('main-container').style.display = 'none'; // hide main project section
        document.getElementById('edit-input-project-container').style.display = 'block'; // show edit project section
        document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("Loading projects...");

    fetch('/projects')
        .then(response => response.json())
        .then(data => {
            console.log('Projects fetched:', data);

            // Get the tbody element
            const tableBody = document.getElementById('project-body');
            
            // Set innerHTML to new content
            tableBody.innerHTML = data.map(project => `
                <tr data-project-id="${project.id}"> <!-- Assuming project has an id -->
                    <td>${project.projectname}</td>
                    <td class="project-details">${project.projectDetails}</td>
                    <td>
                        <button class="project-details-btn">View Details</button>
                    </td>
                </tr>
            `).join(''); // join('') combines all rows into a single HTML string

        })
        .catch(error => console.error('Error fetching projects:', error));
});
