// JavaScript to toggle the "New Project" form
document.getElementById('new-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'block';
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
    document.getElementById('edit-input-project-container').style.display = 'none'; // hide edit project section
});

// JavaScript to go back to "Projects Overview"
document.getElementById('overview-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
    document.getElementById('edit-input-project-container').style.display = 'none'; // hide edit project section
    restoreDetailsButtons();
});

// JavaScript to show "Edit Project" form and hide "New Project" form
document.getElementById('edit-project-link').addEventListener('click', function () {
    document.getElementById('new-project-container').style.display = 'none'; // hide new project section
    document.getElementById('main-container').style.display = 'none'; // hide main project section
    document.getElementById('edit-project-container').style.display = 'block'; // show edit project section
    document.getElementById('edit-input-project-container').style.display = 'none'; // hide edit project section
});

// Restore "View Details" buttons when switching back to Projects Overview
function restoreDetailsButtons() {
    var detailsButtons = document.querySelectorAll('#project-view a.btn-details');
    detailsButtons.forEach(function (button) {
        button.textContent = 'View Details';
    });
}

// Event delegation for dynamic elements like the "Edit This Project" button
document.addEventListener('click', function (event) {
    // Handle 'View Details' button click
    if (event.target.id === 'project-details-btn') {
        document.getElementById('new-project-container').style.display = 'none'; // hide new project section
        document.getElementById('main-container').style.display = 'none'; // hide main project section
        document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
        document.getElementById('edit-input-project-container').style.display = 'none'; // hide edit project section
    }

    // Handle 'Edit This Project' button click
    if (event.target.id === 'project-details-btn-edit') {
        document.getElementById('new-project-container').style.display = 'none'; // hide new project section
        document.getElementById('main-container').style.display = 'none'; // hide main project section
        document.getElementById('edit-input-project-container').style.display = 'block'; // show edit project section
        document.getElementById('edit-project-container').style.display = 'none'; // hide edit project section
    }
});
