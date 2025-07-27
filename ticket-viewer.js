document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('ticket-carousel');
    const carouselWrapper = document.getElementById('ticket-carousel-wrapper');

    let ticketsData = [];
    let currentIndex = 0;

    const createTicketHTML = (data, index) => {
        const { flight } = data;
        // 아이콘 SVG를 올바른 비행기 모양으로 수정하고, 색상을 지정합니다.
        const ticketContent = `
            <div class="main-content">
                <div class="header"><div class="airline-info"><span class="airline">${flight.airline}</span><span class="pass-title">BOARDING PASS</span></div></div>
                <div class="flight-info">
                    <div class="airport from"><div class="airport-name">${flight.departure_city}</div><div class="airport-code">ICN</div></div>
                    <div class="plane-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#0033a0"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>
                    <div class="airport to"><div class="airport-name">${flight.arrival_city}</div><div class="airport-code">CDG</div></div>
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
                <div class="barcode"><svg id="barcode-${index}"></svg></div>
            </div>
        `;

        return `
        <div class="preview-wrapper">
            <div class="ticket-original ticket">${ticketContent}</div>
            <div class="ticket-torn-container">
                <div class="ticket-half left">
                    <div class="ticket">${ticketContent}</div>
                </div>
                <div class="torn-edge" style="background-image: url(#tear-filter);"></div>
                <div class="ticket-half right">
                    <div class="ticket">${ticketContent}</div>
                </div>
            </div>
        </div>`;
    };

    const getTicketFullHeight = () => {
        const wrapper = carousel.querySelector('.preview-wrapper');
        if (!wrapper) return 630; // Fallback
        const style = window.getComputedStyle(wrapper);
        const marginTop = parseInt(style.marginTop, 10) || 0;
        const marginBottom = parseInt(style.marginBottom, 10) || 0;
        return wrapper.offsetHeight + marginTop + marginBottom;
    };

    const showTicket = (index) => {
        const yOffset = -index * getTicketFullHeight();
        carousel.style.transform = `translateY(${yOffset}px)`;
    };

    const setupTickets = () => {
        document.querySelectorAll('.preview-wrapper').forEach((wrapper, index) => {
            const ticketOriginal = wrapper.querySelector('.ticket-original');
            const stub = wrapper.querySelector('.stub');
            const { flight_number, seat } = ticketsData[index].flight;
            JsBarcode(`#barcode-${index}`, `${flight_number}${seat}`, { format: "CODE128", width: 2, height: 60, displayValue: false });

            // 호버 효과에서 currentIndex 체크를 제거하여 모든 티켓에서 동작하도록 수정
            wrapper.addEventListener('mousemove', (e) => {
                if (!ticketOriginal.classList.contains('hidden')) {
                    const rect = wrapper.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) / 20;
                    const y = (e.clientY - rect.top - rect.height / 2) / 20;
                    ticketOriginal.style.transform = `rotateY(${x}deg) rotateX(${-y}deg) scale(1.05)`;
                }
            });

            wrapper.addEventListener('mouseleave', () => {
                if (!ticketOriginal.classList.contains('hidden')) {
                    ticketOriginal.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
                }
            });

            // 찢기 효과는 현재 활성화된 티켓에서만 동작하도록 유지
            stub.addEventListener('click', () => {
                if (index === currentIndex && !ticketOriginal.classList.contains('hidden')) {
                    ticketOriginal.classList.add('hidden');
                    const leftHalf = wrapper.querySelector('.ticket-half.left');
                    const rightHalf = wrapper.querySelector('.ticket-half.right');
                    const tornEdge = wrapper.querySelector('.torn-edge');
                    leftHalf.classList.add('animate');
                    rightHalf.classList.add('animate');
                    tornEdge.classList.add('animate');

                    setTimeout(() => {
                        ticketOriginal.classList.remove('hidden');
                        leftHalf.classList.remove('animate');
                        rightHalf.classList.remove('animate');
                        tornEdge.classList.remove('animate');
                    }, 1500 + 3000); // 1.5s animation + 3s delay
                }
            });
        });
    };

    const setupDrag = () => {
        let isDragging = false;
        let startY = 0;
        let dragDeltaY = 0;

        const getEventY = (e) => e.touches ? e.touches[0].clientY : e.clientY;

        const onDragStart = (e) => {
            if (ticketsData.length < 2) return;
            isDragging = true;
            startY = getEventY(e);
            carousel.style.transition = 'none';
            carouselWrapper.style.cursor = 'grabbing';
        };

        const onDragMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            dragDeltaY = getEventY(e) - startY;
            const baseOffset = -currentIndex * getTicketFullHeight();
            carousel.style.transform = `translateY(${baseOffset + dragDeltaY}px)`;
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            carousel.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            carouselWrapper.style.cursor = 'grab';

            const swipeThreshold = getTicketFullHeight() / 4;

            if (dragDeltaY > swipeThreshold && currentIndex > 0) {
                currentIndex--;
            } else if (dragDeltaY < -swipeThreshold && currentIndex < ticketsData.length - 1) {
                currentIndex++;
            }

            showTicket(currentIndex);
            dragDeltaY = 0;
        };

        carouselWrapper.addEventListener('mousedown', onDragStart);
        carouselWrapper.addEventListener('touchstart', onDragStart, { passive: true });
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('touchend', onDragEnd);
    };

    const init = async () => {
        const groupId = window.location.pathname.split('/').pop();
        if (!groupId) {
            carousel.innerHTML = `<p style="color: #333;">Invalid ticket URL.</p>`;
            return;
        }
        try {
            const response = await fetch(`/api/tickets/${groupId}`);
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            ticketsData = await response.json();
            if (!ticketsData || ticketsData.length === 0) throw new Error('No ticket data found.');

            carousel.innerHTML = ticketsData.map((ticket, index) => createTicketHTML(ticket, index)).join('');
            setupTickets();
            showTicket(0);
            setupDrag();
        } catch (error) {
            console.error("Failed to load tickets:", error);
            carousel.innerHTML = `<p style="color: red;">Failed to load tickets: ${error.message}</p>`;
        }
    };

    init();
});