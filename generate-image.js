const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs').promises; // Use promises-based fs
const path = require('path');

async function generateImage() {
  try {
    console.log('이미지 생성을 시작합니다...');

    // 1. HTML과 CSS 파일을 비동기적으로 읽어옵니다.
    const htmlTemplate = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
    const cssStyles = await fs.readFile(path.join(__dirname, 'style.css'), 'utf8');

    // 2. HTML에 CSS를 직접 삽입하여 외부 의존성을 제거합니다.
    const htmlWithEmbeddedCss = htmlTemplate.replace(
      '<link rel="stylesheet" href="style.css">',
      `<style>${cssStyles}</style>`
    );

    // 3. 항공권 데이터 정의
    const flightData = {
      departure_city: "서울",
      arrival_city: "파리",
      departure_datetime: "2025-08-01T14:30",
      airline: "Korean Air",
      flight_number: "KE901",
      seat: "24A",
      ticket_holder: "HONG GILDONG"
    };
    const departure = new Date(flightData.departure_datetime);
    const departure_date = departure.toISOString().split('T')[0];
    const departure_time = departure.toTimeString().substring(0, 5);
    const boarding_time = new Date(departure.getTime() - 30 * 60000).toTimeString().substring(0, 5);

    // 4. 가장 안정적인 옵션으로 이미지 생성
    await nodeHtmlToImage({
      output: './og-ticket.png',
      html: htmlWithEmbeddedCss, // CSS가 내장된 HTML 사용
      selector: '#og-container', // 정확한 요소 선택
      content: {
        ...flightData,
        departure_date,
        departure_time,
        boarding_time,
        gate: 'A12',
        departure_code: 'ICN',
        arrival_code: 'CDG'
      },
      puppeteerArgs: {
        defaultViewport: { width: 1200, height: 630 },
        waitUntil: 'networkidle0' // 웹폰트 등 리소스 로딩 대기
      }
    });

    console.log('✅ 성공: og-ticket.png 파일이 예쁜 디자인으로 재생성되었습니다.');

  } catch (error) {
    console.error('❌ 오류: 이미지 생성 중 문제가 발생했습니다.', error);
  }
}

// 스크립트 실행
generateImage();