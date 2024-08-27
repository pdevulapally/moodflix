document.addEventListener("DOMContentLoaded", function() {
    const upgradeButton = document.getElementById("upgradeButton");
    const upgradeButtonFooter = document.getElementById("upgradeButtonFooter");
    const modal = document.getElementById("upgradeModal");
    const closeButton = document.querySelector(".close-button");

    function toggleModal() {
        if (modal.style.display === "flex") {
            modal.style.display = "none";
        } else {
            modal.style.display = "flex";
        }
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
