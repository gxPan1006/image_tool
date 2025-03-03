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
            const originalImageElem = document.getElementById('originalImage');
            const frameHeightInput = document.getElementById('frameHeight');
            
            if (!file.type.match('image.*')) {
                alert('请选择图像文件！');
                return;
            }
            
            fileInfo.textContent = `已选择: ${file.name} (${formatFileSize(file.size)})`;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImageElem.src = e.target.result;
                originalImageElem.onload = () => {
                    originalImage = originalImageElem;
                    
                    // 设置选择处理器的原始图像
                    SelectionHandler.setOriginalImage(originalImage);
                    
                    // 自动设置帧高度为图像高度
                    frameHeightInput.value = originalImageElem.height;
                    
                    // 更新帧数量
                    FrameProcessor.updateFrameCount();
                    
                    // 应用设置
                    FrameProcessor.applySettings();
                };
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