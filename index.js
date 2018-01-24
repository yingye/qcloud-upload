var fs = require('fs');
var path = require('path');
var COS = require('cos-nodejs-sdk-v5');
var Q = require('q');
var ndir = require('ndir');
var assign = require('object-assign');
var chalk = require('chalk');
var log = console.log;

module.exports = function (config = {}) {
  config = assign({
    AppId: '',
    SecretId: '',
    SecretKey: '',
    Bucket: '',
    Region: '',
    Prefix: '',
    OverWrite: false,
    Dir: ''
  }, config);

  var existFiles = 0;
  var uploadedFiles = 0;
  var uploadedFail = 0;
  var tasks = [];
  var dirPath = path.resolve(__dirname, config.Dir);
  var dirName = config.Dir.substring(config.Dir.match(/((\.)+\/+)*/g)[0].length)

  var cos = new COS({
    AppId: config.AppId,
    SecretId: config.SecretId,
    SecretKey: config.SecretKey
  });

  // get files
  ndir.walk(dirPath, function onDir(dirpath, files) {
    for (var i = 0, l = files.length; i < l; i++) {
      var info = files[i];
      if (info[1].isFile()) {
        upload(info[1], info[0].substring(info[0].indexOf(dirName)), info[0])
      }
    }
  }, function end() {
    if (tasks.length !== 0) {
      Q.allSettled(tasks)
        .then(function (fulfilled) {
          log('Upload to qcloud: Total:', chalk.green(fulfilled.length),
            'Skip:', chalk.gray(existFiles),
            'Upload:', chalk.green(uploadedFiles),
            'Failed:', chalk.red(uploadedFail));
        }, function (err) {
          log('Failed upload files:', err);
        });
    }
  }, function error(err, errPath) {
    log(chalk.red('Please you check your Dir option, and use absolute path.'))
    log('err: ', errPath, ' error: ', err)
  });

  // upload files
  function upload(file, fileRelativePath, filePath) {
    var fileKey = path.join(config.Prefix, fileRelativePath);
    var handler = function () {
      var defer = Q.defer();
      upload();

      function check (callback) {
        cos.headObject({
          Bucket: config.Bucket,
          Region: config.Region,
          Key: fileKey
        }, function (err, data) {
          if (err) {
            callback(false);
          } else {
            log('Exist ' + fileKey);
            callback(200 == data.statusCode);
          }
        });
      }

      function putFile () {
        cos.putObject({
          Bucket: config.Bucket,
          Region: config.Region,
          Key: fileKey,
          ContentLength: fs.statSync(filePath).size,
          Body: fs.createReadStream(filePath),
          onProgress (progressData) {
            // log(progressData)
          },
        }, function (err, data) {
          if (err) {
            uploadedFail++;
            log('err-putObject', err);
            defer.reject();
          } else {
            uploadedFiles++;
            log(chalk.green('Upload ' + fileKey + ' Success'));
            defer.resolve();
          }
        });
      }

      function upload () {
        if (!config.OverWrite) {
          check(function (status) {
            if (status) {
              existFiles++;
              defer.resolve();
            } else {
              putFile();
            }
          });
        } else {
          putFile();
        }
      }
      return defer.promise;
    };

    tasks.push(handler());
  }
}