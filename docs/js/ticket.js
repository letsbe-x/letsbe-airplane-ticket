document.addEventListener('DOMContentLoaded', () => {
    const ticketListContainer = document.getElementById('ticket-list-container');
    const ticketTemplate = document.getElementById('ticket-template');
    const downloadAllBtn = document.getElementById('download-all-btn');

    let ticketsData = [];

    const loadDataFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        if (!data) {
            ticketListContainer.innerHTML = '<p>유효한 티켓 데이터가 없습니다. <a href="index.html">새로 만들어주세요.</a></p>';
            return null;
        }
        try {
            const binaryString = atob(data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decompressed = pako.inflate(bytes, { to: 'string' });
            const parsed = JSON.parse(decompressed);
            return parsed.tickets || [];
        } catch (error) {
            console.error("데이터 로딩/파싱 오류:", error);
            ticketListContainer.innerHTML = `<p>티켓 데이터를 읽는 중 오류가 발생했습니다. 링크가 올바른지 확인해주세요. <a href="index.html">새로 만들기</a></p>`;
            return null;
        }
    };

    const createTicketHTML = (ticketData, index) => {
        const { flight } = ticketData;
        const departure = flight.departure_datetime ? new Date(flight.departure_datetime) : null;
        const departureDate = departure ? `${departure.getFullYear()}.${String(departure.getMonth() + 1).padStart(2, '0')}.${String(departure.getDate()).padStart(2, '0')}` : '';
        const departureTime = departure ? `${String(departure.getHours()).padStart(2, '0')}:${String(departure.getMinutes()).padStart(2, '0')}` : '';
        const mapLink = flight.departure_address ? `<a href="${flight.departure_address}" target="_blank" title="지도 보기">🗺️</a>` : '';

        return `
        <div class="ticket">
            <div class="main-content">
                <div class="header"><div class="airline-info"><span class="airline">${flight.airline}</span><span class="pass-title">BOARDING PASS</span></div></div>
                <div class="flight-info">
                    <div class="airport from"><div class="airport-name">${flight.departure_city} ${mapLink}</div><div class="airport-code">${flight.departure_airport_code || ''}</div></div>
                    <div class="plane-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#0033a0"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>
                    <div class="airport to"><div class="airport-name">${flight.arrival_city}</div><div class="airport-code">${flight.arrival_airport_code || ''}</div></div>
                </div>
                <div class="details-grid">
                    <div class="detail-item"><span class="label">PASSENGER</span><span class="value">${flight.ticket_holder}</span></div>
                    <div class="detail-item"><span class="label">FLIGHT</span><span class="value">${flight.flight_number}</span></div>
                    <div class="detail-item"><span class="label">SEAT</span><span class="value seat">${flight.seat}</span></div>
                    <div class="detail-item"><span class="label">DATE</span><span class="value">${departureDate}</span></div>
                    <div class="detail-item"><span class="label">DEPARTURE</span><span class="value">${departureTime}</span></div>
                    <div class="detail-item"><span class="label">CLASS</span><span class="value">FIRST</span></div>
                </div>
            </div>
            <div class="stub">
                <div class="stub-header"><span class="pass-title-small">BOARDING PASS</span><span class="airline-small">${flight.airline}</span></div>
                <div class="stub-details">
                     <div class="detail-item"><span class="label">PASSENGER</span><span class="value-small">${flight.ticket_holder}</span></div>
                     <div class="detail-item"><span class="label">FLIGHT</span><span class="value-small">${flight.flight_number}</span></div>
                     <div class="detail-item"><span class="label">SEAT</span><span class="value-small seat">${flight.seat}</span></div>
                </div>
                <div class="barcode" id="qrcode-ticket-${index}"></div>
            </div>
        </div>`;
    };

    const setupInteractiveTicket = (passengerCard) => {
        const previewWrapper = passengerCard.querySelector('.preview-wrapper');
        const originalContainer = passengerCard.querySelector('.ticket-original');
        const tornContainer = passengerCard.querySelector('.ticket-torn-container');
        let isTorn = false;

        previewWrapper.addEventListener('mousemove', (e) => {
            if (isTorn) return;
            const rect = previewWrapper.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 20;
            const y = (e.clientY - rect.top - rect.height / 2) / 20;
            originalContainer.style.transform = `rotateY(${x}deg) rotateX(${-y}deg) scale(1.05)`;
        });

        previewWrapper.addEventListener('mouseleave', () => {
            if (isTorn) return;
            originalContainer.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
        });

        const handleTear = () => {
            if (isTorn) return;
            isTorn = true;
            originalContainer.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
            originalContainer.classList.add('hidden');

            const leftHalf = document.createElement('div');
            const rightHalf = document.createElement('div');
            leftHalf.className = 'ticket-half left';
            rightHalf.className = 'ticket-half right';
            
            const contentHTML = originalContainer.innerHTML;
            leftHalf.innerHTML = contentHTML;
            rightHalf.innerHTML = contentHTML;

            const tearEdge = document.createElement('div');
            tearEdge.className = 'torn-edge';
            leftHalf.appendChild(tearEdge.cloneNode());
            rightHalf.appendChild(tearEdge.cloneNode());

            tornContainer.innerHTML = '';
            tornContainer.appendChild(leftHalf);
            tornContainer.appendChild(rightHalf);

            setTimeout(() => {
                leftHalf.classList.add('animate');
                rightHalf.classList.add('animate');
            }, 50);

            setTimeout(() => {
                originalContainer.classList.remove('hidden');
                tornContainer.innerHTML = '';
                isTorn = false;
            }, 2500);
        };

        originalContainer.querySelector('.stub').addEventListener('click', handleTear);
    };

    const downloadTicketAsImage = async (ticketElement, flight) => {
        try {
            const canvas = await html2canvas(ticketElement, { backgroundColor: null, scale: 2 });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `ticket-${flight.flight_number}-${flight.ticket_holder}.png`;
            link.click();
        } catch (error) {
            console.error('Image generation error:', error);
            alert('Failed to generate ticket image.');
        }
    };

    const init = () => {
        ticketsData = loadDataFromUrl();
        if (!ticketsData) return;

        ticketsData.forEach((ticketData, index) => {
            const cardNode = ticketTemplate.content.cloneNode(true);
            const passengerCard = cardNode.querySelector('.passenger-card');
            const originalContainer = passengerCard.querySelector('.ticket-original');
            const downloadBtn = passengerCard.querySelector('.download-btn');

            originalContainer.innerHTML = createTicketHTML(ticketData, index);
            
            const qrcodeContainer = originalContainer.querySelector(`#qrcode-ticket-${index}`);
            
            const singleTicketPayload = { tickets: [ticketData] };
            const jsonString = JSON.stringify(singleTicketPayload);
            const compressed = pako.deflate(jsonString);
            const binaryString = String.fromCharCode.apply(null, compressed);
            const encoded = btoa(binaryString);
            const qrUrl = `https://letsbe.site/letsbe-airplan-ticket/?data=${encoded}`;

            new QRCode(qrcodeContainer, {
                text: qrUrl,
                width: 90,
                height: 90,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });

            setupInteractiveTicket(passengerCard);

            downloadBtn.addEventListener('click', () => {
                downloadTicketAsImage(originalContainer.querySelector('.ticket'), ticketData.flight);
            });

            ticketListContainer.appendChild(cardNode);
        });

        if (ticketsData.length === 0) {
            downloadAllBtn.style.display = 'none';
        }
    };

    downloadAllBtn.addEventListener('click', async () => {
        const passengerCards = ticketListContainer.querySelectorAll('.passenger-card');
        if (passengerCards.length === 0) return;

        downloadAllBtn.disabled = true;
        downloadAllBtn.textContent = '다운로드 중...';

        for (let i = 0; i < passengerCards.length; i++) {
            const card = passengerCards[i];
            const ticketElement = card.querySelector('.ticket-original .ticket');
            const flightData = ticketsData[i].flight;
            await downloadTicketAsImage(ticketElement, flightData);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        downloadAllBtn.disabled = false;
        downloadAllBtn.textContent = '모든 티켓 이미지로 저장';
    });

    init();
});
