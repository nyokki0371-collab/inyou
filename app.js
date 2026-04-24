document.addEventListener('DOMContentLoaded', () => {
    const yinElements = ["下", "右", "内", "中央", "入", "降", "沈", "凹", "裏", "偶数", "夜", "夕", "暗", "静", "冬", "秋", "寒", "涼", "北", "西", "水", "月", "地", "女", "雌", "腹", "臓", "血", "液", "死", "柔", "魄"].map(label => ({ label, type: "陰" }));
    const yangElements = ["上", "左", "外", "末端", "出", "昇", "浮", "凸", "表", "奇数", "昼", "朝", "明", "動", "夏", "春", "熱", "温", "南", "東", "火", "日", "天", "男", "雄", "背", "腑", "気", "津", "生", "剛", "魂"].map(label => ({ label, type: "陽" }));
    
    // 全てのアイテムをシャッフルして統合
    const allElements = [...yinElements, ...yangElements].sort(() => Math.random() - 0.5);
    
    let isAllQuestionsMode = false;
    let selectedLane = null;
    
    const elements = {
        poolArea: document.getElementById('pool-area'),
        yinDropArea: document.getElementById('yin-drop-area'),
        yangDropArea: document.getElementById('yang-drop-area'),
        yinLane: document.getElementById('yin-lane'),
        yangLane: document.getElementById('yang-lane'),
        showGuideBtn: document.getElementById('show-guide-btn'),
        toggleModeBtn: document.getElementById('toggle-mode-btn'),
        resetBtn: document.getElementById('reset-btn'),
        judgeBtn: document.getElementById('judge-btn'),
        guideModal: document.getElementById('guide-modal'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        neverShowAgainCb: document.getElementById('never-show-again')
    };

    // --- ガイドモーダルの処理 ---
    if (localStorage.getItem('hideYinYangGuide') !== 'true') {
        elements.guideModal.classList.remove('hidden');
    }

    elements.closeModalBtn.addEventListener('click', () => {
        if (elements.neverShowAgainCb.checked) {
            localStorage.setItem('hideYinYangGuide', 'true');
        }
        elements.guideModal.classList.add('hidden');
    });

    elements.showGuideBtn.addEventListener('click', () => {
        elements.guideModal.classList.remove('hidden');
    });

    // --- アイテムの生成 ---
    allElements.forEach(itemData => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('item');
        itemEl.textContent = itemData.label;
        itemEl.dataset.type = itemData.type;
        itemEl.draggable = true;

        itemEl.addEventListener('dragstart', handleDragStart);
        itemEl.addEventListener('dragend', handleDragEnd);
        itemEl.addEventListener('click', handleItemClick);

        elements.poolArea.appendChild(itemEl);
    });

    // --- モード切替 ---
    elements.toggleModeBtn.addEventListener('click', () => {
        isAllQuestionsMode = !isAllQuestionsMode;
        if (isAllQuestionsMode) {
            elements.toggleModeBtn.textContent = '全問モード';
            checkAllItemsPlaced(); // 一括判定ボタンの表示をチェック
        } else {
            elements.toggleModeBtn.textContent = '各問モード';
            elements.judgeBtn.classList.add('hidden');
            
            // 各問モードに切り替えた瞬間、配置済みのものを判定
            document.querySelectorAll('#yin-drop-area .item, #yang-drop-area .item').forEach(item => {
                judgeItem(item, item.parentElement.id.includes('yin') ? '陰' : '陽');
            });
        }
        updateAllItemsVisuals();
    });

    // --- 初期化処理 ---
    elements.resetBtn.addEventListener('click', () => {
        const items = Array.from(document.querySelectorAll('.item'));
        
        // アイテムをシャッフル
        items.sort(() => Math.random() - 0.5);
        
        items.forEach(item => {
            item.classList.remove('correct', 'incorrect');
            elements.poolArea.appendChild(item);
        });
        elements.judgeBtn.classList.add('hidden');
    });

    // --- 一括判定処理 ---
    elements.judgeBtn.addEventListener('click', () => {
        document.querySelectorAll('#yin-drop-area .item').forEach(item => judgeItem(item, '陰'));
        document.querySelectorAll('#yang-drop-area .item').forEach(item => judgeItem(item, '陽'));
    });

    // --- 判定ロジック ---
    function judgeItem(itemEl, targetType) {
        itemEl.classList.remove('correct', 'incorrect');
        if (itemEl.dataset.type === targetType) {
            itemEl.classList.add('correct');
        } else {
            itemEl.classList.add('incorrect');
        }
    }

    function updateAllItemsVisuals() {
        if (isAllQuestionsMode) {
            // 全問モード配置中は色をクリア
            const items = document.querySelectorAll('.item');
            items.forEach(item => {
                // judgeがまだ行われていないならクリア
                // (一括判定ボタンが押された後は色がつく)
                item.classList.remove('correct', 'incorrect');
            });
        }
    }

    function checkAllItemsPlaced() {
        if (isAllQuestionsMode) {
            if (elements.poolArea.children.length === 0) {
                elements.judgeBtn.classList.remove('hidden');
            } else {
                elements.judgeBtn.classList.add('hidden');
            }
        }
    }

    // --- ドラッグ＆ドロップ ---
    let draggedItem = null;

    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
        checkAllItemsPlaced();
    }

    const dropAreas = [elements.poolArea, elements.yinDropArea, elements.yangDropArea];
    
    dropAreas.forEach(area => {
        area.addEventListener('dragover', e => {
            e.preventDefault();
            if(area !== elements.poolArea) {
                area.parentElement.classList.add('drag-over');
            }
        });
        
        area.addEventListener('dragleave', e => {
            if(area !== elements.poolArea) {
                area.parentElement.classList.remove('drag-over');
            }
        });

        area.addEventListener('drop', e => {
            e.preventDefault();
            if(area !== elements.poolArea) {
                area.parentElement.classList.remove('drag-over');
            }
            if (draggedItem) {
                area.appendChild(draggedItem);
                
                // アイテムの判定
                if (area === elements.poolArea) {
                    draggedItem.classList.remove('correct', 'incorrect');
                } else if (!isAllQuestionsMode) {
                    const targetType = area === elements.yinDropArea ? '陰' : '陽';
                    judgeItem(draggedItem, targetType);
                } else {
                    draggedItem.classList.remove('correct', 'incorrect');
                }
            }
        });
    });

    // --- タップ操作 (レーン選択) ---
    function selectLane(laneEl) {
        if (selectedLane === laneEl) {
            selectedLane.classList.remove('selected');
            selectedLane = null;
        } else {
            if (selectedLane) selectedLane.classList.remove('selected');
            selectedLane = laneEl;
            selectedLane.classList.add('selected');
        }
    }

    elements.yinLane.addEventListener('click', (e) => {
        // Drop area のクリックでは反応させない
        if (e.target.classList.contains('item')) return;
        selectLane(elements.yinLane);
    });

    elements.yangLane.addEventListener('click', (e) => {
        if (e.target.classList.contains('item')) return;
        selectLane(elements.yangLane);
    });

    // --- タップ操作 (アイテム移動) ---
    function handleItemClick(e) {
        e.stopPropagation(); // レーンのクリックイベントを発火させない
        const item = this;
        
        const parentArea = item.parentElement;
        
        if (parentArea === elements.poolArea) {
            // プールから配置
            if (selectedLane) {
                const targetArea = selectedLane.id === 'yin-lane' ? elements.yinDropArea : elements.yangDropArea;
                targetArea.appendChild(item);
                
                if (!isAllQuestionsMode) {
                    const targetType = selectedLane.dataset.type;
                    judgeItem(item, targetType);
                } else {
                    item.classList.remove('correct', 'incorrect');
                }
            }
        } else {
            // レーンからプールへ戻す
            elements.poolArea.appendChild(item);
            item.classList.remove('correct', 'incorrect');
        }
        checkAllItemsPlaced();
    }

});
