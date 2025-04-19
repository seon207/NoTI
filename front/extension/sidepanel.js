/* eslint-disable */
document.addEventListener('DOMContentLoaded', function () {
    const dropArea = document.getElementById('drop-area');
    const preview = document.getElementById('preview');
    const status = document.getElementById('status');

    // 이벤트 로그 출력 함수
    function log(message) {
        console.log(message);
        status.textContent = message;
    }

    // 드래그 이벤트 처리
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // 기본 동작 방지
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 하이라이트 효과
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
        log('드래그 중...');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    // 드롭 처리
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        log(`파일 드롭됨: ${files.length}개`);

        if (files.length > 0) {
            const file = files[0];
            log(`파일 정보: ${file.name}, 타입: ${file.type}, 크기: ${file.size} 바이트`);

            if (file.type.match('image.*')) {
                displayImage(file);
            } else {
                log('이미지 파일이 아닙니다!');
            }
        }
    }

    // 이미지 파일 표시 함수
    function displayImage(file) {
        const reader = new FileReader();

        reader.onloadstart = function () {
            log('이미지 로딩 시작...');
        };

        reader.onload = function (e) {
            log('이미지 로드 완료!');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };

        reader.onerror = function () {
            log('이미지 로드 실패: ' + reader.error);
        };

        reader.readAsDataURL(file);
    }

    const pasteButton = document.getElementById('paste-image');
    if (pasteButton) {
        pasteButton.addEventListener('click', () => {
            log('클립보드에서 이미지 붙여넣기 요청...');
            // 클립보드 API 사용하여 이미지 가져오기
            navigator.clipboard.read()
                .then(clipboardItems => {
                    let imageFound = false;

                    // 클립보드 항목 순회
                    for (const clipboardItem of clipboardItems) {
                        // 이미지 타입 확인
                        for (const type of clipboardItem.types) {
                            if (type.startsWith('image/')) {
                                imageFound = true;

                                // 이미지 블롭 가져오기
                                clipboardItem.getType(type)
                                    .then(blob => {
                                        // Blob을 이미지로 표시
                                        const file = new File([blob], "clipboard-image.png", { type });
                                        displayImage(file);
                                        log('클립보드에서 이미지를 성공적으로 불러왔습니다.');
                                    })
                                    .catch(err => {
                                        log('클립보드 이미지 처리 실패: ' + err);
                                    });

                                // 첫 번째 이미지만 처리
                                break;
                            }
                        }

                        if (imageFound) break;
                    }

                    if (!imageFound) {
                        log('클립보드에 이미지가 없습니다.');
                    }
                })
                .catch(err => {
                    log('클립보드 접근 실패: ' + err);
                    // 권한 오류 또는 보안 정책으로 인한 실패 가능성
                    log('키보드 단축키(Ctrl+V)를 사용하여 직접 붙여넣기를 시도해보세요.');
                });
        });
    }

    // 서비스 워커로부터 메시지 수신 리스너
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

        // 이미지 업데이트 이벤트 처리
        if (message.action === 'imageUpdated' && message.imageData) {
            navigator.clipboard.read()
                .then(clipboardItems => {
                    let imageFound = false;

                    // 클립보드 항목 순회
                    for (const clipboardItem of clipboardItems) {
                        // 이미지 타입 확인
                        for (const type of clipboardItem.types) {
                            if (type.startsWith('image/')) {
                                imageFound = true;

                                // 이미지 블롭 가져오기
                                clipboardItem.getType(type)
                                    .then(blob => {
                                        // Blob을 이미지로 표시
                                        const file = new File([blob], "clipboard-image.png", { type });
                                        displayImage(file);
                                        log('클립보드에서 이미지를 성공적으로 불러왔습니다.');
                                    })
                                    .catch(err => {
                                        log('클립보드 이미지 처리 실패: ' + err);
                                    });

                                // 첫 번째 이미지만 처리
                                break;
                            }
                        }

                        if (imageFound) break;
                    }

                    if (!imageFound) {
                        log('클립보드에 이미지가 없습니다.');
                    }
                })
                .catch(err => {
                    log('클립보드 접근 실패: ' + err);
                    // 권한 오류 또는 보안 정책으로 인한 실패 가능성
                    log('키보드 단축키(Ctrl+V)를 사용하여 직접 붙여넣기를 시도해보세요.');
                });
        }

        // 비동기 응답을 위해 true 반환
        return true;
    });

});