// 自动检测模块 - 分析图像并识别独立图形块
const AutoDetector = (function() {
    // 私有变量
    let originalImage = null;
    let detectedRegions = [];
    let canvas = null;
    let ctx = null;
    
    // 私有方法
    function createCanvas(width, height) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        return tempCanvas;
    }
    
    function getImageData() {
        if (!originalImage) return null;
        
        canvas = createCanvas(originalImage.width, originalImage.height);
        ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    function isTransparent(imageData, x, y) {
        if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
            return true;
        }
        
        const index = (y * imageData.width + x) * 4;
        return imageData.data[index + 3] < 10; // 透明度阈值
    }
    
    function floodFill(imageData, startX, startY, visited) {
        const width = imageData.width;
        const height = imageData.height;
        
        // 使用队列进行广度优先搜索
        const queue = [{x: startX, y: startY}];
        const region = [];
        
        // 标记起始点为已访问
        const key = `${startX},${startY}`;
        visited.add(key);
        region.push({x: startX, y: startY});
        
        // 四个方向：上、右、下、左
        const directions = [
            {dx: 0, dy: -1},
            {dx: 1, dy: 0},
            {dx: 0, dy: 1},
            {dx: -1, dy: 0}
        ];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // 检查四个方向
            for (const dir of directions) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                
                // 检查边界和是否已访问
                if (newX < 0 || newY < 0 || newX >= width || newY >= height) {
                    continue;
                }
                
                const newKey = `${newX},${newY}`;
                if (visited.has(newKey)) {
                    continue;
                }
                
                // 如果不是透明像素，则加入区域
                if (!isTransparent(imageData, newX, newY)) {
                    visited.add(newKey);
                    queue.push({x: newX, y: newY});
                    region.push({x: newX, y: newY});
                }
            }
        }
        
        return region;
    }
    
    function detectRegions(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const regions = [];
        const visited = new Set();
        
        // 遍历所有像素
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const key = `${x},${y}`;
                
                // 如果像素未访问且不透明
                if (!visited.has(key) && !isTransparent(imageData, x, y)) {
                    // 执行填充算法找到连通区域
                    const region = floodFill(imageData, x, y, visited);
                    
                    if (region.length > 10) { // 忽略太小的区域
                        // 计算区域的边界框
                        let minX = width, minY = height, maxX = 0, maxY = 0;
                        
                        for (const point of region) {
                            minX = Math.min(minX, point.x);
                            minY = Math.min(minY, point.y);
                            maxX = Math.max(maxX, point.x);
                            maxY = Math.max(maxY, point.y);
                        }
                        
                        // 添加边界框到区域列表
                        regions.push({
                            x: minX,
                            y: minY,
                            width: maxX - minX + 1,
                            height: maxY - minY + 1
                        });
                    }
                }
            }
        }
        
        return regions;
    }
    
    function optimizeRegions(regions) {
        // 合并重叠或非常接近的区域
        const optimized = [...regions];
        let merged = true;
        
        while (merged) {
            merged = false;
            
            for (let i = 0; i < optimized.length; i++) {
                for (let j = i + 1; j < optimized.length; j++) {
                    const r1 = optimized[i];
                    const r2 = optimized[j];
                    
                    // 检查两个区域是否重叠或非常接近
                    const isOverlapping = !(
                        r1.x > r2.x + r2.width + 5 ||
                        r1.x + r1.width + 5 < r2.x ||
                        r1.y > r2.y + r2.height + 5 ||
                        r1.y + r1.height + 5 < r2.y
                    );
                    
                    if (isOverlapping) {
                        // 合并两个区域
                        const minX = Math.min(r1.x, r2.x);
                        const minY = Math.min(r1.y, r2.y);
                        const maxX = Math.max(r1.x + r1.width, r2.x + r2.width);
                        const maxY = Math.max(r1.y + r1.height, r2.y + r2.height);
                        
                        optimized[i] = {
                            x: minX,
                            y: minY,
                            width: maxX - minX,
                            height: maxY - minY
                        };
                        
                        // 移除已合并的区域
                        optimized.splice(j, 1);
                        merged = true;
                        break;
                    }
                }
                
                if (merged) break;
            }
        }
        
        return optimized;
    }
    
    // 公共接口
    return {
        setOriginalImage: function(image) {
            originalImage = image;
        },
        
        detectRegions: function() {
            if (!originalImage) return [];
            
            const imageData = getImageData();
            if (!imageData) return [];
            
            const regions = detectRegions(imageData);
            detectedRegions = optimizeRegions(regions);
            
            return detectedRegions;
        },
        
        getDetectedRegions: function() {
            return JSON.parse(JSON.stringify(detectedRegions)); // 返回深拷贝
        }
    };
})(); 