document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }

    const phaseHeaders = document.querySelectorAll('.phase-header');
    phaseHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const isActive = body.classList.contains('active');
            document.querySelectorAll('.phase-body').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.phase-header').forEach(h => h.classList.remove('active'));
            if (!isActive) {
                body.classList.add('active');
                header.classList.add('active');
            }
        });
    });

    if (phaseHeaders.length > 0) {
        phaseHeaders[0].click();
    }

    loadTracker();
});

function loadTracker() {
    const data = JSON.parse(localStorage.getItem('gwssTracker') || '[]');
    renderTracker(data);
}

function addLog() {
    const dateInput = document.getElementById('logDate');
    const hoursInput = document.getElementById('logHours');
    const activityInput = document.getElementById('logActivity');

    const date = dateInput.value;
    const hours = parseFloat(hoursInput.value);
    const activity = activityInput.value.trim();

    if (!date || isNaN(hours) || hours <= 0 || !activity) {
        alert('Please fill in all fields.');
        return;
    }

    const data = JSON.parse(localStorage.getItem('gwssTracker') || '[]');
    data.push({ date, hours, activity, id: Date.now() });
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('gwssTracker', JSON.stringify(data));

    renderTracker(data);

    hoursInput.value = '';
    activityInput.value = '';
    dateInput.value = '';
    dateInput.focus();
}

function deleteLog(id) {
    let data = JSON.parse(localStorage.getItem('gwssTracker') || '[]');
    data = data.filter(entry => entry.id !== id);
    localStorage.setItem('gwssTracker', JSON.stringify(data));
    renderTracker(data);
}

function renderTracker(data) {
    const tbody = document.getElementById('trackerBody');
    const totalEl = document.getElementById('totalHours');
    const fillEl = document.getElementById('progressFill');

    tbody.innerHTML = '';
    let total = 0;

    data.forEach(entry => {
        total += entry.hours;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${entry.hours}</td>
            <td>${escapeHtml(entry.activity)}</td>
            <td><button onclick="deleteLog(${entry.id})">Remove</button></td>
        `;
        tbody.appendChild(row);
    });

    totalEl.textContent = total.toFixed(1);
    const pct = Math.min((total / 25) * 100, 100);
    fillEl.style.width = pct + '%';
}

function exportLog() {
    const data = JSON.parse(localStorage.getItem('gwssTracker') || '[]');
    if (data.length === 0) {
        alert('No entries to export.');
        return;
    }

    let csv = 'Date,Hours,Activity\n';
    data.forEach(entry => {
        csv += `"${entry.date}",${entry.hours},"${entry.activity.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gwss-practicum-hours.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
