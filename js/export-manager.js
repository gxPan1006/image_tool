// 导出管理器模块
const ExportManager = (function() {
    // 私有方法
    function getFrameNames() {
        const frameInputs = document.querySelectorAll('.frame-name-input');
        let namesStr = '';
        
        for (let i = 0; i < frameInputs.length; i++) {
            namesStr += `        "${frameInputs[i].value || `stage_${i + 1}`}"${i < frameInputs.length - 1 ? ',' : ''}`;
            if (i < frameInputs.length - 1) {
                namesStr += '\n';
            }
        }
        
        return namesStr;
    }
    
    // 公共接口
    return {
        exportFrames: function() {
            const frames = FrameProcessor.getFrames();
            if (frames.length === 0) {
                alert('请先应用设置切分图像！');
                return;
            }
            
            const cropName = document.getElementById('cropName').value || 'crop';
            const cropType = document.getElementById('cropType').value || 'crops';
            
            // 创建一个zip文件
            alert('导出功能需要在服务器环境下运行。请使用生成的Python代码进行导出。');
            
            // 生成代码
            this.generateCode();
        },
        
        downloadFrame: function(index, frameName) {
            const frames = FrameProcessor.getFrames();
            if (index >= frames.length) {
                alert('帧索引无效！');
                return;
            }
            
            const fileName = `${frameName || `frame_${index + 1}`}.png`;
            const link = document.createElement('a');
            link.href = frames[index];
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        
        downloadAllFrames: function() {
            const frames = FrameProcessor.getFrames();
            if (frames.length === 0) {
                alert('请先应用设置切分图像！');
                return;
            }
            
            const frameInputs = document.querySelectorAll('.frame-name-input');
            
            for (let i = 0; i < frames.length; i++) {
                const frameName = frameInputs[i].value || `frame_${i + 1}`;
                setTimeout(() => {
                    ExportManager.downloadFrame(i, frameName);
                }, i * 100); // 添加延迟，避免浏览器阻止多个下载
            }
        },
        
        downloadAsZip: function() {
            const frames = FrameProcessor.getFrames();
            if (frames.length === 0) {
                alert('请先应用设置切分图像！');
                return;
            }
            
            // 显示ZIP文件名弹窗
            document.getElementById('zipNameModal').style.display = 'flex';
            
            // 聚焦到输入框
            setTimeout(() => {
                document.getElementById('zipFilename').focus();
            }, 100);
        },
        
        confirmZipDownload: function() {
            const frames = FrameProcessor.getFrames();
            
            // 获取自定义文件名
            let zipFilename = document.getElementById('zipFilename').value.trim();
            
            // 如果文件名为空，使用默认名称
            if (!zipFilename) {
                zipFilename = 'frames';
            }
            
            // 移除不合法的文件名字符
            zipFilename = zipFilename.replace(/[\\/:*?"<>|]/g, '_');
            
            // 确保文件名不以.zip结尾
            if (zipFilename.toLowerCase().endsWith('.zip')) {
                zipFilename = zipFilename.substring(0, zipFilename.length - 4);
            }
            
            // 创建一个新的JSZip实例
            const zip = new JSZip();
            
            // 获取所有帧名称输入框
            const frameInputs = document.querySelectorAll('.frame-name-input');
            
            // 添加每一帧到zip
            frames.forEach((frameDataURL, index) => {
                // 获取帧名称，如果没有设置则使用默认名称
                const frameName = frameInputs[index].value || `stage_${index + 1}`;
                
                // 从dataURL中提取base64数据
                const base64Data = frameDataURL.split(',')[1];
                
                // 添加到zip
                zip.file(`${frameName}.png`, base64Data, {base64: true});
            });
            
            // 生成zip文件并下载
            zip.generateAsync({type: 'blob'}).then(function(content) {
                // 使用FileSaver.js下载文件
                saveAs(content, `${zipFilename}.zip`);
                
                // 隐藏弹窗
                document.getElementById('zipNameModal').style.display = 'none';
            });
        },
        
        generateCode: function() {
            const originalImage = FileHandler.getOriginalImage();
            if (!originalImage) {
                alert('请先上传图像！');
                return;
            }
            
            const frameWidth = parseInt(document.getElementById('frameWidth').value) || 16;
            const frameHeight = parseInt(document.getElementById('frameHeight').value) || 16;
            const offsetX = parseInt(document.getElementById('offsetX').value) || 0;
            const offsetY = parseInt(document.getElementById('offsetY').value) || 0;
            const spacingX = parseInt(document.getElementById('spacingX').value) || 0;
            const spacingY = parseInt(document.getElementById('spacingY').value) || 0;
            const columns = parseInt(document.getElementById('frameColumns').value) || 1;
            const rows = parseInt(document.getElementById('frameRows').value) || 1;
            const cropName = document.getElementById('cropName').value || 'crop';
            const cropType = document.getElementById('cropType').value || 'crops';
            const chineseName = document.getElementById('chineseName').value || '作物';
            
            // 根据选择模式生成不同的代码
            let codeContent;
            
            if (SelectionHandler.getSelectionMode() === 'manual') {
                // 手动选区模式的代码
                const selections = SelectionHandler.getManualSelections();
                let selectionsStr = '';
                
                selections.forEach((selection, index) => {
                    selectionsStr += `    (${selection.x}, ${selection.y}, ${selection.width}, ${selection.height})${index < selections.length - 1 ? ',' : ''}`;
                    if (index < selections.length - 1) {
                        selectionsStr += '\n';
                    }
                });
                
                codeContent = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from PIL import Image
import json

# 确保目录存在
def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

# 处理图像
def process_image(image_path):
    # 参数设置
    crop_name = "${cropName}"
    crop_type = "${cropType}"
    chinese_name = "${chineseName}"
    
    # 自定义帧名称 (从工具中获取)
    frame_names = [
${getFrameNames()}
    ]
    
    # 手动选区 (x, y, width, height)
    selections = [
${selectionsStr}
    ]
    
    # 打开图像
    img = Image.open(image_path)
    
    # 创建输出目录
    output_dir = os.path.join("processed", crop_type, crop_name)
    ensure_dir(output_dir)
    
    # 切分帧
    stage_files = []
    
    for i, (x, y, width, height) in enumerate(selections):
        # 裁剪图像
        frame = img.crop((x, y, x + width, y + height))
        
        # 获取帧名称
        frame_name = f"{frame_names[i] if i < len(frame_names) else f'stage_{i+1}'}.png"
        stage_files.append(frame_name)
        
        # 保存帧
        output_path = os.path.join(output_dir, frame_name)
        frame.save(output_path)
        print(f"已保存: {output_path}")
    
    # 创建元数据
    metadata = {
        "name": chinese_name,
        "type": crop_type,
        "total_frames": len(selections),
        "selections": selections,
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
            } else {
                // 自动网格模式的代码 (原有代码)
                codeContent = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from PIL import Image
import json

# 确保目录存在
def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

# 处理图像
def process_image(image_path):
    # 参数设置
    frame_width = ${frameWidth}
    frame_height = ${frameHeight}
    offset_x = ${offsetX}
    offset_y = ${offsetY}
    spacing_x = ${spacingX}
    spacing_y = ${spacingY}
    crop_name = "${cropName}"
    crop_type = "${cropType}"
    chinese_name = "${chineseName}"
    
    # 自定义帧名称 (从工具中获取)
    frame_names = [
${getFrameNames()}
    ]
    
    # 打开图像
    img = Image.open(image_path)
    
    # 计算帧数
    available_width = img.width - offset_x
    available_height = img.height - offset_y
    columns = ${parseInt(document.getElementById('frameColumns').value) || 1}
    rows = ${parseInt(document.getElementById('frameRows').value) || 1}
    total_frames = columns * rows
    
    print(f"图像尺寸: {img.width}x{img.height}, 行数: {rows}, 列数: {columns}, 总帧数: {total_frames}")
    
    # 创建输出目录
    output_dir = os.path.join("processed", crop_type, crop_name)
    ensure_dir(output_dir)
    
    # 切分帧
    stage_files = []
    frame_index = 0
    
    for row in range(rows):
        for col in range(columns):
            # 计算切分位置
            left = offset_x + col * (frame_width + spacing_x)
            top = offset_y + row * (frame_height + spacing_y)
            right = left + frame_width
            bottom = top + frame_height
            
            # 裁剪图像
            frame = img.crop((left, top, right, bottom))
            
            # 获取帧名称
            frame_name = f"{frame_names[frame_index] if frame_index < len(frame_names) else f'stage_{frame_index+1}'}.png"
            stage_files.append(frame_name)
            
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
            }
            
            document.getElementById('exportCode').textContent = codeContent;
        }
    };
})(); 