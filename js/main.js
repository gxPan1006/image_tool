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
        ExportManager.confirmZipDownload();
    });
    
    // 允许在输入框中按Enter确认
    document.getElementById('zipFilename').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            ExportManager.confirmZipDownload();
        }
    });
}); 