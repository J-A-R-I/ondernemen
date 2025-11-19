// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap’s JS
import * as bootstrap from 'bootstrap'
/**
 * main.js
 * Hoofdtoepassingslogica met beheer van kandidaten en status.
 */

/**
 * main.js
 * Hoofdtoepassingslogica met beheer van kandidaten en status.
 */

import Job from './util/jobModel.js';

const jobs = [];

// DOM Element Selectie
const jobForm = document.getElementById('jobForm');
const jobList = document.getElementById('jobList'); // Tab: Openstaande Jobs
const candidateList = document.getElementById('candidateList'); // Tab: Geselecteerde Kandidaten
const validationMessage = document.getElementById('validationMessage');
const initialCandidateMessage = document.getElementById('initialCandidateMessage');


// --- CANDIDATE LIST RENDERING ---

/**
 * Genereert de HTML voor de geselecteerde kandidaten in het aparte tabblad.
 */
function renderCandidateList() {
    let totalCandidateCount = 0;
    let candidatesHtml = '';

    jobs.forEach(job => {
        if (job.candidates.length > 0) {
            totalCandidateCount += job.candidates.length;

            job.candidates.forEach(candidate => {
                candidatesHtml += `
                    <li class="list-group-item candidate-entry mb-2 shadow-sm">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1 text-dark">${candidate}</h6>
                            <small class="text-muted">Aangenomen voor:</small>
                        </div>
                        <p class="mb-1 fw-bold">${job.name}</p>
                        <small class="text-secondary">Datum: ${job.getFormattedDate()}</small>
                    </li>
                `;
            });
        }
    });

    if (totalCandidateCount === 0) {
        candidateList.innerHTML = '<li class="list-group-item text-muted">Nog geen kandidaten aangenomen.</li>';
    } else {
        candidateList.innerHTML = candidatesHtml;
    }
}


// --- JOB LIST RENDERING (Ongewijzigd, maar roept nu ook renderCandidateList aan) ---

/**
 * Genereert de HTML voor één Job object. (Blijft grotendeels hetzelfde)
 */
function createJobListItem(job) {
    const statusColor = job.status === 'Open' ? 'primary' : job.status === 'Voltooid' ? 'success' : 'danger';
    const statusBadge = `<span class="badge bg-${statusColor}">${job.status}</span>`;

    // HTML voor de lijst van aangenomen kandidaten
    const candidateListHtml = job.candidates.map(candidate =>
        `<span class="badge bg-info text-dark me-1">${candidate}</span>`
    ).join('');

    // Input en knop voor kandidaat toevoegen (alleen als de job open is)
    const acceptCandidateSection = job.status === 'Open' ? `
        <div class="input-group input-group-sm mt-2 w-75">
            <input type="text" class="form-control" placeholder="Kandidaat Naam" id="candidateName-${job.id}" data-job-id="${job.id}">
            <button class="btn btn-outline-success btn-accept-candidate" type="button" 
                data-job-id="${job.id}" 
                ${job.canAcceptCandidate() ? '' : 'disabled'}>
                Aanvaard (${job.candidates.length}/${job.maxCandidates})
            </button>
        </div>
    ` : `<div class="mt-2 text-muted fst-italic">${job.candidates.length} van ${job.maxCandidates} plaatsen bezet.</div>`;

    // Actieknoppen (alleen zichtbaar als de job open is)
    const actionButtons = job.status === 'Open' ? `
        <div class="btn-group btn-group-sm mt-3" role="group">
            <button type="button" class="btn btn-success btn-complete" data-job-id="${job.id}">Voltooi</button>
            <button type="button" class="btn btn-danger btn-cancel" data-job-id="${job.id}">Annuleer</button>
        </div>
    ` : '';

    return `
        <li class="list-group-item list-group-item-action list-group-item-job mb-3 shadow-sm status-${job.status}">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <h5 class="mb-1 text-primary">${job.name}</h5>
                <div>
                    ${statusBadge}
                    <span class="ms-2 badge bg-dark">${job.getFormattedPayment()}</span>
                </div>
            </div>
            <p class="mb-1">${job.description}</p>
            <small class="text-muted">Uitvoering: ${job.getFormattedDate()}</small>
            
            <div class="mt-2">
                ${candidateListHtml}
            </div>

            ${acceptCandidateSection}
            ${actionButtons}
        </li>
    `;
}

/**
 * Genereert de HTML voor alle Job objecten en werkt BEIDE lijsten bij.
 */
function renderJobList() {
    if (jobs.length === 0) {
        jobList.innerHTML = '<li class="list-group-item text-muted">Nog geen opdrachten toegevoegd.</li>';
    } else {
        const jobsHtml = jobs.map(job => createJobListItem(job)).join('');
        jobList.innerHTML = jobsHtml;
    }

    // Roep de rendering voor het tweede tabblad aan
    renderCandidateList();
}

// --- LOGICA EN EVENT HANDLERS ---

/**
 * Zoek een job in de array op basis van ID.
 */
function findJobById(id) {
    const jobId = parseFloat(id);
    return jobs.find(job => job.id === jobId);
}

/**
 * Haalt de kandidaatnaam op uit het inputveld van de specifieke job.
 */
function getCandidateNameInput(jobId) {
    const inputElement = document.getElementById(`candidateName-${jobId}`);
    return inputElement ? inputElement.value.trim() : '';
}

/**
 * Event Listener voor de lijst (delegatie voor knoppen).
 */
jobList.addEventListener('click', function(event) {
    const target = event.target;
    const jobId = target.dataset.jobId;
    const job = findJobById(jobId);

    if (!job) return;

    // 1. Job Voltooien
    if (target.classList.contains('btn-complete')) {
        job.completeJob();
        renderJobList();
        return;
    }

    // 2. Job Annuleren
    if (target.classList.contains('btn-cancel')) {
        job.cancelJob();
        renderJobList();
        return;
    }

    // 3. Kandidaat Aanvaarden (KERNWIJZIGING VOOR UNIEKE NAAM)
    if (target.classList.contains('btn-accept-candidate')) {
        const candidateName = getCandidateNameInput(jobId);

        if (!candidateName) {
            alert('Gelieve een naam in te vullen.');
            return;
        }

        // Valideer: Maximaal 1 keer aanvaarden per naam voor deze job
        const isAlreadyAccepted = job.candidates.some(name => name.toLowerCase() === candidateName.toLowerCase());

        if (isAlreadyAccepted) {
            alert(`Fout: Kandidaat "${candidateName}" is al aanvaard voor deze opdracht.`);
            return;
        }

        if (job.acceptCandidate(candidateName)) {
            // Maak inputveld leeg na succes en render opnieuw
            document.getElementById(`candidateName-${jobId}`).value = '';
            renderJobList();
        } else {
            alert(`Kan geen kandidaat toevoegen. Maximaal (${job.maxCandidates}) bereikt of job is niet open.`);
        }
        return;
    }
});

// Event Listener voor het formulier (Job toevoegen)
jobForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // ... (Code om inputwaarden te lezen en te valideren) ...
    const name = document.getElementById('jobName').value;
    const description = document.getElementById('jobDescription').value;
    const paymentStr = document.getElementById('jobPayment').value;
    const date = document.getElementById('jobDate').value;
    const candidateCount = parseInt(document.getElementById('candidateCount').value, 10);

    // Valideer
    if (!name.trim() || !description.trim() || !date || isNaN(parseFloat(paymentStr)) || parseFloat(paymentStr) <= 0 || isNaN(candidateCount) || candidateCount <= 0) {
        validationMessage.textContent = "Controleer of alle velden correct zijn ingevuld.";
        validationMessage.classList.remove('d-none');
        return;
    }

    validationMessage.classList.add('d-none');

    // Maak en voeg een nieuw Job object toe
    const newJob = new Job(
        name,
        description,
        parseFloat(paymentStr),
        date,
        candidateCount
    );

    jobs.push(newJob);
    renderJobList(); // Update beide lijsten
    jobForm.reset();
});


// Initialiseer de lijst bij het laden van de pagina
document.addEventListener('DOMContentLoaded', renderJobList);