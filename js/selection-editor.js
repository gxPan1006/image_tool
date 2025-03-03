// 选区编辑器模块 - 添加缩放功能
const SelectionEditor = (function() {
    // 私有变量
    let canvas = null;
    let ctx = null;
    let originalImage = null;
    let selections = [];
    let activeSelectionIndex = -1;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let scale = 1;
    let zoomLevel = 1; // 用户缩放级别
    let mousePosition = { x: 0, y: 0 }; // 鼠标位置
    
    // 私有方法
    function drawSelections() {
        if (!ctx || !originalImage) return;
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制图像
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
        // 绘制所有选区
        selections.forEach((selection, index) => {
            const isActive = index === activeSelectionIndex;
            
            ctx.strokeStyle = isActive ? '#f44336' : '#ff9800';
            ctx.lineWidth = 2;
            ctx.setLineDash(isActive ? [] : [5, 5]);
            ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
            
            ctx.fillStyle = isActive ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 152, 0, 0.2)';
            ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
            
            // 绘制选区编号
            ctx.fillStyle = isActive ? '#f44336' : '#ff9800';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`${index + 1}`, selection.x + 5, selection.y + 20);
        });
        
        // 更新选区信息显示
        updateSelectionInfo();
    }
    
    function updateSelectionInfo() {
        const infoElement = document.getElementById('selectionInfo');
        
        if (activeSelectionIndex >= 0 && activeSelectionIndex < selections.length) {
            const selection = selections[activeSelectionIndex];
            infoElement.textContent = `选区 ${activeSelectionIndex + 1}: (${selection.x}, ${selection.y}) ${selection.width} × ${selection.height}`;
            infoElement.style.display = 'block';
        } else if (mousePosition.x > 0 && mousePosition.y > 0) {
            infoElement.textContent = `位置: (${Math.round(mousePosition.x)}, ${Math.round(mousePosition.y)})`;
            infoElement.style.display = 'block';
        } else {
            infoElement.style.display = 'none';
        }
    }
    
    function updateSelectionList() {
        const selectionList = document.getElementById('selectionList');
        selectionList.innerHTML = '';
        
        selections.forEach((selection, index) => {
            const item = document.createElement('div');
            item.className = `selection-item${index === activeSelectionIndex ? ' active' : ''}`;
            
            const info = document.createElement('div');
            info.className = 'selection-item-info';
            info.textContent = `选区 ${index + 1}: (${selection.x}, ${selection.y}, ${selection.width} × ${selection.height})`;
            
            const actions = document.createElement('div');
            actions.className = 'selection-item-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'secondary-button';
            editBtn.textContent = '编辑';
            editBtn.addEventListener('click', () => {
                setActiveSelection(index);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'secondary-button';
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', () => {
                selections.splice(index, 1);
                if (activeSelectionIndex === index) {
                    activeSelectionIndex = -1;
                } else if (activeSelectionIndex > index) {
                    activeSelectionIndex--;
                }
                updateSelectionList();
                drawSelections();
            });
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            item.appendChild(info);
            item.appendChild(actions);
            selectionList.appendChild(item);
            
            // 点击选区项设置为活动选区
            item.addEventListener('click', (e) => {
                if (e.target === item || e.target === info) {
                    setActiveSelection(index);
                }
            });
        });
    }
    
    function setActiveSelection(index) {
        activeSelectionIndex = index;
        
        if (index >= 0 && index < selections.length) {
            const selection = selections[index];
            document.getElementById('selectionX').value = selection.x;
            document.getElementById('selectionY').value = selection.y;
            document.getElementById('selectionWidth').value = selection.width;
            document.getElementById('selectionHeight').value = selection.height;
            
            // 滚动到选区位置
            const container = document.getElementById('canvasScrollContainer');
            container.scrollLeft = selection.x * zoomLevel - container.clientWidth / 2 + selection.width * zoomLevel / 2;
            container.scrollTop = selection.y * zoomLevel - container.clientHeight / 2 + selection.height * zoomLevel / 2;
        }
        
        updateSelectionList();
        drawSelections();
    }
    
    function addSelection() {
        const x = parseInt(document.getElementById('selectionX').value) || 0;
        const y = parseInt(document.getElementById('selectionY').value) || 0;
        const width = parseInt(document.getElementById('selectionWidth').value) || 32;
        const height = parseInt(document.getElementById('selectionHeight').value) || 32;
        
        // 确保选区在画布范围内
        const boundedX = Math.max(0, Math.min(canvas.width - width, x));
        const boundedY = Math.max(0, Math.min(canvas.height - height, y));
        
        const newSelection = {
            x: boundedX,
            y: boundedY,
            width: width,
            height: height
        };
        
        selections.push(newSelection);
        setActiveSelection(selections.length - 1);
    }
    
    function updateSelection() {
        if (activeSelectionIndex < 0 || activeSelectionIndex >= selections.length) return;
        
        const x = parseInt(document.getElementById('selectionX').value) || 0;
        const y = parseInt(document.getElementById('selectionY').value) || 0;
        const width = parseInt(document.getElementById('selectionWidth').value) || 32;
        const height = parseInt(document.getElementById('selectionHeight').value) || 32;
        
        // 确保选区在画布范围内
        const boundedX = Math.max(0, Math.min(canvas.width - width, x));
        const boundedY = Math.max(0, Math.min(canvas.height - height, y));
        
        selections[activeSelectionIndex] = {
            x: boundedX,
            y: boundedY,
            width: width,
            height: height
        };
        
        updateSelectionList();
        drawSelections();
    }
    
    function updateZoom(newZoom) {
        zoomLevel = newZoom / 100;
        
        // 更新缩放显示
        document.getElementById('editorZoomValue').textContent = `${newZoom}%`;
        document.getElementById('editorZoomSlider').value = newZoom;
        
        // 应用缩放
        const container = document.getElementById('canvasContainer');
        container.style.transform = `scale(${zoomLevel})`;
        
        // 调整画布容器大小
        container.style.width = `${canvas.width}px`;
        container.style.height = `${canvas.height}px`;
    }
    
    function getCanvasCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const containerRect = document.getElementById('canvasScrollContainer').getBoundingClientRect();
        const scrollLeft = document.getElementById('canvasScrollContainer').scrollLeft;
        const scrollTop = document.getElementById('canvasScrollContainer').scrollTop;
        
        // 计算相对于画布的坐标，考虑缩放和滚动
        const x = (e.clientX - containerRect.left + scrollLeft) / zoomLevel;
        const y = (e.clientY - containerRect.top + scrollTop) / zoomLevel;
        
        return { x, y };
    }
    
    function handleCanvasMouseDown(e) {
        const coords = getCanvasCoordinates(e);
        const x = coords.x;
        const y = coords.y;
        
        // 检查是否点击了现有选区
        let clickedIndex = -1;
        for (let i = selections.length - 1; i >= 0; i--) {
            const s = selections[i];
            if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
                clickedIndex = i;
                break;
            }
        }
        
        if (clickedIndex >= 0) {
            // 点击了现有选区，设为活动选区
            setActiveSelection(clickedIndex);
            
            // 准备拖动
            isDragging = true;
            startX = x;
            startY = y;
        } else {
            // 点击了空白区域，创建新选区
            startX = x;
            startY = y;
            isDragging = true;
            activeSelectionIndex = -1;
            updateSelectionList();
        }
    }
    
    function handleCanvasMouseMove(e) {
        const coords = getCanvasCoordinates(e);
        mousePosition = coords;
        
        if (!isDragging) {
            updateSelectionInfo();
            return;
        }
        
        const x = coords.x;
        const y = coords.y;
        
        if (activeSelectionIndex >= 0) {
            // 拖动现有选区
            const selection = selections[activeSelectionIndex];
            const dx = x - startX;
            const dy = y - startY;
            
            // 计算新位置，确保不超出画布边界
            let newX = Math.max(0, selection.x + dx);
            let newY = Math.max(0, selection.y + dy);
            
            if (newX + selection.width > canvas.width) {
                newX = canvas.width - selection.width;
            }
            
            if (newY + selection.height > canvas.height) {
                newY = canvas.height - selection.height;
            }
            
            selection.x = Math.round(newX);
            selection.y = Math.round(newY);
            
            // 更新表单
            document.getElementById('selectionX').value = selection.x;
            document.getElementById('selectionY').value = selection.y;
            
            startX = x;
            startY = y;
        } else {
            // 绘制新选区
            const width = Math.abs(x - startX);
            const height = Math.abs(y - startY);
            const left = Math.min(startX, x);
            const top = Math.min(startY, y);
            
            // 临时绘制选区
            drawSelections();
            ctx.strokeStyle = '#2196F3';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(left, top, width, height);
            ctx.fillStyle = 'rgba(33, 150, 243, 0.2)';
            ctx.fillRect(left, top, width, height);
            
            // 更新选区信息
            document.getElementById('selectionInfo').textContent = 
                `新选区: (${Math.round(left)}, ${Math.round(top)}) ${Math.round(width)} × ${Math.round(height)}`;
            document.getElementById('selectionInfo').style.display = 'block';
        }
    }
    
    function handleCanvasMouseUp(e) {
        if (!isDragging) return;
        
        const coords = getCanvasCoordinates(e);
        const x = coords.x;
        const y = coords.y;
        
        if (activeSelectionIndex < 0) {
            // 完成创建新选区
            const width = Math.abs(x - startX);
            const height = Math.abs(y - startY);
            
            // 只有当选区有一定大小时才创建
            if (width > 5 && height > 5) {
                const left = Math.min(startX, x);
                const top = Math.min(startY, y);
                
                const newSelection = {
                    x: Math.round(left),
                    y: Math.round(top),
                    width: Math.round(width),
                    height: Math.round(height)
                };
                
                selections.push(newSelection);
                setActiveSelection(selections.length - 1);
            }
        }
        
        isDragging = false;
        drawSelections();
    }
    
    // 公共接口
    return {
        init: function() {
            // 初始化画布
            canvas = document.getElementById('selectionCanvas');
            ctx = canvas.getContext('2d');
            
            // 添加事件监听器
            canvas.addEventListener('mousedown', handleCanvasMouseDown);
            canvas.addEventListener('mousemove', handleCanvasMouseMove);
            canvas.addEventListener('mouseup', handleCanvasMouseUp);
            canvas.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    drawSelections();
                }
            });
            
            // 添加缩放控制
            const zoomSlider = document.getElementById('editorZoomSlider');
            zoomSlider.addEventListener('input', function() {
                updateZoom(parseInt(this.value));
            });
            
            document.getElementById('resetZoomBtn').addEventListener('click', function() {
                updateZoom(100);
            });
            
            // 添加按钮事件
            document.getElementById('addSelectionBtn').addEventListener('click', addSelection);
            document.getElementById('clearSelectionsBtn').addEventListener('click', () => {
                selections = [];
                activeSelectionIndex = -1;
                updateSelectionList();
                drawSelections();
            });
            document.getElementById('updateSelectionBtn').addEventListener('click', updateSelection);
            
            // 弹窗控制
            document.getElementById('closeSelectionModal').addEventListener('click', this.hideModal);
            document.getElementById('cancelSelectionBtn').addEventListener('click', this.hideModal);
            document.getElementById('applySelectionsBtn').addEventListener('click', () => {
                this.applySelections();
                this.hideModal();
            });
        },
        
        showModal: function(image) {
            originalImage = image;
            
            // 设置画布大小
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
            
            // 重置缩放
            updateZoom(100);
            
            // 显示弹窗
            document.getElementById('selectionModal').style.display = 'flex';
            
            // 绘制图像和选区
            drawSelections();
            updateSelectionList();
        },
        
        hideModal: function() {
            document.getElementById('selectionModal').style.display = 'none';
        },
        
        setSelections: function(newSelections) {
            selections = JSON.parse(JSON.stringify(newSelections)); // 深拷贝
            activeSelectionIndex = selections.length > 0 ? 0 : -1;
            drawSelections();
            updateSelectionList();
        },
        
        getSelections: function() {
            return JSON.parse(JSON.stringify(selections)); // 返回深拷贝
        },
        
        applySelections: function() {
            // 将选区应用到主应用程序
            const newSelections = this.getSelections();
            console.log("应用选区:", newSelections);
            SelectionHandler.setSelections(newSelections);
            
            // 隐藏弹窗
            this.hideModal();
            
            // 自动应用设置，更新切分结果
            FrameProcessor.applySettings();
        }
    };
})(); 