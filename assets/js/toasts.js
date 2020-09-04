const toasts = document.getElementsByTagName("toast");
const container = document.createElement("div");
container.classList.add("mz", "toasts");
document.body.prepend(container);

function doToast(message, level = "info") {
    let color;
    switch (level) {
        case "danger":
            color = "red";
            break;
        case "warning":
            color = "orange";
            break;
        case "success":
            color = "green";
            break;
        default:
            color = "blue";
            break;
    }
    const { el } = M.toast({
        html: `<span><b>${level}:</b> ${message}</span>`,
        classes: color + " mz",
    });
    container.appendChild(el);
}

for (const toast of toasts) {
    const { level, message } = toast.dataset;
    doToast(message, level);
}
