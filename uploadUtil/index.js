var path = require('path');
module.exports.mergeFiles = function (fileName, fileParts, uploadDir) {
    var buffers = [];
    // 获取各个部分的路径
    var filePartsPaths = fileParts.map(function (name) {
        return path.join(uploadDir, name);
    });
    // 获取各个 part 的 buffer，并保存到 buffers 中
    filePartsPaths.forEach(function (path) {
        var buffer = fs.readFileSync(path);
        buffers.push(buffer);
    });
    // 合并文件
    var concatBuffer = Buffer.concat(buffers);
    var concatFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(concatFilePath, concatBuffer);
    // 删除各个 part 的文件
    filePartsPaths.forEach(function (path) {
        fs.unlinkSync(path);
    });
};