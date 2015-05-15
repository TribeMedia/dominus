// temp files written to /opt/#/programs/server/hexes/ on server

Cue.addJob('bakeHexes', {retryOnError:true, maxMs:1000*60*5}, function(task, done) {
    Mapbaker.bakeHexes();
    done();
});
console.log(process.env.PWD);
console.log(process.cwd());

Mapbaker = {
    // this is how many hexes per image
    numHexes: 11,

    // s3 : Knox.createClient({
    //     key: Meteor.settings.s3key,
    //     secret: Meteor.settings.s3secretKey,
    //     bucket: Meteor.settings.s3bucket,
    //     region: Meteor.settings.s3region
    // }),

    fs: Npm.require('fs'),
    meteorPath: 'hexes/',
    //s3prefix: 'hexes/',
    hexWidth: s.hex_size,
    hexHeight: s.hex_size * (Math.sqrt(3) * s.hex_squish),

    // offset entire svg, transform group
    // to fit into image
    offsetX: s.hex_size,
    offsetY: s.hex_size * (Math.sqrt(3) * s.hex_squish) * 2,
};

if (Meteor.isServer && process.env.NODE_ENV == 'development') {
    Mapbaker.meteorPublicPath = process.cwd() + '/../../../../../public/hexBakes/';
} else {
    Mapbaker.meteorPublicPath = process.cwd() + '/../web.browser/app/hexBakes/';
}

// offset pos of image on screen
Mapbaker.offsetPosX = Mapbaker.offsetX * -1;
Mapbaker.offsetPosY = Mapbaker.offsetY * -1;

// size of image
Mapbaker.svgWidth = Math.ceil(s.hex_size + (s.hex_size * 3/2 * (Mapbaker.numHexes-1)) + (s.hex_size/2));
Mapbaker.svgWidth += 2; // get rid of space between images
Mapbaker.svgHeight = Math.ceil(Mapbaker.hexHeight * Mapbaker.numHexes * 1.5 + Mapbaker.hexHeight);
Mapbaker.svgHeight += 2; // get rid of space between images



Mapbaker.bakeHexes = function() {
    var self = this;

    console.log('--- baking hexes ---');

    self.resetImageCounter();

    // find hex min/max
    var minX = Hexes.findOne({}, {sort:{x:1}, limit:1, fields:{x:1}}).x;
    var minY = Hexes.findOne({}, {sort:{y:1}, limit:1, fields:{y:1}}).y;
    var maxX = Hexes.findOne({}, {sort:{x:-1}, limit:1, fields:{x:1}}).x;
    var maxY = Hexes.findOne({}, {sort:{y:-1}, limit:1, fields:{y:1}}).y;

    self.deleteLocalFiles();
    self.deleteLocalHexFiles();
    Hexbakes.remove({});

    // if (!self.deleteS3Files()) {
    //     console.error('could not delete map images from s3');
    //     return false;
    // }

    for (var x = minX; x <= maxX; x += self.numHexes) {
        for (var y = minY; y <= maxY; y += self.numHexes) {

            Mapbaker.imageStarted();

            var gteX = x-1;
            var ltX = x+self.numHexes+1;
            var gteY = y - (self.numHexes / 3) * 2;
            var ltY = y+self.numHexes*2;

            var hexes = Hexes.find({x: {$gte:gteX, $lt:ltX}, y: {$gte:gteY, $lt:ltY}});

            var svg = '<svg width="'+self.svgWidth+'" height="'+self.svgHeight+'" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">';

            // background
            svg += '<rect width="'+self.svgWidth+'" height="'+self.svgHeight+'" fill="#444" />';
            svg += '<g transform="translate('+self.offsetX+','+self.offsetY+')">';

            var filename = x+'_'+y;
            var filenameWithCoords = filename+'_withcoords';

            // find max to save to Hexbakes
            var imageMaxX = x;
            var imageMaxY = y;

            var svgWithCoords = svg;

            hexes.forEach(function(hex) {
                if (hex.x > imageMaxX) {
                    imageMaxX = hex.x;
                }
                if (hex.y > imageMaxY) {
                    imageMaxY = hex.y;
                }
                svg += self.createSvg(hex, x, y, false);
                svgWithCoords += self.createSvg(hex, x, y, true);
            });

            svg += '</g>';
            svg += '</svg>';
            svgWithCoords += '</g>';
            svgWithCoords += '</svg>';

            var pos = Hx.coordinatesToPos(x, y, s.hex_size, s.hex_squish);
            var imageObject = {
                minX: x,
                minY: y,
                maxX: imageMaxX,
                maxY: imageMaxY,
                centerX: Math.round((imageMaxX - x) / 2) + x,
                centerY: Math.round((imageMaxY - y) / 2) + y,
                filename: filename,
                posX: Math.round(pos.x + self.offsetPosX),
                posY: Math.round(pos.y + self.offsetPosY),
                width: self.svgWidth,
                height: self.svgHeight,
                created_at: new Date(),
                hasCoords: false
            };

            var imageObjectWithCoords = EJSON.clone(imageObject);
            imageObjectWithCoords.filename = filenameWithCoords;
            imageObjectWithCoords.hasCoords = true;

            Cue.addTask('createSvgImage', {isAsync:true, unique:true}, {
                filename: filename,
                svgString: svg,
                imageObject: imageObject
            });

            Cue.addTask('createSvgImage', {isAsync:true, unique:true}, {
                filename: filenameWithCoords,
                svgString: svgWithCoords,
                imageObject: imageObject
            });
        }
    }
};





// Cue.addJob('uploadToS3', {retryOnError:true, maxMs:1000*60*5}, function(task, done) {
//     var result = Mapbaker.uploadToS3(task.data.filename, task.data.imageObject);
//
//     if (result) {
//         Mapbaker.imageFinished();
//         done();
//     } else {
//         done(result);
//     }
// });
//
// Mapbaker.uploadToS3 = function(filename, imageObject) {
//     var self = this;
//     var fut = new Future();
//
//     self.fs.stat(self.meteorPath+filename+'.jpg', Meteor.bindEnvironment(function(error, stat) {
//         if (error) {
//             console.error(error);
//             fut['return'](error);
//
//         } else {
//
//             if (!stat.isFile()) {
//                 console.error('stat is not a file');
//                 fut['return']('stat is not a file');
//
//             } else {
//
//                 self.s3.putFile(self.meteorPath+filename+'.jpg', 'hexes/'+filename+'.jpg', {
//                     'Content-Length': stat.size,
//                     'Content-Type': 'image/jpg'
//                 }, Meteor.bindEnvironment(function(error, res) {
//                     if (error) {
//                         console.error(error);
//                         fut['return'](error);
//
//                     } else {
//
//                         var imagepath = Meteor.settings.public.s3path+'/hexes/'+filename+'.jpg';
//                         if (res.statusCode == 200 && self.imageExists(imagepath)) {
//                             Hexbakes.insert(imageObject);
//                             fut['return'](true);
//                         } else {
//                             var err = 'Check of '+imagepath+' failed, retrying. Status code: '+res.statusCode;
//                             console.error(err);
//                             fut['return'](err);
//                         }
//                     }
//                 }));
//
//             }
//         }
//     }));
//
//     return fut.wait();
// };



// Mapbaker.imageExists = function(image_url){
//     check(image_url, String);
//
//     try {
//         var result = HTTP.get(image_url);
//         return true;
//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// };




Cue.addJob('createSvgImage', {retryOnError:true, maxMs:1000*60*5, maxAtOnce:3}, function(task, done) {
    var result = Mapbaker.createSvgImage(Mapbaker.meteorPath+task.data.filename+'.svg', task.data.svgString);

    // if server copy to temp dir then scp to server
    var outFile;
    if (Meteor.isServer && process.env.NODE_ENV == 'development') {
        outFile = Mapbaker.meteorPublicPath+task.data.filename+'.jpg';
    } else {
        outFile = Mapbaker.meteorPath+task.data.filename+'.jpg';
    }

    if (result) {
        Cue.addTask('createJpgImage', {isAsync:true, unique:true}, {
            inFile: Mapbaker.meteorPath+task.data.filename+'.svg',
            outFile: outFile,
            outFileType: 'jpg',
            quality: '80%',
            filename: task.data.filename,
            imageObject: task.data.imageObject
            });

        done();
    } else {
        done(result);
    }
});


Mapbaker.createSvgImage = function(filepath, svgString) {
    var self = this;
    var fut = new Future();

    self.fs.writeFile(filepath, svgString, Meteor.bindEnvironment(function(error) {
        if (error) {
            console.error(error);
            fut['return'](error);
        } else {
            if (self.fs.existsSync(self.filepath)) {
                fut['return'](true);
            } else {
                fut['return']('Svg image does not exist after creating.');
            }
        }
    }));

    return fut.wait();
};



Cue.addJob('scpImageToServer', {retryOnError:true, maxMs:1000*60*5, maxAtOnce:3}, function(task, done) {
    scpImageToServer(task.data.filename);
    done();
});

Mapbaker.scpImageToServer = function(filename) {
    var branchId = process.env.BRANCH_ID;

    var exec = Npm.require('child_process').exec;

    var cmd = '/bin/bash /scpToServer.sh '+branchId+' '+filename;

    var child = exec(cmd, function(error, stdout, stderr) {
        console.log('stdout: '+stdout);
        console.log('stderr: '+stderr);

        if (error !== null) {
            console.log('exec error: '+error);
        }

    });
};



Cue.addJob('createJpgImage', {retryOnError:true, maxMs:1000*60*5, maxAtOnce:3}, function(task, done) {
    var result = Mapbaker.createJpgImage(task.data.inFile, task.data.outFile, task.data.outFileType, task.data.quality);

    if (result) {
        // Cue.addTask('uploadToS3', {isAsync:true, unique:true}, {
        //     filename: task.data.filename,
        //     imageObject: task.data.imageObject
        // });

        if (Meteor.isServer && process.env.NODE_ENV != 'development') {
            // scp to server
        }

        Cue.addTask('scpImageToServer', {isAsync:true, unique:true}, {filename: task.data.filename+'.jpg'});

        Hexbakes.insert(task.data.imageObject);
        Mapbaker.imageFinished();

        done();
    } else {
        done(result);
    }
});

Mapbaker.createJpgImage = function(inFile, outFile, outFileType, quality) {
    var self = this;
    var fut = new Future();
    Svgexport.render([{
        'input': inFile,
        'output': outFile+' '+outFileType+' '+quality
    }], Meteor.bindEnvironment(function(error, result) {
        if (error) {
            console.error(error);
            fut['return'](error);
        } else {
            if (self.fs.existsSync(outFile)) {
                fut['return'](true);
            } else {
                fut['return']('Jpg image does not exist after creating.');
            }
        }
    }));
    return fut.wait();
};





Mapbaker.createSvg = function(hex, x, y, withCoords) {
    var self = this;

    var svg = '';

    var pos = Hx.coordinatesToPos(hex.x-x, hex.y-y, s.hex_size, s.hex_squish);
    var points = Hx.getHexPolygonVerts(pos.x, pos.y, s.hex_size, s.hex_squish, false);

    // image
    var imageName = '';
    if (hex.large) {
        imageName = 'hex_'+hex.type+'_large_'+hex.tileImage+'.png';
    } else {
        imageName = 'hex_'+hex.type+'_'+hex.tileImage+'.png';
    }
    imageName = Meteor.absoluteUrl()+'game_images/'+imageName;
    var imageX = pos.x - 63;
    var imageY = pos.y - 41;
    svg += '<image x="'+imageX+'" y="'+imageY+'" width="126" height="83" xlink:href="'+imageName+'" />';

    // outline
    svg += '<polygon stroke="#628c6e" stroke-opacity="1" stroke-width="1" fill-opacity="0" points="'+points+'"></polygon>';

    if (withCoords) {
        var textX = pos.x - 9;
        var textY = pos.y + 34;
        svg += '<text x="'+textX+'" y="'+textY+'" fill="#000" fill-opacity="0.75" style="font-size:9px;">'+hex.x+','+hex.y+'</text>';
    }

    return svg;
};






Mapbaker.deleteLocalFiles = function() {
    var self = this;

    if (self.fs.existsSync(self.meteorPath)) {
        // delete all files in temp directory
        self.fs.readdirSync(self.meteorPath).forEach(function(file, index) {
            var curPath = self.meteorPath + '/' + file;
            self.fs.unlinkSync(curPath);
        });
    } else {
        // create directory
        self.fs.mkdirSync(self.meteorPath);
    }
};



Mapbaker.deleteLocalHexFiles = function() {
    var self = this;

    if (self.fs.existsSync(self.meteorPublicPath)) {
        // delete all files in public/hexes directory
        self.fs.readdirSync(self.meteorPublicPath).forEach(function(file, index) {
            var curPath = self.meteorPublicPath + '/' + file;
            self.fs.unlinkSync(curPath);
        });
    } else {
        // create directory
        self.fs.mkdirSync(self.meteorPublicPath);
    }
};




// Mapbaker.deleteS3Files = function() {
//     var self = this;
//
//     // don't return until done
//     var fut = new Future();
//
//     // delete all files on s3
//     self.s3.list({ prefix: self.s3prefix }, function(error, data) {
//         if (error) {
//             console.error(error);
//             fut['return'](false);
//
//         } else {
//             var list = [];
//
//             for (var i=0; i<data.Contents.length; i++) {
//                 var name = data.Contents[i].Key;
//                 if (name != self.s3prefix) {
//                     list.push(name);
//                 }
//             }
//
//             self.s3.deleteMultiple(list, function(error, result) {
//                 if (error) {
//                     console.error(error);
//                     fut['return'](false);
//                 } else {
//                     fut['return'](true);
//                 }
//             });
//         }
//     });
//
//     return fut.wait();
// };




Mapbaker.resetImageCounter = function() {
    Settings.upsert({name: 'mapBakeImagesStarted'}, {$set: {value:0}});
    Settings.upsert({name: 'mapBakeImagesFinished'}, {$set: {value:0}});
};


Mapbaker.imageStarted = function() {
    Settings.upsert({
        name: 'mapBakeImagesStarted'
    }, {
        $inc: {value:2} // one for svg one for svgWithCoords
    });
};


Mapbaker.imageFinished = function() {
    Settings.upsert({
        name: 'mapBakeImagesFinished'
    }, {
        $inc: {value:1}
    });
};
