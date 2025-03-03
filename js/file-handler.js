// 文件处理模块
const FileHandler = (function() {
    // 私有变量
    let originalImage = null;
    
    // 私有方法
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    }
    
    // 公共接口
    return {
        setupFileDrop: function() {
            const dropArea = document.getElementById('dropArea');
            const fileInput = document.getElementById('fileInput');
            const fileInfo = document.getElementById('fileInfo');
            
            dropArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    this.handleFiles(e.target.files);
                }
            });
            
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropArea.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            });
            
            dropArea.addEventListener('dragleave', () => {
                dropArea.style.backgroundColor = '';
            });
            
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.style.backgroundColor = '';
                
                if (e.dataTransfer.files.length) {
                    this.handleFiles(e.dataTransfer.files);
                }
            });
        },
        
        handleFiles: function(files) {
            const file = files[0];
            const fileInfo = document.getElementById('fileInfo');
            
            if (!file.type.match('image.*')) {
                alert('请选择图像文件！');
                return;
            }
            
            // 提取文件名（不含扩展名）
            const fileName = file.name.split('.')[0];
            
            // 设置作物名称为文件名
            if (fileName) {
                document.getElementById('cropName').value = fileName;
            }
            
            fileInfo.textContent = `已选择: ${file.name} (${formatFileSize(file.size)})`;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 保存原始图像
                    originalImage = img;
                    
                    // 保存原始文件名
                    originalImage.fileName = fileName;
                    
                    // 显示图像
                    const imgElement = document.getElementById('originalImage');
                    imgElement.src = img.src;
                    
                    // 更新文件信息
                    fileInfo.textContent = `图像尺寸: ${img.width} × ${img.height} 像素`;
                    
                    // 设置选择处理器的图像
                    SelectionHandler.setOriginalImage(img);
                    
                    // 设置帧处理器的图像
                    FrameProcessor.setOriginalImage(img);
                    
                    // 提示用户选择模式
                    if (!SelectionHandler.getSelectionMode()) {
                        const message = document.createElement('div');
                        message.className = 'mode-prompt';
                        message.textContent = '请选择处理模式: 自动识别或手动框选';
                        message.style.color = '#4caf50';
                        message.style.fontWeight = 'bold';
                        message.style.marginTop = '10px';
                        message.style.textAlign = 'center';
                        
                        const container = document.querySelector('.selection-mode-container');
                        
                        // 移除已有提示
                        const existingPrompt = container.querySelector('.mode-prompt');
                        if (existingPrompt) {
                            existingPrompt.remove();
                        }
                        
                        container.appendChild(message);
                        
                        // 5秒后自动隐藏提示
                        setTimeout(() => {
                            message.style.opacity = '0';
                            setTimeout(() => message.remove(), 1000);
                        }, 5000);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        
        getOriginalImage: function() {
            return originalImage;
        },
        
        handleImageLoad: function(image) {
            // 设置原始图像
            originalImage = image;
            
            // 显示图像
            const imgElement = document.getElementById('originalImage');
            imgElement.src = image.src;
            
            // 更新文件信息
            document.getElementById('fileInfo').textContent = `图像尺寸: ${image.width} × ${image.height} 像素`;
            
            // 设置选择处理器的图像
            SelectionHandler.setOriginalImage(image);
            
            // 设置帧处理器的图像
            FrameProcessor.setOriginalImage(image);
            
            // 如果是自动模式，自动应用设置
            if (SelectionHandler.getSelectionMode() === 'auto') {
                FrameProcessor.applySettings();
            }
        }
    };
})(); 