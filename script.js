function convertCSV() {
    const file = document.getElementById("csvFile").files[0];
    const output = document.getElementById("jsonOutput");
    const message = document.getElementById("message");

    message.textContent = "";

    if (!file) {
        message.textContent = "Please upload a CSV file.";
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const text = event.target.result;
            const rows = parseCSV(text);

            if (rows.length < 2) {
                throw new Error("CSV file has no data.");
            }

            const headers = rows[0].map(header => header.trim());

            const requiredFields = [
                "student_id",
                "first_name",
                "last_name",
                "course",
                "year_level",
                "email",
                "tuition_balance"
            ];

            for (const field of requiredFields) {
                if (!headers.includes(field)) {
                    throw new Error("Missing field: " + field);
                }
            }

            const programNames = {
                "BSIT": "Bachelor of Science in Information Technology",
                "BSCS": "Bachelor of Science in Computer Science",
                "BSIS": "Bachelor of Science in Information Systems",
                "BSBA": "Bachelor of Science in Business Administration"
            };

            const jsonData = rows.slice(1).map(row => {
                const student = {};

                headers.forEach((header, index) => {
                    student[header] = row[index] || "";
                });

                return {
                    studentId: parseInt(student.student_id, 10),

                    firstName: capitalize(student.first_name),

                    lastName: capitalize(student.last_name),

                    program: programNames[
                        student.course.trim().toUpperCase()
                    ] || student.course,

                    yearLevel: parseInt(student.year_level, 10),

                    emailAddress: student.email.toLowerCase(),

                    outstandingBalance: Number(
                        parseFloat(student.tuition_balance).toFixed(2)
                    )
                };
            });

            output.textContent = JSON.stringify(jsonData, null, 4);

        } catch (error) {
            message.textContent = error.message;
            output.textContent = "Unable to convert CSV.";
        }
    };

    reader.onerror = function() {
        message.textContent = "Error reading the CSV file.";
    };

    reader.readAsText(file);
}


function capitalize(text) {
    text = text.trim().toLowerCase();

    return text.charAt(0).toUpperCase() + text.slice(1);
}


function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let insideQuotes = false;

    text = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (insideQuotes && text[i + 1] === '"') {
                field += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }

        } else if (char === ',' && !insideQuotes) {
            row.push(field);
            field = "";

        } else if (
            (char === '\n' || char === '\r') &&
            !insideQuotes
        ) {
            if (char === '\r' && text[i + 1] === '\n') {
                i++;
            }

            row.push(field);

            if (row.some(value => value.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            field = "";

        } else {
            field += char;
        }
    }

    row.push(field);

    if (row.some(value => value.trim() !== "")) {
        rows.push(row);
    }

    return rows;
}
