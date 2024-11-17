import express from "express"
import open from "open"
import cors from 'cors'
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser"

import dotenv from 'dotenv';
dotenv.config(); // Carregar variáveis de ambiente


const app = express();

// Defina __filename e __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public folder

app.use(bodyParser.json());
app.use(cors()); // Habilita CORS para o frontend
app.use(bodyParser.urlencoded({ extended: true }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Serve the index page for other requests
app.get('/home', (req, res) => {
  res.render('home'); // Certifique-se de que 'home.ejs' está no diretório 'views'
});

// Redireciona a raiz ('/') para '/home'
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.post('/image-generation', async (req, res) => {
  const { textGenerateImage, styleImage } = req.body
  console.log(textGenerateImage, styleImage)

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: textGenerateImage,
      n: 1,
      style: styleImage,
      quality: "hd",
      size: "1024x1792",
    });

    if (response.data && response.data && response.data.length > 0) {
      const imageUrl = response.data[0].url;
      // console.log("URL da imagem gerada:", imageUrl);
      res.send({ url: imageUrl })
    } else {
      // console.error("Erro ao gerar a imagem: Resposta da API incompleta ou vazia");
      res.status(500).json({ error: "Erro ao gerar a imagem: Resposta da API incompleta ou vazia" }); // Erro no formato JSON
    }
  } catch (error) {
    // console.error("Erro ao gerar a imagem:", error);
    const status = error.status || 500;
    console.log(error)
    res.status(status).json({ message: error }); // Sempre enviar JSON
  }

  // simulando uma resposta com um tempo para testar o loading
  // setTimeout(() => {
  //   res.send({ url: "https://designcomcafe.com.br/wp-content/uploads/2023/10/como-criar-prompts-para-geracao-de-imagens-com-ia.jpg" })
  // }, 1000 * 60);
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`The server is now running on port ${PORT}`);
  open(`http://localhost:${PORT}`);
});
