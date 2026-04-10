async function simplifyText() {
    const input = document.getElementById("originalText").value;

    if (input.trim() === "") {
        alert("Please enter text first.");
        return;
    }

    document.getElementById("simplifiedText").innerHTML = "⏳ Simplifying...";

    try {
        const response = await fetch("http://127.0.0.1:8000/api/simplify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                original_text: input
            })
        });

        const data = await response.json();
        console.log("API RESPONSE:", data);

        if (response.ok) {
            const originalText = data.original_text ?? input;
            const simplifiedText = data.simplified_text ?? "";

            if (!simplifiedText) {
                document.getElementById("simplifiedText").innerText = "No simplified text returned.";
                return;
            }

            const highlighted = highlightChanges(originalText, simplifiedText);
            document.getElementById("simplifiedText").innerHTML = highlighted;
        } else {
            console.log("Backend error:", data);
            alert("Failed to simplify text: " + JSON.stringify(data));
        }

    } catch (error) {
        console.error("Server error:", error);
        alert("Server error.");
    }
}

function highlightChanges(original, simplified) {
    if (!original || !simplified) {
        return simplified || original || "";
    }

    const originalWords = original.split(/\s+/);
    const simplifiedWords = simplified.split(/\s+/);

    let result = [];

    for (let i = 0; i < simplifiedWords.length; i++) {
        if (originalWords[i] !== simplifiedWords[i]) {
            result.push(`<span class="highlight">${simplifiedWords[i]}</span>`);
        } else {
            result.push(simplifiedWords[i]);
        }
    }

    return result.join(" ");
}