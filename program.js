console.log('hello world 2');

var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();

//var filename = 'test/small.xml';
var filename = 'test/svn.apache.org.xml';

fs.readFile(filename, function(err, data) {
    console.log('got here 0');
    parser.parseString(data, function (err, result) {
        console.log('error?');
        console.log(err);
        console.log('==enderror==');
      //  console.log(result.log.logentry);

        var model = { name:"svn", children:[]};

        for (var i = 0; i < result.log.logentry.length; i++) {
            //console.log(result.log.logentry[i]);
            var entry = result.log.logentry[i];

            //console.log(entry);
            var entrydate = entry.date[0];
            console.log(entrydate);
console.log( Date.parse(entrydate));
            var was_ms = Date.parse(entrydate);
            var today_ms = new Date().getTime();

            //Get 1 day in milliseconds
            var one_day=1000*60*60*24;

            var age = Math.round((today_ms - was_ms) / one_day);


            console.log(entrydate);
            //console.log(entry.paths[0].path[0]);
            //console.log(entry.paths[0].path[0]._);

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

        console.log('Done');
        console.log(model);

        var fs = require('fs');

        fs.writeFile('out.json',  JSON.stringify(model) );

    });
});

console.log('fin');
