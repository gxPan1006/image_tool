// 选择处理模块 - 修改为使用弹窗编辑器
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
                        // 隐藏自动网格
                        document.querySelectorAll('.grid-overlay').forEach(grid => {
                            grid.style.display = 'none';
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
                        // 显示自动网格
                        document.querySelectorAll('.grid-overlay').forEach(grid => {
                            grid.style.display = 'block';
                        });
                        // 清除选区
                        selections = [];
                    }
                    
                    // 更新帧数量
                    FrameProcessor.updateFrameCount();
                });
            });
        },
        
        setOriginalImage: function(image) {
            originalImage = image;
        },
        
        setSelections: function(newSelections) {
            selections = newSelections;
            FrameProcessor.updateManualFrameCount();
        },
        
        getSelectionMode: function() {
            return selectionMode;
        },
        
        getManualSelections: function() {
            return JSON.parse(JSON.stringify(selections)); // 返回深拷贝
        }
    };
})(); 