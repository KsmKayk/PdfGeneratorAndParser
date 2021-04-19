import readline from "readline-sync";
import express, { Express } from "express";
import ejs from "ejs";
import puppeteer from "puppeteer";
import path from "path";

interface Patient {
  name: string;
  address: string;
  number: string;
  birth: string;
  email: string;
  bloodType: string;
  height: number;
  weight: number;
}

async function start() {
  const data = askDataFromPatient();
  const { app, server } = startServer();
  generateHtmlPage(app, data);
  await generatePdfFromHtml();
  closeServer(server);
}

function askDataFromPatient() {
  const data = {
    name: "",
    address: "",
    number: "",
    birth: "",
    email: "",
    bloodType: "",
    height: 0.0,
    weight: 0.0,
  };
  data.name = readline.question("Digite seu nome: ");
  data.address = readline.question(
    "Digite seu endereço (rua xxx, bairro xxx, numero xxx): "
  );
  data.number = readline.question(
    "Digite seu numero de telefone((xx)xxxxx-xxxx): "
  );
  data.birth = readline.question("Digite sua data de nascimento(xx/xx/xxxx): ");
  data.email = readline.question("Digite seu email(xxxxx@xxxx.com): ");
  data.bloodType = readline.question("Digite seu tipo sanguineo(B+): ");
  data.height = parseFloat(readline.question("Digite sua altura(x.xx): "));
  data.weight = parseFloat(readline.question("Digite seu peso(xx.xx): "));

  return data;
}

function startServer() {
  const app = express();
  const server = app.listen(3333);
  return { app, server };
}

function generateHtmlPage(app: Express, data: Patient) {
  app.get("/", (req, res) => {
    const filePath = path.join(__dirname, "page.ejs");
    ejs.renderFile(filePath, { Patient: data }, (err, html) => {
      if (err) {
        console.log("File get error");
      }
      return res.send(html);
    });
  });
}

async function generatePdfFromHtml() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://localhost:3333/", {
    waitUntil: "networkidle0",
  });

  await page.pdf({
    path: path.join(__dirname, "pdf", `${Date.now()}.pdf`),
    printBackground: true,
    format: "a4",
  });

  await browser.close();
}

function closeServer(server: any) {
  server.close();
}

start();
