let zIndexCounter = 1;

// 각 식물 이미지에 대해 드래그 가능 설정 및 이벤트 추가
document.querySelectorAll('.plant').forEach((plant) => {
    plant.draggable = true;

    // 드래그 시작 시, 현재 위치 정보를 저장
    plant.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.dataTransfer.effectAllowed = 'move';
    });

    // 더블 클릭 시 맨 앞으로 오도록 설정
    plant.addEventListener('dblclick', () => {
        zIndexCounter++;
        plant.style.zIndex = zIndexCounter;
    });
});

// 페이지 전체에서 dragover 이벤트 허용
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});

// drop 이벤트로 드롭된 요소 위치 조정
document.addEventListener('drop', (e) => {
    e.preventDefault();

    // 드래그한 요소의 ID 가져오기
    const plantId = e.dataTransfer.getData('text');
    const plant = document.getElementById(plantId);

    // 드롭할 때 모든 요소를 body에 추가하여 부모 요소의 영향을 없앰
    document.body.appendChild(plant);

    // 드롭 위치 설정 (화면의 스크롤 위치 포함하여 정확히 배치)
    const x = e.pageX;
    const y = e.pageY;

    // 요소의 위치를 드롭된 위치에 맞게 조정
    plant.style.position = 'absolute';
    plant.style.left = `${x - plant.offsetWidth / 2}px`;
    plant.style.top = `${y - plant.offsetHeight / 2}px`;
});
