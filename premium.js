document.addEventListener("DOMContentLoaded", function() {
    const upgradeButton = document.getElementById("upgradeButton");
    const upgradeButtonFooter = document.getElementById("upgradeButtonFooter");
    const modal = document.getElementById("upgradeModal");
    const closeButton = document.querySelector(".close-button");

    function toggleModal() {
        modal.style.display = modal.style.display === "flex" ? "none" : "flex";
    }

    upgradeButton.addEventListener("click", function(event) {
        event.preventDefault();
        toggleModal();
    });

    upgradeButtonFooter.addEventListener("click", function(event) {
        event.preventDefault();
        toggleModal();
    });

    closeButton.addEventListener("click", function() {
        toggleModal();
    });

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            toggleModal();
        }
    });
});
