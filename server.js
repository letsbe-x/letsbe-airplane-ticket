const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const nodeHtmlToImage = require('node-html-to-image');

// --- DB 설정 ---
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { tickets: {} });

// --- Express 앱 설정 ---
const app = express();
app.use(express.json());
// ✨ 정적 파일 제공 (public 폴더 추가)
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));


// --- API 엔드포인트 ---
app.post('/api/tickets', async (req, res) => {
    await db.read();
    const tickets = req.body;
    if (!Array.isArray(tickets) || tickets.length === 0) {
        return res.status(400).json({ message: '티켓 정보가 올바르지 않습니다.' });
    }
    const groupId = nanoid(10);
    db.data.tickets[groupId] = tickets;
    await db.write();
    res.status(201).json({ url: `/tickets/${groupId}` });
});

app.get('/api/tickets/:groupId', async (req, res) => {
    await db.read();
    const { groupId } = req.params;
    const ticketGroup = db.data.tickets[groupId];
    if (ticketGroup) {
        res.json(ticketGroup);
    } else {
        res.status(404).json({ message: '티켓 그룹을 찾을 수 없습니다.' });
    }
});

// --- 페이지 라우팅 ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/tickets/:groupId', async (req, res) => {
    const { groupId } = req.params;
    await db.read();
    const ticketGroup = db.data.tickets[groupId];

    if (!ticketGroup) {
        return res.status(404).send('<h1>404 - Not Found</h1>');
    }

    const userAgent = req.headers['user-agent'] || '';
    const isCrawler = /facebook|kakao|twitter|bot|crawler/i.test(userAgent);

    if (isCrawler) {
        console.log(`크롤러 감지 (${userAgent}), OG 카드를 생성합니다 for group ${groupId}.`);
        try {
            const firstTicket = ticketGroup[0].flight;
            const ogImageDir = path.join(__dirname, 'public', 'og-images');
            await fs.mkdir(ogImageDir, { recursive: true }); // 폴더 생성
            const ogImageFileName = `og-${groupId}.png`;
            const ogImagePath = path.join(ogImageDir, ogImageFileName);

            // ✨ 가장 안정적인 이미지 생성 로직 사용
            const htmlTemplate = await fs.readFile(path.join(__dirname, 'og-template.html'), 'utf8');
            const cssStyles = await fs.readFile(path.join(__dirname, 'style.css'), 'utf8');
            const htmlWithCss = htmlTemplate.replace(
                '<link rel="stylesheet" href="style.css">',
                // 미리보기 티켓 클래스를 적용하여 스타일 일치
                `<style>${cssStyles.replace(/\.ticket/g, '.preview-ticket')}</style>`
            );
            
            await nodeHtmlToImage({
                output: ogImagePath,
                html: htmlWithCss,
                selector: '.preview-ticket', // 템플릿에 맞는 selector 사용
                content: { ...firstTicket, departure_code: 'ICN', arrival_code: 'CDG' },
                puppeteerArgs: { defaultViewport: { width: 1100, height: 530 }, waitUntil: 'networkidle0' }
            });

            const ogUrl = `${req.protocol}://${req.get('host')}`;
            const title = `${firstTicket.ticket_holder}님의 ${firstTicket.departure_city} → ${firstTicket.arrival_city} 항공권`;
            const description = ticketGroup.length > 1 ? `${ticketGroup.length - 1}명의 동료와 함께합니다.` : '즐거운 여행 되세요!';
            
            res.send(`
                <!DOCTYPE html><html lang="ko"><head>
                    <title>${title}</title>
                    <meta property="og:title" content="${title}">
                    <meta property="og:description" content="${description}">
                    <meta property="og:image" content="${ogUrl}/public/og-images/${ogImageFileName}">
                    <meta property="og:image:width" content="1100">
                    <meta property="og:image:height" content="530">
                </head><body><p>${description}</p></body></html>
            `);
        } catch (error) {
            console.error("OG 카드 생성 오류:", error);
            res.status(500).send('OG 카드 생성 중 오류 발생');
        }
    } else {
        res.sendFile(path.join(__dirname, 'ticket-viewer.html'));
    }
});

// --- 서버 시작 ---
const PORT = 3000;
app.listen(PORT, async () => {
    await db.read();
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});