const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const nodeHtmlToImage = require('node-html-to-image');
const https = require('https');

const app = express();
const port = 3000;
const host = '0.0.0.0';

// --- Font Embedding Strategy ---
// A cache for the self-contained CSS with embedded fonts
let selfContainedCss = null;

// Function to download a file and return it as a Base64 string
const downloadAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      res.on('error', reject);
    });
  });
};

// Function to prepare the CSS with embedded fonts
const prepareCss = async () => {
  if (selfContainedCss) {
    return selfContainedCss;
  }

  console.log('최초 실행: 폰트 데이터를 다운로드하고 CSS를 준비합니다...');

  // 1. Define font URLs (these are stable URLs for Google Fonts)
  const fontUrls = {
    Roboto400: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
    Roboto500: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.woff2',
    Roboto700: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.woff2',
    OpenSans700: 'https://fonts.gstatic.com/s/opensans/v34/mem5YaGs126MiZpBA-UN7rgOUuhs.woff2',
  };

  // 2. Download all fonts in parallel and encode to Base64
  const fontData = {
    Roboto400: await downloadAsBase64(fontUrls.Roboto400),
    Roboto500: await downloadAsBase64(fontUrls.Roboto500),
    Roboto700: await downloadAsBase64(fontUrls.Roboto700),
    OpenSans700: await downloadAsBase64(fontUrls.OpenSans700),
  };

  // 3. Create @font-face rules
  const fontFaceCss = `
    @font-face { font-family: 'Roboto'; font-style: normal; font-weight: 400; src: url(data:font/woff2;base64,${fontData.Roboto400}) format('woff2'); }
    @font-face { font-family: 'Roboto'; font-style: normal; font-weight: 500; src: url(data:font/woff2;base64,${fontData.Roboto500}) format('woff2'); }
    @font-face { font-family: 'Roboto'; font-style: normal; font-weight: 700; src: url(data:font/woff2;base64,${fontData.Roboto700}) format('woff2'); }
    @font-face { font-family: 'Open Sans'; font-style: normal; font-weight: 700; src: url(data:font/woff2;base64,${fontData.OpenSans700}) format('woff2'); }
  `;

  // 4. Read original CSS and combine with font-face rules
  const originalCss = await fs.readFile(path.join(__dirname, 'style.css'), 'utf8');
  selfContainedCss = fontFaceCss + originalCss;
  
  console.log('폰트 임베딩된 CSS 준비 완료.');
  return selfContainedCss;
};
// --- End of Font Embedding ---


// 정적 파일 제공
app.use(express.static(__dirname));

// 로컬 디자인 확인용
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 공유할 OG 링크
app.get('/ticket', async (req, res) => {
  try {
    const baseUrl = req.headers['x-forwarded-host'] ? `https://${req.headers['x-forwarded-host']}` : `http://localhost:${port}`;
    const ogImageUrl = `${baseUrl}/og-ticket.png`;

    // --- 이미지 생성 로직 ---
    const css = await prepareCss(); // Get self-contained CSS
    const htmlTemplate = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
    const htmlWithEmbeddedCss = htmlTemplate.replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`);

    const flightData = {
      departure_city: "서울", arrival_city: "파리", departure_datetime: "2025-08-01T14:30",
      airline: "Korean Air", flight_number: "KE901", seat: "24A", ticket_holder: "HONG GILDONG"
    };
    const departure = new Date(flightData.departure_datetime);
    const departure_date = departure.toISOString().split('T')[0];
    const departure_time = departure.toTimeString().substring(0, 5);
    const boarding_time = new Date(departure.getTime() - 30 * 60000).toTimeString().substring(0, 5);

    await nodeHtmlToImage({
      output: './og-ticket.png',
      html: htmlWithEmbeddedCss,
      selector: '#og-container',
      content: {
        ...flightData, departure_date, departure_time, boarding_time,
        gate: 'A12', departure_code: 'ICN', arrival_code: 'CDG'
      },
      puppeteerArgs: {
        defaultViewport: { width: 1200, height: 630 },
        // waitUntil: 'networkidle0' is no longer as critical, but doesn't hurt
        waitUntil: 'networkidle0' 
      }
    });
    console.log('폰트가 내장된 고품질 OG 이미지를 생성했습니다.');
    // --- 이미지 생성 로직 끝 ---

    let ogHtml = await fs.readFile(path.join(__dirname, 'og.html'), 'utf8');
    ogHtml = ogHtml.replace(/{{og_image_url}}/g, ogImageUrl)
                   .replace('{{departure_city}}', flightData.departure_city)
                   .replace('{{arrival_city}}', flightData.arrival_city)
                   .replace('{{ticket_holder}}', flightData.ticket_holder)
                   .replace('{{flight_number}}', flightData.flight_number);

    res.send(ogHtml);

  } catch (error) {
    console.error('OG 처리 중 오류 발생:', error);
    res.status(500).send('항공권 정보를 처리하는 중 오류가 발생했습니다.');
  }
});

// 서버 시작 시 CSS 준비
prepareCss().then(() => {
  app.listen(port, host, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
    console.log('외부 공유를 위한 /ticket 경로가 준비되었습니다.');
  });
}).catch(err => {
    console.error("서버 시작 실패: CSS 준비 중 오류 발생", err);
    process.exit(1);
});