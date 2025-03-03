// 导出管理器模块 - 完全重写
const ExportManager = (function() {
    // 私有方法
    function downloadSingleImage(dataURL, filename) {
        console.log("下载单个图像:", filename);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function createZipFile(frames, zipFilename) {
        console.log("创建ZIP文件:", zipFilename);
        
        if (!frames || frames.length === 0) {
            alert('没有可下载的帧！');
            return;
        }
        
        // 显示加载指示器
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">正在创建ZIP文件...</div>
        `;
        document.body.appendChild(loadingIndicator);
        
        // 创建新的JSZip实例
        const zip = new JSZip();
        
        // 添加每一帧到zip
        const promises = frames.map((frame, index) => {
            return new Promise((resolve) => {
                // 从dataURL中提取base64数据
                const dataURL = frame.image.src;
                const base64Data = dataURL.split(',')[1];
                
                // 添加到zip
                const filename = `${frame.name || `frame_${index + 1}`}.png`;
                zip.file(filename, base64Data, {base64: true});
                resolve();
            });
        });
        
        // 当所有帧都添加完成后，生成zip文件
        Promise.all(promises).then(() => {
            return zip.generateAsync({type: 'blob'});
        }).then(blob => {
            // 下载zip文件
            saveAs(blob, `${zipFilename}.zip`);
            console.log("ZIP文件创建完成");
            
            // 移除加载指示器
            document.body.removeChild(loadingIndicator);
            
            // 显示成功消息
            this.showNotification('ZIP文件创建成功！', 'success');
        }).catch(err => {
            console.error("创建ZIP文件失败:", err);
            
            // 移除加载指示器
            document.body.removeChild(loadingIndicator);
            
            // 显示错误消息
            this.showNotification('创建ZIP文件失败: ' + err.message, 'error');
        });
    }
    
    function getFrameNames() {
        const frames = FrameProcessor.getFrames();
        let namesStr = '';
        
        for (let i = 0; i < frames.length; i++) {
            namesStr += `        "${frames[i].name || `stage_${i + 1}`}"${i < frames.length - 1 ? ',' : ''}`;
            if (i < frames.length - 1) {
                namesStr += '\n';
            }
        }
        
        return namesStr;
    }
    
    // 公共接口
    return {
        // 下载单个帧
        downloadSingleFrame: function(dataURL, frameName) {
            console.log("下载单个帧:", frameName);
            
            try {
                const fileName = `${frameName || 'frame'}.png`;
                const link = document.createElement('a');
                link.href = dataURL;
                link.download = fileName;
                
                // 添加到文档中
                document.body.appendChild(link);
                
                // 模拟点击
                link.click();
                
                // 清理
                setTimeout(() => {
                    document.body.removeChild(link);
                }, 100);
            } catch (error) {
                console.error("下载单个帧失败:", error);
                alert("下载失败: " + error.message);
            }
        },
        
        // 下载所有帧
        downloadAllFrames: function() {
            console.log("下载所有帧");
            const frames = FrameProcessor.getFrames();
            
            if (!frames || frames.length === 0) {
                alert('请先应用设置切分图像！');
                return;
            }
            
            // 获取作物名称
            const cropName = document.getElementById('cropName').value || 'crop';
            
            // 下载每一帧
            frames.forEach((frame, index) => {
                const frameName = frame.name || `${cropName}_${index + 1}`;
                this.downloadSingleFrame(frame.image.src, frameName);
            });
        },
        
        // 打包下载为ZIP
        downloadAsZip: function() {
            console.log("打包下载为ZIP");
            const frames = FrameProcessor.getFrames();
            
            if (!frames || frames.length === 0) {
                alert('请先应用设置切分图像！');
                return;
            }
            
            // 获取图片名称作为默认文件名
            const originalImage = FileHandler.getOriginalImage();
            let defaultName = 'frames';
            
            // 尝试从原始图像URL中提取文件名
            if (originalImage && originalImage.src) {
                try {
                    // 如果是数据URL，使用cropName
                    if (originalImage.src.startsWith('data:')) {
                        defaultName = document.getElementById('cropName').value || 'frames';
                    } else {
                        // 从URL中提取文件名
                        const urlParts = originalImage.src.split('/');
                        let fileName = urlParts[urlParts.length - 1];
                        // 移除扩展名
                        fileName = fileName.split('.')[0];
                        if (fileName) {
                            defaultName = fileName;
                        }
                    }
                } catch (e) {
                    console.error("提取文件名失败:", e);
                }
            }
            
            // 显示ZIP文件名弹窗
            const zipNameModal = document.getElementById('zipNameModal');
            if (zipNameModal) {
                zipNameModal.style.display = 'flex';
                
                // 设置默认文件名
                document.getElementById('zipFilename').value = defaultName;
                
                // 聚焦输入框
                setTimeout(() => {
                    document.getElementById('zipFilename').focus();
                }, 100);
            } else {
                // 如果弹窗不存在，直接使用默认文件名
                this.confirmZipDownload(defaultName);
            }
        },
        
        // 确认ZIP下载
        confirmZipDownload: function(defaultName) {
            const zipFilename = document.getElementById('zipFilename').value || defaultName || 'frames';
            const frames = FrameProcessor.getFrames();
            
            // 隐藏弹窗
            const modal = document.getElementById('zipNameModal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // 创建并下载ZIP
            this.createZipFile(frames, zipFilename);
        },
        
        // 创建ZIP文件 - 移动到公共接口
        createZipFile: function(frames, zipFilename) {
            console.log("创建ZIP文件:", zipFilename);
            
            if (!frames || frames.length === 0) {
                alert('没有可下载的帧！');
                return;
            }
            
            // 显示加载指示器
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">正在创建ZIP文件...</div>
            `;
            document.body.appendChild(loadingIndicator);
            
            // 创建新的JSZip实例
            const zip = new JSZip();
            
            // 添加每一帧到zip
            const promises = frames.map((frame, index) => {
                return new Promise((resolve) => {
                    // 从dataURL中提取base64数据
                    const dataURL = frame.image.src;
                    const base64Data = dataURL.split(',')[1];
                    
                    // 添加到zip
                    const filename = `${frame.name || `frame_${index + 1}`}.png`;
                    zip.file(filename, base64Data, {base64: true});
                    resolve();
                });
            });
            
            // 当所有帧都添加完成后，生成zip文件
            Promise.all(promises).then(() => {
                return zip.generateAsync({type: 'blob'});
            }).then(blob => {
                // 下载zip文件
                saveAs(blob, `${zipFilename}.zip`);
                console.log("ZIP文件创建完成");
                
                // 移除加载指示器
                document.body.removeChild(loadingIndicator);
                
                // 显示成功消息
                this.showNotification('ZIP文件创建成功！', 'success');
            }).catch(err => {
                console.error("创建ZIP文件失败:", err);
                
                // 移除加载指示器
                document.body.removeChild(loadingIndicator);
                
                // 显示错误消息
                this.showNotification('创建ZIP文件失败: ' + err.message, 'error');
            });
        },
        
        // 生成Python代码
        generatePythonCode: function() {
            console.log("生成Python代码");
            const frames = FrameProcessor.getFrames();
            
            if (!frames || frames.length === 0) {
                alert('请先应用设置切分图像！');
                return;
            }
            
            const cropName = document.getElementById('cropName').value || 'crop';
            const cropType = document.getElementById('cropType').value || 'crops';
            const chineseName = document.getElementById('chineseName').value || cropName;
            
            // 获取帧信息
            const frameWidth = frames[0].width;
            const frameHeight = frames[0].height;
            const totalFrames = frames.length;
            
            // 计算行列数
            const frameColumns = parseInt(document.getElementById('frameColumns').value) || 1;
            const frameRows = Math.ceil(totalFrames / frameColumns);
            
            // 生成Python代码
            const codeContent = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
from PIL import Image

def process_image(image_path):
    # 检查文件是否存在
    if not os.path.exists(image_path):
        print(f"找不到图像: {image_path}")
        return
    
    # 加载图像
    original_image = Image.open(image_path)
    print(f"已加载图像: {image_path} ({original_image.width}x{original_image.height})")
    
    # 创建输出目录
    output_dir = os.path.join("output", "${cropName}")
    os.makedirs(output_dir, exist_ok=True)
    
    # 设置参数
    chinese_name = "${chineseName}"
    crop_type = "${cropType}"
    frame_width = ${frameWidth}
    frame_height = ${frameHeight}
    total_frames = ${totalFrames}
    rows = ${frameRows}
    columns = ${frameColumns}
    
    # 帧文件名列表
    stage_files = [
${getFrameNames()}
    ]
    
    # 切分图像
    frame_index = 0
    
    # 处理每一帧
    for frame_data in [
${frames.map((frame, i) => `        {"x": ${frame.x}, "y": ${frame.y}, "width": ${frame.width}, "height": ${frame.height}, "name": "${frame.name || `frame_${i + 1}`}.png"}`).join(',\n')}
    ]:
        # 提取帧
        x = frame_data["x"]
        y = frame_data["y"]
        width = frame_data["width"]
        height = frame_data["height"]
        frame_name = frame_data["name"]
        
        # 裁剪帧
        frame = original_image.crop((x, y, x + width, y + height))
        
        # 保存帧
        output_path = os.path.join(output_dir, frame_name)
        frame.save(output_path)
        print(f"已保存: {output_path}")
        
        frame_index += 1
    
    # 创建元数据
    metadata = {
        "name": chinese_name,
        "type": crop_type,
        "rows": rows,
        "columns": columns,
        "total_frames": total_frames,
        "frame_width": frame_width,
        "frame_height": frame_height,
        "stage_files": stage_files
    }
    
    # 保存元数据
    with open(os.path.join(output_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"已保存元数据到: {os.path.join(output_dir, 'metadata.json')}")
    print("处理完成!")

# 主函数
def main():
    # 图像路径
    image_path = "${cropType}/${cropName}.png"
    
    if os.path.exists(image_path):
        process_image(image_path)
    else:
        print(f"找不到图像: {image_path}")
        # 尝试其他可能的路径
        alt_paths = [
            f"{cropName}.png",
            f"{cropType}/{cropName.replace(' ', '_')}.png",
            f"{cropType}/{cropName.replace(' - ', '_')}.png"
        ]
        
        for path in alt_paths:
            if os.path.exists(path):
                print(f"使用替代路径: {path}")
                process_image(path)
                break
        else:
            print("无法找到图像文件，请确保文件存在并路径正确。")

if __name__ == "__main__":
    main()
`;
            
            // 显示生成的代码
            const codeElement = document.getElementById('exportCode');
            if (codeElement) {
                codeElement.textContent = codeContent;
                codeElement.style.display = 'block';
            }
        },
        
        // 添加通知方法
        showNotification: function(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // 淡入效果
            setTimeout(() => {
                notification.style.opacity = '1';
            }, 10);
            
            // 3秒后淡出
            setTimeout(() => {
                notification.style.opacity = '0';
                
                // 淡出后移除元素
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
        }
    };
})(); 