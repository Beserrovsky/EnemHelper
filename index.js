const promises = require("fs").promises;

const AVAILABLE_TEMPLATES = ["rosa"];
const TEMPLATES_LENGTH = 90;
const AREA_LENGTH = 45;

const welcomeMessage = 
	"Bem vinde! 😁\n" + 
	"Para entender os comandos aqui disponíveis, verifique o arquivo README.md que acompanha o projeto!\n" + 
	"Tomei a liberdade de criar um arquivo para você transpassar suas respostas, MeuGabarito.md\n" + 
	"Espero que você aproveite algo aqui e boa sorte na sua correção!";

const genResult = async (answers_uri, template) => {
	if (answers_uri === null) console.error("Nenhuma arquivo de respostas foi especificado.");
	if (template === null) console.error("Nenhum gabarito foi especificado.");

	let correctAnswers = [];
	let answers = [];

	console.log(formatTemplateURI(template));

	correctAnswers = await getAnswersFromFile(formatTemplateURI(template));
	answers = await getAnswersFromFile(answers_uri);
	
	if (correctAnswers == null || answers == null) return;

	let points = [];
	for (let i = 0; i < TEMPLATES_LENGTH; i += AREA_LENGTH) {
		points.push(0);
	}

	let result = 
		"# CORREÇÃO GERADA CONSIDERANDO O GABARITO " + template.toUpperCase() + "\n\n";
	
	for (let i = 0; i < answers.length; i++) {
		const point = answers[i] === correctAnswers[i];
		if (point) points[Math.floor(i / AREA_LENGTH)]++;
		result += `- ${ formatNumber(i + 1) } - ${point? "✔" : ("❌ -> " + correctAnswers[i])} \n`;
	}

	const totalPoints = points.reduce((a, b) => a + b, 0);

	result += `## ✔ Acertos: ${totalPoints} / ❌ Erros: ${TEMPLATES_LENGTH - totalPoints}\n`;

	for(let i = 0; i < points.length; i++) {
		result += `### ${i+1}° metade: ${points[i]}✔\n`;
	}

	return result;
}
const help = () => { 
	console.log(welcomeMessage); 
	gen();
}

const formatTemplateURI = (template) => `./GABARITO_${template.toUpperCase()}.md`;

const getAnswersFromFile = async (file_uri) => {
	let result = [];
	try {
		const buffer = await promises.readFile(file_uri);
		const data = buffer.toString().split("\n");
		for (let i = 2; i < (TEMPLATES_LENGTH + 2); i++) {
			result.push(!data[i]? "S" : data[i].charAt(7));
		}
		return result;
	}
	catch (error) { console.error(error); return; }
}

const formatNumber = (number) => `${number}`.length > 1? number: "0" + number;

const gen = () => { 
	let genText = "# MEU GABARITO\n";
	for (let count = 0; count < TEMPLATES_LENGTH; count++) { 
		genText+=`- ${ formatNumber(count + 1) } - S\n`;
	}
	promises.writeFile("./MeuGabarito.md", genText);
	console.log("[Arquivo] ./MeuGabarito.md gerado 🥳")
}

var args = process.argv.slice(2);
args.forEach((arg, index) => {
	switch (arg) {
		case "--gen":
			gen();
			break;
		case "--resolve":
			const template = AVAILABLE_TEMPLATES.find(template => template.toLowerCase() === args[index + 2].toLowerCase());
			if (template === null) { console.log(`Template ${args[index + 2]} não existe, confira README.md`); break; }
			genResult(args[index + 1], template).then(result => {
				console.log(result);
				promises.writeFile("./Resultado.md", result).then(()=> {
					console.log("Resultado salvo em ./Resultado.md")
				});
			});
			break;
	}
});

if (args.length == 0) help();