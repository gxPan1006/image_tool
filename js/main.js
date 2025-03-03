// 主入口文件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化文件处理
    FileHandler.setupFileDrop();
    
    // 初始化选择处理
    SelectionHandler.init();
    
    // 初始化选区编辑器
    SelectionEditor.init();
    
    // 初始化UI控制
    UIController.setupZoomControls();
    UIController.setupInputEvents();
    UIController.setupButtonEvents();
    UIController.setupSectionCollapse();
    
    // 设置ZIP文件名弹窗事件
    document.getElementById('closeZipNameModal').addEventListener('click', function() {
        document.getElementById('zipNameModal').style.display = 'none';
    });
    
    document.getElementById('cancelZipDownload').addEventListener('click', function() {
        document.getElementById('zipNameModal').style.display = 'none';
    });
    
    document.getElementById('confirmZipDownload').addEventListener('click', function() {
        const defaultName = document.getElementById('zipFilename').value || 'frames';
        ExportManager.confirmZipDownload(defaultName);
    });
    
    // 允许在输入框中按Enter确认
    document.getElementById('zipFilename').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const defaultName = this.value || 'frames';
            ExportManager.confirmZipDownload(defaultName);
        }
    });
    
    // 添加自动检测设置事件
    document.getElementById('minRegionSize').addEventListener('change', function() {
        if (SelectionHandler.getSelectionMode() === 'auto') {
            SelectionHandler.detectRegions();
        }
    });
    
    document.getElementById('mergeThreshold').addEventListener('change', function() {
        if (SelectionHandler.getSelectionMode() === 'auto') {
            SelectionHandler.detectRegions();
        }
    });
    
    document.getElementById('paddingSize').addEventListener('change', function() {
        if (SelectionHandler.getSelectionMode() === 'auto') {
            SelectionHandler.detectRegions();
        }
    });
    
    // 添加调试按钮事件
    const debugOpenEditorBtn = document.getElementById('debugOpenEditor');
    if (debugOpenEditorBtn) {
        debugOpenEditorBtn.addEventListener('click', function() {
            console.log("点击调试按钮");
            SelectionHandler.openManualEditor();
        });
    }
    
    // 添加导出按钮事件
    document.getElementById('exportFrames').addEventListener('click', function() {
        console.log("点击导出所有帧按钮");
        ExportManager.generatePythonCode();
    });
    
    document.getElementById('downloadAllFrames').addEventListener('click', function() {
        console.log("点击下载所有帧按钮");
        ExportManager.downloadAllFrames();
    });
    
    document.getElementById('downloadZip').addEventListener('click', function() {
        console.log("点击打包下载按钮");
        ExportManager.downloadAsZip();
    });
    
    document.getElementById('generateCode').addEventListener('click', function() {
        console.log("点击生成Python代码按钮");
        ExportManager.generatePythonCode();
    });
}); 