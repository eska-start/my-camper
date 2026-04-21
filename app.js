// State Management
let reservation = JSON.parse(localStorage.getItem('campReservation')) || null;
let checklist = JSON.parse(localStorage.getItem('campChecklist')) || [
    { id: 1, text: '텐트 및 폴대', completed: false },
    { id: 2, text: '침낭 및 매트', completed: false },
    { id: 3, text: '취사도구 세트', completed: false },
    { id: 4, text: '랜턴 및 배터리', completed: false },
    { id: 5, text: '구급함', completed: false }
];
let currentFilter = 'all';

// DOM Elements
const resCard = document.getElementById('reservationCard');
const resForm = document.getElementById('reservationForm');
const checklistContainer = document.getElementById('checklist');
const progressFill = document.getElementById('progressBarFill');
const progressText = document.getElementById('progressText');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    renderReservation();
    renderChecklist();
    updateProgress();
    setupEventListeners();
});

function updateDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('ko-KR', options);
}

// Reservation Logic
function renderReservation() {
    const campgroundEl = document.getElementById('resCampground');
    const checkInEl = document.getElementById('resCheckIn');
    const checkOutEl = document.getElementById('resCheckOut');

    if (reservation) {
        resCard.classList.remove('empty');
        campgroundEl.textContent = reservation.campground;
        checkInEl.textContent = formatDateTime(reservation.checkIn);
        checkOutEl.textContent = formatDateTime(reservation.checkOut);
    } else {
        resCard.classList.add('empty');
        campgroundEl.textContent = '예약 정보가 없습니다.';
        checkInEl.textContent = '-';
        checkOutEl.textContent = '-';
    }
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString('ko-KR', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
}

// Checklist Logic
function renderChecklist() {
    checklistContainer.innerHTML = '';
    
    const filteredList = checklist.filter(item => {
        if (currentFilter === 'pending') return !item.completed;
        if (currentFilter === 'completed') return item.completed;
        return true;
    });

    filteredList.forEach(item => {
        const li = document.createElement('li');
        li.className = `checklist-item ${item.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="checkbox-custom" onclick="toggleItem(${item.id})"></div>
            <span onclick="toggleItem(${item.id})">${item.text}</span>
            <button class="btn-delete" onclick="deleteItem(${item.id})">✕</button>
        `;
        checklistContainer.appendChild(li);
    });
}

function toggleItem(id) {
    checklist = checklist.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveAndRender();
}

function deleteItem(id) {
    checklist = checklist.filter(item => item.id !== id);
    saveAndRender();
    showToast('아이템이 삭제되었습니다.');
}

function addItem() {
    const input = document.getElementById('newItemInput');
    const text = input.value.trim();
    if (text) {
        const newItem = {
            id: Date.now(),
            text: text,
            completed: false
        };
        checklist.push(newItem);
        input.value = '';
        saveAndRender();
        showToast('새 준비물이 추가되었습니다.');
    }
}

function updateProgress() {
    if (checklist.length === 0) {
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        return;
    }
    const completedCount = checklist.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / checklist.length) * 100);
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

function saveAndRender() {
    localStorage.setItem('campChecklist', JSON.stringify(checklist));
    renderChecklist();
    updateProgress();
}

// UI Event Listeners
function setupEventListeners() {
    // Reservation Actions
    const openResForm = () => {
        resCard.classList.add('hidden');
        resForm.classList.remove('hidden');
        if (reservation) {
            document.getElementById('inputCampground').value = reservation.campground;
            document.getElementById('inputCheckIn').value = reservation.checkIn;
            document.getElementById('inputCheckOut').value = reservation.checkOut;
        }
    };

    document.getElementById('editReservationBtn').addEventListener('click', openResForm);
    resCard.addEventListener('click', openResForm);

    document.getElementById('saveReservationBtn').addEventListener('click', () => {
        const campground = document.getElementById('inputCampground').value;
        const checkIn = document.getElementById('inputCheckIn').value;
        const checkOut = document.getElementById('inputCheckOut').value;

        if (campground && checkIn && checkOut) {
            reservation = { campground, checkIn, checkOut };
            localStorage.setItem('campReservation', JSON.stringify(reservation));
            resForm.classList.add('hidden');
            resCard.classList.remove('hidden');
            renderReservation();
            showToast('예약 정보가 저장되었습니다.');
        } else {
            showToast('모든 정보를 입력해주세요.');
        }
    });

    document.getElementById('cancelReservationBtn').addEventListener('click', () => {
        resForm.classList.add('hidden');
        resCard.classList.remove('hidden');
    });

    // Checklist Actions
    document.getElementById('addItemBtn').addEventListener('click', addItem);
    document.getElementById('newItemInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderChecklist();
        });
    });

    // Share & Export
    document.getElementById('shareBtn').addEventListener('click', () => {
        let text = `[🏕️ Camper 캠핑 일정 공유]\n\n`;
        if (reservation) {
            text += `📍 캠핑장: ${reservation.campground}\n`;
            text += `📅 입실: ${formatDateTime(reservation.checkIn)}\n`;
            text += `📅 퇴실: ${formatDateTime(reservation.checkOut)}\n\n`;
        }
        text += `✅ 체크리스트 현황\n`;
        checklist.forEach(item => {
            text += `${item.completed ? '☑️' : '⬜'} ${item.text}\n`;
        });
        
        navigator.clipboard.writeText(text).then(() => {
            showToast('일정이 클립보드에 복사되었습니다! 카톡에 붙여넣으세요.');
        });
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        const data = {
            reservation,
            checklist,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `camper_data_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        showToast('데이터 파일이 다운로드되었습니다.');
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2000);
}
