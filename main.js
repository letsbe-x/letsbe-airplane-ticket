document.addEventListener('DOMContentLoaded', () => {
    const originalContainer = document.getElementById('ticket-original');
    const tornContainer = document.getElementById('ticket-torn-container');
    const tearSound = document.getElementById('tear-sound');
    let isTorn = false;

    const ticketData = {
        flight: {
            departure_city: "서울",
            arrival_city: "파리",
            departure_datetime: "2025-08-01T14:30",
            airline: "Korean Air",
            flight_number: "KE901",
            seat: "24A",
            ticket_holder: "홍길동"
        }
    };

    // 티켓 HTML 생성 함수
    const createTicketContent = () => {
        const { flight } = ticketData;
        const departure_code = 'ICN';
        const arrival_code = 'CDG';

        return `
            <div class="ticket">
                <div class="main-content">
                    <div class="header"><div class="airline-info"><span class="airline">${flight.airline}</span><span class="pass-title">BOARDING PASS</span></div></div>
                    <div class="flight-info">
                        <div class="airport from"><div class="airport-name">${flight.departure_city}</div><div class="airport-code">${departure_code}</div></div>
                        <div class="plane-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0033a0" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                        <div class="airport to"><div class="airport-name">${flight.arrival_city}</div><div class="airport-code">${arrival_code}</div></div>
                    </div>
                    <div class="details-grid">
                        <div class="detail-item"><span class="label">PASSENGER</span><span class="value">${flight.ticket_holder}</span></div>
                        <div class="detail-item"><span class="label">FLIGHT</span><span class="value">${flight.flight_number}</span></div>
                        <div class="detail-item"><span class="label">SEAT</span><span class="value seat">${flight.seat}</span></div>
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
                    <div class="barcode"><img src="https://barcode.tec-it.com/barcode.ashx?data=${flight.flight_number}${flight.seat}&code=Code128&dpi=96" alt="barcode"/></div>
                </div>
            </div>
        `;
    };

    // 찢기 이벤트 핸들러
    const handleTear = () => {
        if (isTorn) return;
        isTorn = true;

        // 1. 원본 티켓 숨기기
        originalContainer.classList.add('hidden');

        // 2. 사운드 재생 (tear.mp3 파일이 필요합니다)
        tearSound.play().catch(e => console.warn("사운드 재생 실패. 사용자의 상호작용이 필요할 수 있습니다."));

        // 3. 찢어진 조각들 생성
        const leftHalf = document.createElement('div');
        const rightHalf = document.createElement('div');
        
        leftHalf.className = 'ticket-half left';
        rightHalf.className = 'ticket-half right';

        // 각 조각에 티켓 내용 복제
        leftHalf.innerHTML = createTicketContent();
        rightHalf.innerHTML = createTicketContent();

        // 찢어진 가장자리 효과 추가
        const tearEdge = document.createElement('div');
        tearEdge.className = 'torn-edge';
        leftHalf.appendChild(tearEdge.cloneNode());
        rightHalf.appendChild(tearEdge.cloneNode());

        // DOM에 추가
        tornContainer.appendChild(leftHalf);
        tornContainer.appendChild(rightHalf);

        // 4. 애니메이션 실행
        setTimeout(() => {
            leftHalf.classList.add('animate');
            rightHalf.classList.add('animate');
        }, 50);

        // 5. 애니메이션 종료 후, 다시 시도할 수 있도록 리셋
        setTimeout(() => {
            tornContainer.innerHTML = '';
            originalContainer.classList.remove('hidden');
            isTorn = false;
        }, 2000); // 애니메이션 시간보다 길게 설정
    };

    // 초기 티켓 렌더링
    originalContainer.innerHTML = createTicketContent();
    originalContainer.querySelector('.stub').addEventListener('click', handleTear);
});