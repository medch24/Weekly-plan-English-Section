// public/lesson_functions_new.js

function openLessonPlanModal() {
    const modal = document.getElementById('lessonPlanModal');
    if (!modal) return;
    populateLessonPlanClasses();
    modal.style.display = 'block';
}

function closeLessonPlanModal() {
    document.getElementById('lessonPlanModal').style.display = 'none';
}

function populateLessonPlanClasses() {
    const container = document.getElementById('lessonPlanClassesList');
    container.innerHTML = '';
    const classKey = findHKey('Class');
    const classes = [...new Set(planData.map(r => r[classKey]).filter(Boolean))].sort(compareClasses);
    classes.forEach(cls => {
        const div = document.createElement('div');
        div.innerHTML = `<input type="checkbox" value="${cls}" class="class-checkbox" onchange="updateGenerateButtonState()"> ${cls}`;
        container.appendChild(div);
    });
}

function updateGenerateButtonState() {
    const checked = document.querySelectorAll('.class-checkbox:checked').length;
    document.getElementById('generateAllLessonPlansBtn').disabled = checked === 0;
}

async function startGenerateAllLessonPlans() {
    const selectedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked')).map(cb => cb.value);
    const rows = planData.filter(r => selectedClasses.includes(r[findHKey('Class')]));

    displayAlert(`Generating plans for ${selectedClasses.length} classes...`, false);
    const r = await fetch('/api/generate-multiple-ai-lesson-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: currentWeek, rowsData: rows })
    });
    if (r.ok) {
        const blob = await r.blob();
        saveAs(blob, `AI_Plans_W${currentWeek}.zip`);
        closeLessonPlanModal();
    }
}

async function generateAllDisplayedLessonPlans() {
    if (confirm(`Generate AI plans for all ${filteredAndSortedData.length} displayed rows?`)) {
        displayAlert('Generating...', false);
        const r = await fetch('/api/generate-multiple-ai-lesson-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ week: currentWeek, rowsData: filteredAndSortedData })
        });
        if (r.ok) {
            const blob = await r.blob();
            saveAs(blob, `AI_Plans_W${currentWeek}.zip`);
        }
    }
}
