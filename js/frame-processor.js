// 帧处理模块
const FrameProcessor = (function() {
    // 私有变量
    let frames = [];
    
    // 私有方法
    function createFramePreview(frameDataURL, index, label, selection) {
        const framesContainer = document.getElementById('framesContainer');
        
        // 创建帧预览
        const frameDiv = document.createElement('div');
        frameDiv.className = 'frame';
        frameDiv.dataset.index = index;
        
        const frameImg = document.createElement('img');
        frameImg.src = frameDataURL;
        frameImg.alt = `帧 ${index + 1}`;
        
        const frameLabel = document.createElement('div');
        frameLabel.className = 'frame-label';
        frameLabel.textContent = label;
        
        // 添加帧名称输入框
        const frameNameInput = document.createElement('input');
        frameNameInput.type = 'text';
        frameNameInput.className = 'frame-name-input';
        frameNameInput.value = `stage_${index + 1}`;
        frameNameInput.placeholder = '输入帧名称';
        
        // 添加下载按钮
        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.textContent = '下载';
        downloadButton.addEventListener('click', function() {
            ExportManager.downloadFrame(index, frameNameInput.value);
        });
        
        frameDiv.appendChild(frameImg);
        frameDiv.appendChild(frameLabel);
        frameDiv.appendChild(frameNameInput);
        frameDiv.appendChild(downloadButton);
        framesContainer.appendChild(frameDiv);
    }
    
    // 公共接口
    return {
        updateFrameCount: function() {
            const originalImage = FileHandler.getOriginalImage();
            if (!originalImage) return;
            
            // 如果是手动选区模式，不自动计算帧数
            if (SelectionHandler.getSelectionMode() === 'manual') {
                const selections = SelectionHandler.getManualSelections();
                document.getElementById('totalFrames').value = selections.length;
                return;
            }
            
            const frameWidth = parseInt(document.getElementById('frameWidth').value) || 16;
            const frameHeight = parseInt(document.getElementById('frameHeight').value) || 16;
            const offsetX = parseInt(document.getElementById('offsetX').value) || 0;
            const offsetY = parseInt(document.getElementById('offsetY').value) || 0;
            const spacingX = parseInt(document.getElementById('spacingX').value) || 0;
            const spacingY = parseInt(document.getElementById('spacingY').value) || 0;
            
            // 计算横向和纵向的帧数
            const availableWidth = originalImage.width - offsetX;
            const availableHeight = originalImage.height - offsetY;
            
            const columns = Math.floor(availableWidth / (frameWidth + spacingX));
            const rows = Math.floor(availableHeight / (frameHeight + spacingY));
            
            document.getElementById('frameColumns').value = columns;
            document.getElementById('frameRows').value = rows;
            document.getElementById('totalFrames').value = columns * rows;
            
            // 更新网格覆盖
            this.updateGridOverlay();
        },
        
        updateManualFrameCount: function() {
            // 如果是手动选区模式，总帧数等于选区数量
            if (SelectionHandler.getSelectionMode() === 'manual') {
                const selections = SelectionHandler.getManualSelections();
                document.getElementById('totalFrames').value = selections.length;
                return;
            }
            
            const columns = parseInt(document.getElementById('frameColumns').value) || 1;
            const rows = parseInt(document.getElementById('frameRows').value) || 1;
            
            document.getElementById('totalFrames').value = columns * rows;
            
            // 更新网格覆盖
            this.updateGridOverlay();
        },
        
        updateGridOverlay: function() {
            // 如果是手动选区模式，不显示网格
            if (SelectionHandler.getSelectionMode() === 'manual') {
                // 清除现有网格
                const existingGrids = document.querySelectorAll('.grid-overlay');
                existingGrids.forEach(grid => {
                    grid.style.display = 'none';
                });
                return;
            }
            
            // 清除现有网格
            const existingGrids = document.querySelectorAll('.grid-overlay');
            existingGrids.forEach(grid => grid.remove());
            
            const originalImage = FileHandler.getOriginalImage();
            if (!originalImage) return;
            
            const frameWidth = parseInt(document.getElementById('frameWidth').value) || 16;
            const frameHeight = parseInt(document.getElementById('frameHeight').value) || 16;
            const offsetX = parseInt(document.getElementById('offsetX').value) || 0;
            const offsetY = parseInt(document.getElementById('offsetY').value) || 0;
            const spacingX = parseInt(document.getElementById('spacingX').value) || 0;
            const spacingY = parseInt(document.getElementById('spacingY').value) || 0;
            const columns = parseInt(document.getElementById('frameColumns').value) || 1;
            const rows = parseInt(document.getElementById('frameRows').value) || 1;
            
            const imageContainer = document.getElementById('imageContainer');
            
            // 创建网格覆盖
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < columns; col++) {
                    const grid = document.createElement('div');
                    grid.className = 'grid-overlay';
                    
                    const left = offsetX + col * (frameWidth + spacingX);
                    const top = offsetY + row * (frameHeight + spacingY);
                    
                    grid.style.left = `${left}px`;
                    grid.style.top = `${top}px`;
                    grid.style.width = `${frameWidth}px`;
                    grid.style.height = `${frameHeight}px`;
                    
                    imageContainer.appendChild(grid);
                }
            }
        },
        
        applySettings: function() {
            const originalImage = FileHandler.getOriginalImage();
            if (!originalImage) {
                alert('请先上传图像！');
                return;
            }
            
            // 更新网格覆盖
            this.updateGridOverlay();
            
            // 清空帧容器
            const framesContainer = document.getElementById('framesContainer');
            framesContainer.innerHTML = '';
            frames = [];
            
            // 创建离屏画布
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 根据选择模式处理
            if (SelectionHandler.getSelectionMode() === 'manual') {
                // 手动选区模式
                const selections = SelectionHandler.getManualSelections();
                
                if (selections.length === 0) {
                    alert('请先添加至少一个选区！');
                    return;
                }
                
                // 处理每个手动选区
                selections.forEach((selection, index) => {
                    canvas.width = selection.width;
                    canvas.height = selection.height;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.drawImage(
                        originalImage,
                        selection.x, selection.y, selection.width, selection.height,
                        0, 0, selection.width, selection.height
                    );
                    
                    const frameDataURL = canvas.toDataURL();
                    frames.push(frameDataURL);
                    
                    // 创建帧预览
                    createFramePreview(frameDataURL, index, `选区 ${index + 1}`, selection);
                });
                
                // 更新总帧数
                document.getElementById('totalFrames').value = selections.length;
                
            } else {
                // 自动网格模式
                const frameWidth = parseInt(document.getElementById('frameWidth').value) || 16;
                const frameHeight = parseInt(document.getElementById('frameHeight').value) || 16;
                const offsetX = parseInt(document.getElementById('offsetX').value) || 0;
                const offsetY = parseInt(document.getElementById('offsetY').value) || 0;
                const spacingX = parseInt(document.getElementById('spacingX').value) || 0;
                const spacingY = parseInt(document.getElementById('spacingY').value) || 0;
                const columns = parseInt(document.getElementById('frameColumns').value) || 1;
                const rows = parseInt(document.getElementById('frameRows').value) || 1;
                
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                
                // 切分帧
                let frameIndex = 0;
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < columns; col++) {
                        ctx.clearRect(0, 0, frameWidth, frameHeight);
                        
                        const sx = offsetX + col * (frameWidth + spacingX);
                        const sy = offsetY + row * (frameHeight + spacingY);
                        
                        ctx.drawImage(
                            originalImage,
                            sx, sy, frameWidth, frameHeight,
                            0, 0, frameWidth, frameHeight
                        );
                        
                        const frameDataURL = canvas.toDataURL();
                        frames.push(frameDataURL);
                        
                        // 创建帧预览
                        createFramePreview(
                            frameDataURL, 
                            frameIndex, 
                            `帧 ${frameIndex + 1} (行${row + 1},列${col + 1})`, 
                            { x: sx, y: sy, width: frameWidth, height: frameHeight }
                        );
                        
                        frameIndex++;
                    }
                }
            }
        },
        
        getFrames: function() {
            return frames;
        }
    };
})(); 