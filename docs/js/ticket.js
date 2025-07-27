document.addEventListener('DOMContentLoaded', () => {
    const ticketListContainer = document.getElementById('ticket-list-container');
    const ticketTemplate = document.getElementById('ticket-template');
    const downloadAllBtn = document.getElementById('download-all-btn');

    let ticketsData = [];

    const mapIconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-300 -70 800 600">
<path d="M0 0 C31.03671487 29.68924534 48.3148603 72.07115234 49.41674805 114.71655273 C49.66126883 132.05914361 45.72104982 148.10838855 40.19921875 164.45703125 C39.92513184 165.26946289 39.65104492 166.08189453 39.36865234 166.91894531 C21.75005203 218.0342606 -9.60885068 265.11396262 -43.32495117 306.94287109 C-45.5111776 309.68131633 -47.30073372 312.29751904 -48.80078125 315.45703125 C-48.12200928 315.61260498 -47.4432373 315.76817871 -46.74389648 315.9284668 C9.67567683 328.94102179 9.67567683 328.94102179 26.19921875 351.14453125 C28.11233227 357.48171978 28.14761008 364.37475944 26.19921875 370.70703125 C7.75285418 396.07078253 -27.47204274 403.50831786 -56.80078125 408.45703125 C-76.54952527 411.41727275 -96.22674743 412.67003609 -116.17578125 412.64453125 C-117.05373352 412.643927 -117.93168579 412.64332275 -118.83624268 412.6427002 C-161.72485638 412.56289294 -220.71337928 409.87214576 -253.80078125 378.45703125 C-259.73145115 371.70332961 -261.23677208 366.77090443 -261.13671875 357.74609375 C-260.63882029 352.87132046 -258.97173835 350.09545131 -255.80078125 346.45703125 C-254.99833984 345.47669922 -254.99833984 345.47669922 -254.1796875 344.4765625 C-248.47171645 338.1302807 -241.31649767 334.25876345 -233.80078125 330.45703125 C-232.24810547 329.67005859 -232.24810547 329.67005859 -230.6640625 328.8671875 C-216.31146152 322.21167634 -200.3170771 318.31189169 -184.80078125 315.45703125 C-186.07271766 312.73245829 -187.44525508 310.49468656 -189.3828125 308.19921875 C-189.89561768 307.58369141 -190.40842285 306.96816406 -190.93676758 306.33398438 C-191.76664185 305.34301758 -191.76664185 305.34301758 -192.61328125 304.33203125 C-236.40040427 251.1180488 -288.48842935 174.01870865 -282.33642578 101.84912109 C-277.97709285 58.78043793 -256.51745545 17.740009 -222.92578125 -9.765625 C-197.94585038 -29.6591578 -169.44383044 -42.10764596 -137.80078125 -46.54296875 C-136.8778125 -46.67445312 -135.95484375 -46.8059375 -135.00390625 -46.94140625 C-84.2231331 -52.77646403 -37.13230073 -33.71426468 0 0 Z " fill="#29B6F6" transform="translate(372.80078125,73.54296875)"/>
<path d="M0 0 C0.80953125 0.65613281 1.6190625 1.31226563 2.453125 1.98828125 C3.15953125 2.53097656 3.8659375 3.07367188 4.59375 3.6328125 C19.35775636 15.57770741 29.22616491 35.29704353 31.453125 53.98828125 C33.0968933 77.14496188 27.7720688 98.11618015 12.453125 115.98828125 C12.00710938 116.57738281 11.56109375 117.16648438 11.1015625 117.7734375 C-0.18022099 132.25502508 -19.65558822 141.15999613 -37.546875 143.98828125 C-60.42321245 146.20404102 -81.71548428 140.60417528 -99.546875 125.98828125 C-100.25070313 125.446875 -100.95453125 124.90546875 -101.6796875 124.34765625 C-116.1094963 112.69063424 -123.62852108 95.66300672 -127.546875 77.98828125 C-127.74023438 77.20453125 -127.93359375 76.42078125 -128.1328125 75.61328125 C-131.30815541 55.48280541 -126.34078366 34.54555496 -114.546875 17.98828125 C-113.23198357 16.30702694 -111.89991482 14.63898983 -110.546875 12.98828125 C-109.73476562 11.93253906 -109.73476562 11.93253906 -108.90625 10.85546875 C-82.87355507 -21.36946915 -31.9667963 -24.81632871 0 0 Z " fill="#FEFEFE" transform="translate(304.546875,128.01171875)"/>
<path d="M0 0 C2.33203125 2.22265625 2.33203125 2.22265625 4.8125 5.0625 C5.25625977 5.56418701 5.70001953 6.06587402 6.15722656 6.58276367 C8.03206179 8.70809809 9.87840848 10.85708149 11.71484375 13.015625 C32.55686072 37.74784507 32.55686072 37.74784507 60.56640625 51.2734375 C76.27781369 51.80602758 87.48753619 41.33112065 98.5 31.1875 C100.68367296 29.14240566 102.84569249 27.07596906 105 25 C105.52658203 24.49533203 106.05316406 23.99066406 106.59570312 23.47070312 C112.90751379 17.39353226 118.7293197 11.16449401 124.16015625 4.27734375 C125.07087891 3.15005859 125.07087891 3.15005859 126 2 C126.47050781 1.39542969 126.94101562 0.79085938 127.42578125 0.16796875 C129 -1 129 -1 131.2578125 -1.1015625 C158.22918992 3.38141849 189.89370745 11.85827661 207.0625 34.75 C208.88955551 41.08379242 208.94084655 47.9422487 207 54.25 C188.55363543 79.61375128 153.32873851 87.05128661 124 92 C104.25125598 94.9602415 84.57403382 96.21300484 64.625 96.1875 C63.74704773 96.18689575 62.86909546 96.1862915 61.96453857 96.18566895 C19.07592487 96.10586169 -39.91259803 93.41511451 -73 62 C-78.9306699 55.24629836 -80.43599083 50.31387318 -80.3359375 41.2890625 C-79.83803904 36.41428921 -78.1709571 33.63842006 -75 30 C-74.46503906 29.34644531 -73.93007812 28.69289063 -73.37890625 28.01953125 C-67.6709352 21.67324945 -60.51571642 17.8017322 -53 14 C-51.96488281 13.47535156 -50.92976563 12.95070313 -49.86328125 12.41015625 C-38.13033527 6.96941746 -12.71912617 -4.66917274 0 0 Z " fill="#1465C0" transform="translate(192,390)"/>
</svg>`;

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
        const mapIconHTML = flight.departure_address ? `<a href="${flight.departure_address}" target="_blank" title="지도 보기" class="map-icon-link">${mapIconSvg}</a>` : '';

        return `
        <div class="ticket">
            <div class="main-content">
                <div class="header"><div class="airline-info"><span class="airline">${flight.airline}</span><span class="pass-title">BOARDING PASS</span></div></div>
                <div class="flight-info">
                    <div class="airport from"><div class="airport-name">${flight.departure_city}</div><div class="airport-code">${flight.departure_airport_code || ''}</div></div>
                    <div class="plane-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#0033a0"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>
                    <div class="airport to"><div class="airport-name">${flight.arrival_city}</div><div class="airport-code">${flight.arrival_airport_code || ''}</div></div>
                </div>
                <div class="details-grid">
                    <div class="detail-item"><span class="label">PASSENGER</span><span class="value">${flight.ticket_holder}</span></div>
                    <div class="detail-item"><span class="label">FLIGHT</span><span class="value">${flight.flight_number} ${mapIconHTML}</span></div>
                    <div class="detail-item"><span class="label">SEAT</span><span class="value seat">${flight.seat}</span></div>
                    <div class="detail-item"><span class="label">DATE</span><span class="value">${departureDate}</span></div>
                    <div class="detail-item"><span class="label">TIME</span><span class="value">${departureTime}</span></div>
                    <div class="detail-item"><span class="label">CLASS</span><span class="value">FIRST</span></div>
                </div>
            </div>
            <div class="stub">
                <div class="stub-header"><span class="pass-title-small">BOARDING PASS</span><span class="airline-small">${flight.airline}</span></div>
                <div class="stub-details">
                     <div class="detail-item"><span class="label">PASSENGER</span><span class="value-small">${flight.ticket_holder}</span></div>
                     <div class="detail-item"><span class="label">FLIGHT</span><span class="value-small">${flight.flight_number} ${mapIconHTML}</span></div>
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