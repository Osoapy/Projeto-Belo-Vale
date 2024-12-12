function normalizeId(id) {
    return id.replace(/^0+/, ''); // Remove zeros à esquerda
}

function parseMonetaryValue(value) {
    return parseFloat(value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
}

function parseInput1(input) {
    input = validateInput(input);

    const lines = input.split("\n");
    let data = {};
    let skipNext = 0;

    for (let i = 0; i < lines.length; i++) {
        if (skipNext > 0) {
            skipNext--;
            continue; // Ignorar a linha já processada
        }

        let line = lines[i];
        if (!line.trim()) continue; // Pular linhas em branco
        const parts = line.split(/\s+/);
        const id = parts[0];
        let valor = parts.slice(-1)[0]; // Última parte é o valor

        if (valor === "Alimentos") {
            if (i + 1 < lines.length) {
                let nextLine = lines[i + 1].trim();
                if (nextLine) {
                    line += " " + nextLine; // Concatenar próxima linha
                    skipNext += 1;
                    valor = line.split(/\s+/).slice(-1)[0]; // Recalcular valor

                    if (valor === "Me") {
                        if (i + 2 < lines.length) {
                            let nextLine = lines[i + 2].trim();
                            if (nextLine) {
                                line += " " + nextLine; // Concatenar próxima linha
                                console.log(line)
                                skipNext += 1;
                                valor = line.split(/\s+/).slice(-1)[0]; // Recalcular valor
                            }
                        }
                    }
                }
            }
        }

        data[normalizeId(id)] = parseMonetaryValue(valor);
    }

    return data;
}

function validateInput(input) {
    // Substituir "Privacidade - Termos" por ""
    return input.replace(/Privacidade - Termos/g, "");
}

function parseInput2(input) {
    const lines = input.split("\n");
    const data = {};

    lines.forEach(line => {
        if (line.startsWith("|NF")) {
            const columns = line.split("|").map(col => col.trim());
            const id = normalizeId(columns[3]);
            const valor = parseMonetaryValue(columns[6]);
            
            if (data[id]) {
                data[id] += valor; // Somar valores de notas duplicadas
            } else {
                data[id] = valor;
            }
        }
    });

    return data;
}

function pushID(output, id, nomeInput2) {
    if (!isNaN(parseFloat(id))) {
        for (let k = 0; k < id.length; k++) {
            if (id[k] == ':' || id[k] == '/') {
                return;
            }
        }
        output.push(`Nota '${id}' está ausente no ${nomeInput2.substring(30)}.`);
    }
}

function comparar() {
    const input1 = document.getElementById("input1").value;
    const input2 = document.getElementById("input2").value;

    const data1 = parseInput1(input1);
    const data2 = parseInput2(input2);

    const nomeInput1 = document.getElementById("input1").placeholder;
    const nomeInput2 = document.getElementById("input2").placeholder;

    let diferenca = 0.00;

    let output = [];
    for (const id in data1) {
        if (data2[id] === undefined) {
            pushID(output, id, nomeInput2);
        } else if (data1[id] !== data2[id]) {
            console.log(data1[id]);
            output.push(`Nota '${id}': valor divergente. ${nomeInput1.substring(30)} = R$ ${data1[id].toFixed(2)}, ${nomeInput2.substring(30)} = R$ ${data2[id].toFixed(2)}`);
            output.push(`Diferença: R$ ${(data1[id].toFixed(2) - data2[id].toFixed(2)).toFixed(2)}`);
            if (parseFloat(data1[id] - data2[id]) >= 0.01) {
                diferenca += parseFloat(data1[id] - data2[id]);
            }
        }
    }

    for (const id in data2) {
        if (data1[id] === undefined) {
            output.push(`Nota '${id}' está ausente no ${nomeInput1.substring(30)}.`);
        }
    }

    output.push(`Diferença Total: R$ ${diferenca.toFixed(2)}`);

    document.getElementById("output").textContent = output.join("\n") || "Nenhuma discrepância encontrada.";
}
