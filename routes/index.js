var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Expressjs
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var uploadDir = path.join(__dirname,'../upload/');
console.log(__dirname);
// 合并文件
function mergeFiles(fileName, fileParts) {
    var buffers = [];
    // 获取各个部分的路径
    var filePartsPaths = fileParts.map(function(name) {
        return path.join(uploadDir, name);
    });
    // 获取各个 part 的 buffer，并保存到 buffers 中
    filePartsPaths.forEach(function(path) {
        var buffer = fs.readFileSync(path);
        buffers.push(buffer);
    });
    // 合并文件
    var concatBuffer = Buffer.concat(buffers);
    var concatFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(concatFilePath, concatBuffer);
    // 删除各个 part 的文件
    filePartsPaths.forEach(function(path) {
        fs.unlinkSync(path);
    });
}
function upload (req, res) {
    if (req.method === 'POST') {
        var data = req.body;
        var _blobPath = req.files._blob.path;
        var fileName = data.filename;
        var filePath;
        var total = parseInt(data.total);
        // 处理文件路径
        if (total === 1) {
            filePath = path.join(uploadDir, fileName);
        } else {
            var fileNameWithPart = fileName + '.part' + data.index;
            filePath = path.join(uploadDir, fileNameWithPart);
        }
        // 读取上传的数据，保存到指定路径
        var tmpBuffer = fs.readFileSync(_blobPath);
        fs.writeFileSync(filePath, tmpBuffer);
        // 判断是否上传完成
        if (total === 1) {
            res.send(200);
        } else {
            // 获取指定目录下的所有文件名
            var filesInDir = fs.readdirSync(uploadDir);
            // 找出指定文件名中带有 .part 的文件
            var fileParts = filesInDir.filter(function(name) {
                return name.substring(0, fileName.length + 5) === (fileName + '.part');
            });
            // 判断是否需要合并文件
            if (fileParts.length === total) {
                mergeFiles(fileName, fileParts);
                res.send(200);
            } else {
                res.send(204);
            }
        }
    } else {
        res.send(405);
    }
}
router.post('/upload', multipartMiddleware,upload);
module.exports = router;
