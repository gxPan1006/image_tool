// 选择处理模块 - 修改为支持自动识别
const SelectionHandler = (function() {
    // 私有变量
    let originalImage = null;
    let selections = [];
    let selectionMode = 'auto';
    
    // 公共接口
    return {
        init: function() {
            // 选择模式切换
            const modeRadios = document.querySelectorAll('input[name="selectionMode"]');
            modeRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    selectionMode = this.value;
                    
                    if (selectionMode === 'manual') {
                        // 隐藏自动检测的区域显示
                        document.querySelectorAll('.detected-region').forEach(region => {
                            region.style.display = 'none';
                        });
                        
                        // 如果已经上传了图像，直接打开选区编辑器
                        if (originalImage) {
                            // 打开选区编辑器
                            SelectionEditor.setSelections(selections);
                            SelectionEditor.showModal(originalImage);
                        } else {
                            alert('请先上传图像！');
                            // 切换回自动模式
                            document.getElementById('autoMode').checked = true;
                            selectionMode = 'auto';
                        }
                    } else {
                        // 显示自动检测的区域
                        document.querySelectorAll('.detected-region').forEach(region => {
                            region.style.display = 'block';
                        });
                        // 清除手动选区
                        selections = [];
                    }
                    
                    // 更新设置面板显示
                    this.updateSettingsVisibility();
                    
                    // 更新帧数量
                    FrameProcessor.updateFrameCount();
                });
            });
            
            // 初始化设置面板显示
            this.updateSettingsVisibility();
        },
        
        updateSettingsVisibility: function() {
            // 根据选择模式显示/隐藏相应设置
            const autoSettings = document.getElementById('autoDetectionSettings');
            const gridSettings = document.getElementById('gridSettings');
            
            if (selectionMode === 'auto') {
                autoSettings.style.display = 'block';
                gridSettings.style.display = 'none';
            } else {
                autoSettings.style.display = 'none';
                gridSettings.style.display = 'none';
            }
        },
        
        setOriginalImage: function(image) {
            originalImage = image;
            
            // 设置自动检测器的图像
            AutoDetector.setOriginalImage(image);
            
            // 如果是自动模式，立即执行检测
            if (selectionMode === 'auto') {
                this.detectRegions();
            }
        },
        
        detectRegions: function() {
            if (!originalImage) return;
            
            // 执行自动检测
            const regions = AutoDetector.detectRegions();
            
            // 更新选区
            selections = regions;
            
            // 更新帧数量
            FrameProcessor.updateFrameCount();
            
            // 显示检测到的区域
            this.showDetectedRegions(regions);
            
            // 自动应用设置，更新切分结果
            FrameProcessor.applySettings();
        },
        
        showDetectedRegions: function(regions) {
            // 清除现有区域显示
            document.querySelectorAll('.detected-region').forEach(el => el.remove());
            
            // 获取图像容器
            const container = document.getElementById('imageContainer');
            
            // 创建并显示每个检测到的区域
            regions.forEach((region, index) => {
                const regionEl = document.createElement('div');
                regionEl.className = 'detected-region';
                regionEl.style.left = `${region.x}px`;
                regionEl.style.top = `${region.y}px`;
                regionEl.style.width = `${region.width}px`;
                regionEl.style.height = `${region.height}px`;
                
                // 添加区域编号
                const label = document.createElement('span');
                label.className = 'region-label';
                label.textContent = index + 1;
                regionEl.appendChild(label);
                
                container.appendChild(regionEl);
            });
        },
        
        setSelections: function(newSelections) {
            selections = newSelections;
            FrameProcessor.updateFrameCount();
        },
        
        getSelectionMode: function() {
            return selectionMode;
        },
        
        getSelections: function() {
            if (selectionMode === 'auto') {
                return AutoDetector.getDetectedRegions();
            } else {
                return JSON.parse(JSON.stringify(selections)); // 返回深拷贝
            }
        }
    };
})(); 