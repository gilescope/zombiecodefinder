console.log('Zombie Code Finder - first argument should point to the svn log file');
console.log('(To create file: svn log --with-all-revprops -v --xml http://.../trunk > my.xml)');

var args = process.argv.slice(2);

var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();

var filename = args[0];

fs.readFile(filename, function(err, data) {
    parser.parseString(data, function (err, result) {
        if (err) {
            console.log('==error==');
            console.log(err);
            console.log('==enderror==');
        }

        var model = { name:"svn", children:[]};

        for (var i = 0; i < result.log.logentry.length; i++) {
            var entry = result.log.logentry[i];

            var entrydate = entry.date[0];
            var was_ms = Date.parse(entrydate);
            var today_ms = new Date().getTime();

            //Get 1 day in milliseconds
            var one_day=1000*60*60*24;

            var age = Math.round((today_ms - was_ms) / one_day);

            if (entry.paths[0].path)
            {
                for (var j = 0; j < entry.paths[0].path.length; j++) {
                    var path = entry.paths[0].path[j];
                    var parts = path._.split('/');

                    //3 = 1 (base) + /subversion/trunk
                    var parent = model;
                    for (var k = 3; k < parts.length; k++) {
                        var child = null;
                        for (var l = 0; l < parent.children.length;l++)
                        {
                            if (parent.children[l].name === parts[k])
                            {
                                child = parent.children[l];
                                break;
                            }
                        }

                        if (!child) {
                            child = { name:parts[k], size: 1, date:entrydate, ageInDays: age, children: []};
                            parent.children.push(child);
                        }
                        else {
                            child.size += 1;
                        }

                        parent = child;
                    }
                }
            }
        }

        var fs = require('fs');

        fs.writeFile('out.json',  JSON.stringify(model) );
        console.log('Done - view index.html to see the results. (raw output is in out.json)');
    });
});

console.log('processing...');
