document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ticket-form');
    const passengerList = document.getElementById('passenger-list');
    const addPassengerBtn = document.getElementById('add-passenger-btn');
    const passengerTemplate = document.getElementById('passenger-template');
    const tearSound = document.getElementById('tear-sound');

    // 티켓 콘텐츠 HTML 생성
    const createTicketContentHTML = (data) => {
        const { flight } = data;
        return `
        <div class="ticket">
            <div class="main-content">
                <div class="header"><div class="airline-info"><span class="airline">${flight.airline}</span><span class="pass-title">BOARDING PASS</span></div></div>
                <div class="flight-info">
                    <div class="airport from"><div class="airport-name">${flight.departure_city}</div><div class="airport-code">ICN</div></div>
                    <div class="plane-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                    <div class="airport to"><div class="airport-name">${flight.arrival_city}</div><div class="airport-code">CDG</div></div>
                </div>
                <div class="details-grid">
                    <div class="detail-item"><span class="label">PASSENGER</span><span class="value">${flight.ticket_holder || 'PASSENGER'}</span></div>
                    <div class="detail-item"><span class="label">FLIGHT</span><span class="value">${flight.flight_number}</span></div>
                    <div class="detail-item"><span class="label">SEAT</span><span class="value seat">${flight.seat || 'SEAT'}</span></div>
                    <div class="detail-item"><span class="label">CLASS</span><span class="value">FIRST</span></div>
                </div>
            </div>
            <div class="stub">
                <div class="stub-header"><span class="pass-title-small">BOARDING PASS</span><span class="airline-small">${flight.airline}</span></div>
                <div class="stub-details">
                     <div class="detail-item"><span class="label">PASSENGER</span><span class="value-small">${flight.ticket_holder || 'PASSENGER'}</span></div>
                     <div class="detail-item"><span class="label">FLIGHT</span><span class="value-small">${flight.flight_number}</span></div>
                     <div class="detail-item"><span class="label">SEAT</span><span class="value-small seat">${flight.seat || 'SEAT'}</span></div>
                </div>
                <div class="barcode"><img src="https://barcode.tec-it.com/barcode.ashx?data=${flight.flight_number}${flight.seat || ''}&code=Code128&dpi=96" alt="barcode"/></div>
            </div>
        </div>`;
    };

    // 각 승객 카드에 대한 인터랙션 설정
    const setupInteractiveTicket = (passengerCard) => {
        const originalContainer = passengerCard.querySelector('.ticket-original');
        const tornContainer = passengerCard.querySelector('.ticket-torn-container');
        let isTorn = false;

        const updatePreview = () => {
            const commonInputs = document.getElementById('common-inputs');
            const flightData = {};
            commonInputs.querySelectorAll('input').forEach(input => {
                flightData[input.name] = input.value;
            });
            flightData.ticket_holder = passengerCard.querySelector('.passenger-name').value;
            flightData.seat = passengerCard.querySelector('.passenger-seat').value;
            
            originalContainer.innerHTML = createTicketContentHTML({ flight: flightData });
            originalContainer.querySelector('.stub').addEventListener('click', handleTear);
        };

        const handleTear = () => {
            if (isTorn) return;
            isTorn = true;

            originalContainer.classList.add('hidden');
            tearSound.play().catch(e => console.warn("사운드 재생 실패"));

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

            tornContainer.innerHTML = ''; // 이전 조각들 제거
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

        // 입력 필드에 이벤트 리스너 연결
        passengerCard.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updatePreview);
        });
        // 공통 정보 변경 시에도 업데이트
        document.getElementById('common-inputs').addEventListener('input', updatePreview);

        // 초기 렌더링
        updatePreview();
    };

    // 새 승객 추가
    const addPassenger = () => {
        const card = passengerTemplate.content.cloneNode(true);
        const passengerCard = card.querySelector('.passenger-card');
        passengerList.appendChild(passengerCard);
        passengerCard.querySelector('.remove-btn').addEventListener('click', () => passengerCard.remove());
        setupInteractiveTicket(passengerCard);
    };

    addPassengerBtn.addEventListener('click', addPassenger);
    
    // 폼 제출 로직 (서버 연동)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const resultDiv = document.getElementById('result');
        const resultUrlInput = document.getElementById('result-url');

        submitBtn.disabled = true;
        submitBtn.textContent = '생성 중...';

        // 1. 공통 정보 수집
        const commonData = {};
        document.getElementById('common-inputs').querySelectorAll('input').forEach(input => {
            if (input.type === 'datetime-local') {
                commonData[input.name] = new Date(input.value).toISOString();
            } else {
                commonData[input.name] = input.value;
            }
        });

        // 2. 각 승객 정보와 공통 정보를 합쳐 최종 데이터 생성
        const ticketsPayload = Array.from(document.querySelectorAll('.passenger-card')).map(card => {
            const flight = { ...commonData };
            flight.ticket_holder = card.querySelector('.passenger-name').value;
            flight.seat = card.querySelector('.passenger-seat').value;
            return { flight };
        });

        if (ticketsPayload.length === 0) {
            alert('적어도 한 명의 탑승객을 추가해야 합니다.');
            submitBtn.disabled = false;
            submitBtn.textContent = '공유 링크 생성';
            return;
        }

        // 3. 서버로 데이터 전송
        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketsPayload)
            });
            const data = await response.json();

            if (response.ok) {
                resultUrlInput.value = `${window.location.origin}${data.url}`;
                resultDiv.classList.remove('hidden');
            } else {
                throw new Error(data.message || '알 수 없는 오류가 발생했습니다.');
            }
        } catch (error) {
            alert(`오류: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '공유 링크 생성';
        }
    });

    // 초기 승객 1명 추가
    addPassenger();
});
