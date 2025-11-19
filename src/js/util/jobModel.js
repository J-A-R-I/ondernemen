/**
 * jobModel.js
 * Klasse voor het representeren van een Job met status en kandidaten.
 */

class Job {
    constructor(name, description, payment, date, candidateCount = 4) {
        // Unieke ID voor DOM-manipulatie en opzoeken
        this.id = Date.now() + Math.random();
        this.name = name;
        this.description = description;
        this.payment = payment;
        this.date = date;
        this.maxCandidates = candidateCount;
        this.candidates = [];
        this.status = 'Open';
    }

    getFormattedPayment() {
        return new Intl.NumberFormat('nl-BE', {
            style: 'currency',
            currency: 'EUR'
        }).format(this.payment);
    }

    getFormattedDate() {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(this.date).toLocaleDateString('nl-BE', options);
    }

    /** Controleert of er nog ruimte is en de job open is. */
    canAcceptCandidate() {
        return this.status === 'Open' && this.candidates.length < this.maxCandidates;
    }

    acceptCandidate(candidateName) {
        if (this.canAcceptCandidate()) {
            this.candidates.push(candidateName);
            return true;
        }
        return false;
    }

    completeJob() {
        this.status = 'Voltooid';
    }

    cancelJob() {
        this.status = 'Geannuleerd';
    }
}

export default Job;