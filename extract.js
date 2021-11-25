const fs = require("fs").promises;

async function main() {
    const buffer = await fs.readFile("GABARITO_ROSA.md");
    const data = buffer.toString().split("\n");

    let answers = [];
    for (let i = 2; i < 92; i++) {
        answers.push(data[i].charAt(7));
    }
    console.log(JSON.stringify(answers));
    console.log(answers.length);
}

main();