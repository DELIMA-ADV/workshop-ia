import fs from 'fs';

const htmlContent = fs.readFileSync('workshop_inscricao.html', 'utf-8');
const match = htmlContent.match(/src="data:image\/png;base64,([^"]+)"/);

if (match && match[1]) {
  const base64Data = match[1];
  const buffer = Buffer.from(base64Data, 'base64');
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  fs.writeFileSync('public/banner.png', buffer);
  console.log('Imagem extraída com sucesso para public/banner.png!');
} else {
  console.log('Imagem não encontrada no arquivo HTML.');
}
