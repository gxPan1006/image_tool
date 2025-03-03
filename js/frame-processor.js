// 帧处理模块
const FrameProcessor = (function() {
    // 私有变量
    let originalImage = null;
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
        setOriginalImage: function(image) {
            originalImage = image;
        },
        
        updateFrameCount: function() {
            // 根据选择模式更新帧数量
            const selectionMode = SelectionHandler.getSelectionMode();
            
            if (selectionMode === 'auto') {
                // 自动识别模式，使用检测到的区域数量
                const regions = SelectionHandler.getSelections();
                document.getElementById('totalFrames').value = regions.length;
            } else if (selectionMode === 'manual') {
                // 手动框选模式，使用选区数量
                const selections = SelectionHandler.getSelections();
                document.getElementById('totalFrames').value = selections.length;
            } else {
                // 自动网格模式（已废弃）
                const frameWidth = parseInt(document.getElementById('frameWidth').value);
                const frameHeight = parseInt(document.getElementById('frameHeight').value);
                const frameColumns = parseInt(document.getElementById('frameColumns').value);
                const frameRows = parseInt(document.getElementById('frameRows').value);
                
                document.getElementById('totalFrames').value = frameColumns * frameRows;
            }
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
            if (!originalImage) {
                alert('请先上传图像！');
                return;
            }
            
            const selectionMode = SelectionHandler.getSelectionMode();
            
            if (!selectionMode) {
                alert('请先选择处理模式: 自动识别或手动框选');
                return;
            }
            
            if (selectionMode === 'auto') {
                // 自动识别模式
                this.processAutoDetection();
            } else if (selectionMode === 'manual') {
                // 手动框选模式
                this.processManualSelection();
            }
            
            // 显示切分结果
            this.displayFrames();
        },
        
        processAutoDetection: function() {
            // 获取自动检测的区域
            const regions = SelectionHandler.getSelections();
            
            // 获取边距设置
            const padding = parseInt(document.getElementById('paddingSize').value) || 0;
            
            // 创建临时画布
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // 清空现有帧
            frames = [];
            
            // 处理每个检测到的区域
            regions.forEach((region, index) => {
                // 应用边距
                const paddedRegion = {
                    x: Math.max(0, region.x - padding),
                    y: Math.max(0, region.y - padding),
                    width: region.width + padding * 2,
                    height: region.height + padding * 2
                };
                
                // 设置画布大小
                tempCanvas.width = paddedRegion.width;
                tempCanvas.height = paddedRegion.height;
                
                // 清除画布
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // 绘制区域
                tempCtx.drawImage(
                    originalImage,
                    paddedRegion.x, paddedRegion.y, paddedRegion.width, paddedRegion.height,
                    0, 0, paddedRegion.width, paddedRegion.height
                );
                
                // 创建新图像
                const frameImage = new Image();
                frameImage.src = tempCanvas.toDataURL();
                
                // 添加到帧列表
                frames.push({
                    image: frameImage,
                    x: paddedRegion.x,
                    y: paddedRegion.y,
                    width: paddedRegion.width,
                    height: paddedRegion.height,
                    name: `frame_${index + 1}`
                });
            });
        },
        
        processManualSelection: function() {
            // 获取手动选区
            const selections = SelectionHandler.getSelections();
            console.log("处理手动选区:", selections);
            
            if (!selections || selections.length === 0) {
                alert('请先添加选区！');
                return;
            }
            
            // 创建临时画布
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // 清空现有帧
            frames = [];
            
            // 处理每个选区
            selections.forEach((selection, index) => {
                // 设置画布大小
                tempCanvas.width = selection.width;
                tempCanvas.height = selection.height;
                
                // 清除画布
                tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // 绘制选区
                tempCtx.drawImage(
                    originalImage,
                    selection.x, selection.y, selection.width, selection.height,
                    0, 0, selection.width, selection.height
                );
                
                // 创建新图像
                const frameImage = new Image();
                frameImage.src = tempCanvas.toDataURL();
                
                // 添加到帧列表
                frames.push({
                    image: frameImage,
                    x: selection.x,
                    y: selection.y,
                    width: selection.width,
                    height: selection.height,
                    name: `frame_${index + 1}`
                });
            });
        },
        
        processGridSelection: function() {
            // 获取设置
            const frameWidth = parseInt(document.getElementById('frameWidth').value);
            const frameHeight = parseInt(document.getElementById('frameHeight').value);
            const frameColumns = parseInt(document.getElementById('frameColumns').value);
            const frameRows = parseInt(document.getElementById('frameRows').value);
            const offsetX = parseInt(document.getElementById('offsetX').value) || 0;
            const offsetY = parseInt(document.getElementById('offsetY').value) || 0;
            const spacingX = parseInt(document.getElementById('spacingX').value) || 0;
            const spacingY = parseInt(document.getElementById('spacingY').value) || 0;
            
            // 创建临时画布
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = frameWidth;
            tempCanvas.height = frameHeight;
            
            // 清空现有帧
            frames = [];
            
            // 切分图像
            for (let row = 0; row < frameRows; row++) {
                for (let col = 0; col < frameColumns; col++) {
                    // 计算位置
                    const x = offsetX + col * (frameWidth + spacingX);
                    const y = offsetY + row * (frameHeight + spacingY);
                    
                    // 清除画布
                    tempCtx.clearRect(0, 0, frameWidth, frameHeight);
                    
                    // 绘制帧
                    tempCtx.drawImage(
                        originalImage,
                        x, y, frameWidth, frameHeight,
                        0, 0, frameWidth, frameHeight
                    );
                    
                    // 创建新图像
                    const frameImage = new Image();
                    frameImage.src = tempCanvas.toDataURL();
                    
                    // 添加到帧列表
                    frames.push({
                        image: frameImage,
                        x: x,
                        y: y,
                        width: frameWidth,
                        height: frameHeight,
                        name: `frame_${row * frameColumns + col + 1}`
                    });
                }
            }
        },
        
        displayFrames: function() {
            const framesContainer = document.getElementById('framesContainer');
            framesContainer.innerHTML = '';
            
            frames.forEach((frame, index) => {
                const frameElement = document.createElement('div');
                frameElement.className = 'frame';
                
                const frameImage = document.createElement('img');
                frameImage.src = frame.image.src;
                frameImage.alt = `Frame ${index + 1}`;
                
                const frameInfo = document.createElement('div');
                frameInfo.className = 'frame-info';
                frameInfo.textContent = `${frame.width}×${frame.height}`;
                
                const frameName = document.createElement('input');
                frameName.type = 'text';
                frameName.className = 'frame-name';
                frameName.value = frame.name || `frame_${index + 1}`;
                frameName.addEventListener('change', function() {
                    frame.name = this.value;
                });
                
                // 添加下载按钮
                const downloadButton = document.createElement('button');
                downloadButton.className = 'download-button';
                downloadButton.textContent = '下载';
                downloadButton.addEventListener('click', function() {
                    ExportManager.downloadSingleFrame(frame.image.src, frameName.value);
                });
                
                frameElement.appendChild(frameImage);
                frameElement.appendChild(frameInfo);
                frameElement.appendChild(frameName);
                frameElement.appendChild(downloadButton);
                framesContainer.appendChild(frameElement);
            });
        },
        
        getFrames: function() {
            return frames;
        }
    };
})(); 