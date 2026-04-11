async function simplifyText() {
    const input = document.getElementById("originalText").value;

    if (input.trim() === "") {
        alert("Please enter text first.");
        return;
    }

    document.getElementById("simplifiedText").innerHTML = "⏳ Simplifying...";

    try {
        const response = await fetch("https://clario.kesug.com/clario-backend/simplify.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                original_text: input
            })
        });

        console.log("STATUS:", response.status);

        const raw = await response.text();
        console.log("RAW RESPONSE:", raw);

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            document.getElementById("simplifiedText").innerText = "Backend response bukan JSON valid.";
            return;
        }

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
            document.getElementById("simplifiedText").innerText =
                "Failed: " + JSON.stringify(data);
        }

    } catch (error) {
        console.error("Server error:", error);
        document.getElementById("simplifiedText").innerText =
            "Server error: " + error.message;
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
