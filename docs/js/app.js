document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ticket-form');
    const passengerList = document.getElementById('passenger-list');
    const addPassengerBtn = document.getElementById('add-passenger-btn');
    const passengerTemplate = document.getElementById('passenger-template');
    const previewArea = document.getElementById('preview-area');
    const previewTemplate = document.getElementById('preview-template');
    const tearSound = document.getElementById('tear-sound');
    const resultDiv = document.getElementById('result');
    const resultUrlInput = document.getElementById('result-url');
    const resultLink = document.getElementById('result-link');

    let lastGeneratedUrl = '';

    const createTicketContentHTML = (flightData, index) => {
        const departure = flightData.departure_datetime ? new Date(flightData.departure_datetime) : null;
        const departureDate = departure ? `${departure.getFullYear()}.${String(departure.getMonth() + 1).padStart(2, '0')}.${String(departure.getDate()).padStart(2, '0')}` : '';
        const departureTime = departure ? `${String(departure.getHours()).padStart(2, '0')}:${String(departure.getMinutes()).padStart(2, '0')}` : '';
        const mapLink = flightData.departure_address ? `<a href="${flightData.departure_address}" target="_blank" title="지도 보기">🗺️</a>` : '';

        return `
        <div class="ticket">
            <div class="main-content">
                <div class="header"><div class="airline-info"><span class="airline">${flightData.airline || ''}</span><span class="pass-title">BOARDING PASS</span></div></div>
                <div class="flight-info">
                    <div class="airport from"><div class="airport-name">${flightData.departure_city || ''} ${mapLink}</div><div class="airport-code">${flightData.departure_airport_code || ''}</div></div>
                    <div class="plane-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#0033a0"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>
                    <div class="airport to"><div class="airport-name">${flightData.arrival_city || ''}</div><div class="airport-code">${flightData.arrival_airport_code || ''}</div></div>
                </div>
                <div class="details-grid">
                    <div class="detail-item"><span class="label">PASSENGER</span><span class="value">${flightData.ticket_holder || 'PASSENGER'}</span></div>
                    <div class="detail-item"><span class="label">FLIGHT</span><span class="value">${flightData.flight_number || ''}</span></div>
                    <div class="detail-item"><span class="label">SEAT</span><span class="value seat">${flightData.seat || 'SEAT'}</span></div>
                    <div class="detail-item"><span class="label">DATE</span><span class="value">${departureDate}</span></div>
                    <div class="detail-item"><span class="label">DEPARTURE</span><span class="value">${departureTime}</span></div>
                    <div class="detail-item"><span class="label">CLASS</span><span class="value">FIRST</span></div>
                </div>
            </div>
            <div class="stub">
                <div class="stub-header"><span class="pass-title-small">BOARDING PASS</span><span class="airline-small">${flightData.airline || ''}</span></div>
                <div class="stub-details">
                     <div class="detail-item"><span class="label">PASSENGER</span><span class="value-small">${flightData.ticket_holder || 'PASSENGER'}</span></div>
                     <div class="detail-item"><span class="label">FLIGHT</span><span class="value-small">${flightData.flight_number || ''}</span></div>
                     <div class="detail-item"><span class="label">SEAT</span><span class="value-small seat">${flightData.seat || 'SEAT'}</span></div>
                </div>
                <div class="barcode" id="qrcode-preview-${index}"></div>
            </div>
        </div>`;
    };

    const setupInteractiveTicket = (previewWrapper) => {
        const originalContainer = previewWrapper.querySelector('.ticket-original');
        const tornContainer = previewWrapper.querySelector('.ticket-torn-container');
        let isTorn = false;

        originalContainer.addEventListener('mousemove', (e) => {
            if (isTorn) return;
            const rect = previewWrapper.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 20;
            const y = (e.clientY - rect.top - rect.height / 2) / 20;
            originalContainer.style.transform = `scale(0.5) rotateY(${x}deg) rotateX(${-y}deg) scale(1.05)`;
        });

        originalContainer.addEventListener('mouseleave', () => {
            if (isTorn) return;
            originalContainer.style.transform = 'scale(0.5) rotateY(0deg) rotateX(0deg) scale(1)';
        });

        const handleTear = () => {
            if (isTorn) return;
            isTorn = true;
            originalContainer.style.transform = 'scale(0.5) rotateY(0deg) rotateX(0deg) scale(1)';
            originalContainer.classList.add('hidden');
            tearSound.play().catch(e => console.warn("Sound playback failed"));

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
            }, 2000);
        };
        
        originalContainer.querySelector('.stub').addEventListener('click', handleTear);
    };

    const updateAllPreviews = () => {
        previewArea.innerHTML = '';
        
        const commonData = {};
        document.getElementById('common-inputs').querySelectorAll('input').forEach(input => {
            commonData[input.name] = input.value;
        });

        const passengerCards = document.querySelectorAll('.passenger-card');
        if (passengerCards.length === 0) {
            previewArea.innerHTML = '<p>탑승객을 추가하여 미리보기를 확인하세요.</p>';
            return;
        }

        passengerCards.forEach((card, index) => {
            const flightData = { ...commonData };
            flightData.ticket_holder = card.querySelector('.passenger-name').value;
            flightData.seat = card.querySelector('.passenger-seat').value;

            const previewNode = previewTemplate.content.cloneNode(true);
            const previewWrapper = previewNode.querySelector('.preview-wrapper');
            const originalContainer = previewWrapper.querySelector('.ticket-original');

            originalContainer.innerHTML = createTicketContentHTML(flightData, index);
            
            const qrcodeContainer = originalContainer.querySelector(`#qrcode-preview-${index}`);
            
            const singleTicketPayload = { tickets: [{ flight: flightData }] };
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

            setupInteractiveTicket(previewWrapper);
            previewArea.appendChild(previewNode);
        });
    };

    const addPassenger = () => {
        const cardNode = passengerTemplate.content.cloneNode(true);
        const passengerCard = cardNode.querySelector('.passenger-card');
        
        passengerCard.querySelector('.remove-btn').addEventListener('click', () => {
            passengerCard.remove();
            updateAllPreviews();
        });
        
        passengerCard.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateAllPreviews);
        });

        passengerList.appendChild(cardNode);
        updateAllPreviews();
    };

    document.getElementById('common-inputs').addEventListener('input', updateAllPreviews);
    addPassengerBtn.addEventListener('click', addPassenger);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        
        submitBtn.disabled = true;
        submitBtn.textContent = '생성 중...';

        const commonData = {};
        document.getElementById('common-inputs').querySelectorAll('input').forEach(input => {
            commonData[input.name] = input.type === 'datetime-local' ? new Date(input.value).toISOString() : input.value;
        });

        const tickets = Array.from(document.querySelectorAll('.passenger-card')).map(card => ({
            flight: {
                ...commonData,
                ticket_holder: card.querySelector('.passenger-name').value,
                seat: card.querySelector('.passenger-seat').value,
            }
        }));

        if (tickets.length === 0) {
            alert('적어도 한 명의 탑승객을 추가해야 합니다.');
            submitBtn.disabled = false;
            submitBtn.textContent = '공유 링크 생성';
            return;
        }

        try {
            const jsonString = JSON.stringify({ tickets });
            const compressed = pako.deflate(jsonString);
            const binaryString = String.fromCharCode.apply(null, compressed);
            const encoded = btoa(binaryString);
            
            const url = new URL('ticket.html', window.location.href);
            url.searchParams.set('data', encoded);
            const finalUrl = url.href;

            if (finalUrl === lastGeneratedUrl) {
                resultDiv.classList.remove('hidden');
            } else {
                lastGeneratedUrl = finalUrl;
                resultUrlInput.value = finalUrl;
                resultLink.href = finalUrl;
                resultDiv.classList.remove('hidden');
            }
        } catch (error) {
            alert(`오류가 발생했습니다: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '공유 링크 생성';
        }
    });

    addPassenger();
});