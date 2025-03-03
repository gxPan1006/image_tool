// 选择处理模块 - 完全重写手动模式处理
const SelectionHandler = (function() {
    // 私有变量
    let originalImage = null;
    let selections = [];
    let selectionMode = null; // 初始不选择任何模式
    
    // 私有方法
    function openSelectionEditor() {
        console.log("打开选区编辑器", originalImage);
        if (!originalImage) {
            alert('请先上传图像！');
            return false;
        }
        
        // 确保选区编辑器已初始化
        if (typeof SelectionEditor === 'undefined') {
            console.error("SelectionEditor 未定义");
            return false;
        }
        
        // 设置选区并显示弹窗
        try {
            SelectionEditor.setSelections(selections);
            SelectionEditor.showModal(originalImage);
            return true;
        } catch (error) {
            console.error("打开选区编辑器失败:", error);
            return false;
        }
    }
    
    // 公共接口
    return {
        init: function() {
            console.log("初始化选择处理器");
            
            // 选择模式切换
            const autoModeRadio = document.getElementById('autoMode');
            const manualModeRadio = document.getElementById('manualMode');
            
            if (!autoModeRadio || !manualModeRadio) {
                console.error("找不到模式单选按钮");
                return;
            }
            
            // 移除默认选中
            autoModeRadio.checked = false;
            manualModeRadio.checked = false;
            
            // 手动模式点击事件
            manualModeRadio.addEventListener('click', function(event) {
                console.log("点击手动模式");
                
                // 如果已经是手动模式，不做任何处理
                if (selectionMode === 'manual') {
                    return;
                }
                
                // 设置模式
                selectionMode = 'manual';
                
                // 隐藏自动检测的区域
                document.querySelectorAll('.detected-region').forEach(region => {
                    region.style.display = 'none';
                });
                
                // 打开选区编辑器
                const success = openSelectionEditor();
                
                // 如果打开失败，重置模式选择
                if (!success) {
                    manualModeRadio.checked = false;
                    selectionMode = null;
                }
                
                // 更新设置面板
                SelectionHandler.updateSettingsVisibility();
            });
            
            // 自动模式点击事件
            autoModeRadio.addEventListener('click', function(event) {
                console.log("点击自动模式");
                
                // 如果已经是自动模式，不做任何处理
                if (selectionMode === 'auto') {
                    return;
                }
                
                // 设置模式
                selectionMode = 'auto';
                
                // 清除手动选区
                selections = [];
                
                // 如果已有图像，执行自动检测
                if (originalImage) {
                    SelectionHandler.detectRegions();
                } else {
                    autoModeRadio.checked = false;
                    selectionMode = null;
                    alert('请先上传图像！');
                }
                
                // 更新设置面板
                SelectionHandler.updateSettingsVisibility();
            });
            
            // 初始化设置面板显示
            this.updateSettingsVisibility();
            
            console.log("选择处理器初始化完成");
        },
        
        updateSettingsVisibility: function() {
            console.log("更新设置面板显示, 当前模式:", selectionMode);
            
            // 获取设置面板元素
            const autoSettings = document.getElementById('autoDetectionSettings');
            const gridSettings = document.getElementById('gridSettings');
            
            // 检查元素是否存在
            if (!autoSettings) {
                console.error("找不到自动检测设置面板元素");
                return;
            }
            
            // 根据模式显示/隐藏相应设置
            if (selectionMode === 'auto') {
                if (autoSettings) autoSettings.style.display = 'block';
                if (gridSettings) gridSettings.style.display = 'none';
            } else if (selectionMode === 'manual') {
                if (autoSettings) autoSettings.style.display = 'none';
                if (gridSettings) gridSettings.style.display = 'none';
            } else {
                // 没有选择模式
                if (autoSettings) autoSettings.style.display = 'none';
                if (gridSettings) gridSettings.style.display = 'none';
            }
        },
        
        setOriginalImage: function(image) {
            originalImage = image;
            
            // 设置自动检测器的图像
            if (typeof AutoDetector !== 'undefined') {
                AutoDetector.setOriginalImage(image);
            }
            
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
            if (!container) return;
            
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
            } else if (selectionMode === 'manual') {
                return JSON.parse(JSON.stringify(selections)); // 返回深拷贝
            } else {
                return [];
            }
        },
        
        // 添加直接打开选区编辑器的方法
        openManualEditor: function() {
            if (selectionMode !== 'manual') {
                const manualModeRadio = document.getElementById('manualMode');
                if (manualModeRadio) {
                    manualModeRadio.checked = true;
                }
                selectionMode = 'manual';
                this.updateSettingsVisibility();
            }
            
            return openSelectionEditor();
        }
    };
})(); 