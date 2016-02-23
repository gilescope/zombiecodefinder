console.log('Zombie Code Finder - first argument should point to the svn log file');
console.log('(To create file: svn log --with-all-revprops -v --xml http://.../trunk > my.xml)');

var args = process.argv.slice(2);

var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();

var filename = args[0];

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

fs.readFile(filename, function(err, data) {
    parser.parseString(data, function (err, result) {
        if (err) {
            console.log('==error==');
            console.log(err);
            console.log('==enderror==');
        }

        const one_day_in_milliseconds = 1000*60*60*24;
        var model = { name:"svn", children:[], deadchildren:[]};
        var today_ms = new Date().getTime();

        var copyStack = [];

        //For each log entry...
        for (var i = 0; i < result.log.logentry.length; i++) {
            var entry = result.log.logentry[i];

            if (entry.paths[0].path)
            {
                var entrydate = entry.date[0];
                var was_ms = Date.parse(entrydate);
                var age = Math.round((today_ms - was_ms) / one_day_in_milliseconds);

                //For each path mentioned in the log entry...
                for (var j = 0; j < entry.paths[0].path.length; j++) {
                    var path = entry.paths[0].path[j];

                    var effectivePath = path._;

                    if (effectivePath) {
                        //We should go through this stack backwards...to bring the path back to present day.
                        for (var m = copyStack.length - 1; m >= 0; m--) {
                            if (effectivePath.startsWith(copyStack[m].from)) {
                                effectivePath = copyStack[m].to + effectivePath.substring(copyStack[m].from.length);

 //                               console.log('=========');
   //                             console.log(path._);
     //                           console.log(copyStack[m]);
       //                         console.log('rewrite to: ' + effectivePath);
                            }
                        }
                    }

                    var parts = effectivePath.split('/');

                    //2 = 1 (base) + /subversion
                    var parent = model;

                    //console.log(path.$);
                    //If there's a copy from some other part of the repo, then we need to propergate the deadchildren...
                    //I knew the dead would be try and get me for trying to get the zombies!
                    if (path.$.action === 'A' && path.$['copyfrom-path'])
                    {
                        //console.log(path._);
                        //console.log('to ' + path.$['copyfrom-path']);
                        copyStack.push({ from: path._, to: path.$['copyfrom-path']});
                    }

                    //For each directory in the path...
                    for (var k = 2; k < parts.length; k++) {
                        var child = null;

                        //Has this directory / file already been deleted?
                        var escape = false;
                        for (var l = 0; l < parent.deadchildren.length;l++)
                        {
                            if (parent.deadchildren[l].name === parts[k])
                            {
                                escape=true;
                                break;
                            }
                        }
                        if (escape)
                            break;

                        //Have we seen this child dir before?
                        for (var l = 0; l < parent.children.length;l++)
                        {
                            if (parent.children[l].name === parts[k])
                            {
                                child = parent.children[l];
                                break;
                            }
                        }

                        //If we're considering the final part of the path...check action to see if delete
                        if (k == parts.length - 1 && path.$.action === 'D')
                        {
                            child = { name:parts[k] };
                            parent.deadchildren.push(child);
                        }
                        else {
                            if (!child) {
                                child = {
                                    name: parts[k],
                                    size: 1,
                                    ageInDays: age,
                                    children: [],
                                    deadchildren: []
                                };
                                parent.children.push(child);
                            }
                            else {
                                child.size += 1;
                            }
                        }
                        //Go one level deeper into the path...
                        parent = child;
                    }
                }
            }
        }

        var fs = require('fs');

        fs.writeFile('out.js',  'var data = ' + JSON.stringify(model)+';' );
        console.log('Done - view index.html to see the results. (raw output is in out.json)');
    });
});

console.log('processing...');