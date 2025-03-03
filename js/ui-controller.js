// UI控制器模块
const UIController = (function() {
    // 私有变量
    let currentZoom = 1;
    let resultZoom = 1;
    
    // 公共接口
    return {
        setupZoomControls: function() {
            const imageContainer = document.getElementById('imageContainer');
            const framesContainer = document.getElementById('framesContainer');
            
            // 原始图像缩放
            document.getElementById('zoom1x').addEventListener('click', () => {
                imageContainer.classList.remove('zoom-2x', 'zoom-4x', 'zoom-8x');
                imageContainer.classList.add('zoom-1x');
                currentZoom = 1;
                FrameProcessor.updateGridOverlay();
            });
            
            document.getElementById('zoom2x').addEventListener('click', () => {
                imageContainer.classList.remove('zoom-1x', 'zoom-4x', 'zoom-8x');
                imageContainer.classList.add('zoom-2x');
                currentZoom = 2;
                FrameProcessor.updateGridOverlay();
            });
            
            document.getElementById('zoom4x').addEventListener('click', () => {
                imageContainer.classList.remove('zoom-1x', 'zoom-2x', 'zoom-8x');
                imageContainer.classList.add('zoom-4x');
                currentZoom = 4;
                FrameProcessor.updateGridOverlay();
            });
            
            document.getElementById('zoom8x').addEventListener('click', () => {
                imageContainer.classList.remove('zoom-1x', 'zoom-2x', 'zoom-4x');
                imageContainer.classList.add('zoom-8x');
                currentZoom = 8;
                FrameProcessor.updateGridOverlay();
            });
            
            // 结果缩放
            document.getElementById('resultZoom1x').addEventListener('click', () => {
                framesContainer.classList.remove('zoom-2x', 'zoom-4x', 'zoom-8x');
                framesContainer.classList.add('zoom-1x');
                resultZoom = 1;
            });
            
            document.getElementById('resultZoom2x').addEventListener('click', () => {
                framesContainer.classList.remove('zoom-1x', 'zoom-4x', 'zoom-8x');
                framesContainer.classList.add('zoom-2x');
                resultZoom = 2;
            });
            
            document.getElementById('resultZoom4x').addEventListener('click', () => {
                framesContainer.classList.remove('zoom-1x', 'zoom-2x', 'zoom-8x');
                framesContainer.classList.add('zoom-4x');
                resultZoom = 4;
            });
            
            document.getElementById('resultZoom8x').addEventListener('click', () => {
                framesContainer.classList.remove('zoom-1x', 'zoom-2x', 'zoom-4x');
                framesContainer.classList.add('zoom-8x');
                resultZoom = 8;
            });
        },
        
        setupInputEvents: function() {
            document.getElementById('frameWidth').addEventListener('input', FrameProcessor.updateFrameCount.bind(FrameProcessor));
            document.getElementById('frameHeight').addEventListener('input', FrameProcessor.updateFrameCount.bind(FrameProcessor));
            document.getElementById('frameColumns').addEventListener('input', FrameProcessor.updateManualFrameCount.bind(FrameProcessor));
            document.getElementById('frameRows').addEventListener('input', FrameProcessor.updateManualFrameCount.bind(FrameProcessor));
            document.getElementById('offsetX').addEventListener('input', FrameProcessor.updateFrameCount.bind(FrameProcessor));
            document.getElementById('offsetY').addEventListener('input', FrameProcessor.updateFrameCount.bind(FrameProcessor));
            document.getElementById('spacingX').addEventListener('input', FrameProcessor.updateFrameCount.bind(FrameProcessor));
            document.getElementById('spacingY').addEventListener('input', FrameProcessor.updateFrameCount.bind(FrameProcessor));
        },
        
        setupButtonEvents: function() {
            document.getElementById('applySettings').addEventListener('click', FrameProcessor.applySettings.bind(FrameProcessor));
            document.getElementById('exportFrames').addEventListener('click', ExportManager.exportFrames);
            document.getElementById('downloadAllFrames').addEventListener('click', ExportManager.downloadAllFrames);
            document.getElementById('downloadZip').addEventListener('click', ExportManager.downloadAsZip);
            document.getElementById('generateCode').addEventListener('click', ExportManager.generateCode);
        },
        
        setupSectionCollapse: function() {
            const collapsibleHeaders = document.querySelectorAll('.section-header.collapsible');
            
            collapsibleHeaders.forEach(header => {
                // 默认折叠切分设置
                if (header.textContent.includes('切分设置')) {
                    header.classList.add('collapsed');
                }
                
                header.addEventListener('click', function() {
                    this.classList.toggle('collapsed');
                });
            });
        }
    };
})(); 