
export function initHelpModal(helpBtn, modal) {
    const closeModalBtn = document.getElementById('close-modal');

    helpBtn.onclick = (event) => {
        event.stopPropagation();
        modal.classList.toggle('hidden');
    };

    closeModalBtn.onclick = () => {
        modal.classList.add('hidden');
    };

    // Stop propagation to prevent clicks inside the modal from closing it
    modal.onclick = (event) => {
        event.stopPropagation();
    };

    // Close modal if clicked outside
    window.onclick = (event) => {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    };
}
