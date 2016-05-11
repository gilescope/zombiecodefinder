console.log('Zombie Code Finder - first argument should point to the svn log file');
console.log('(To create file: svn log --with-all-revprops -v --xml http://.../trunk > my.xml)');

//For webstorm type inference happyness:
function LogType()
{
    return {
        logentry:1
    }
}
LogType();
//end webstorm...

var finder = require('./finder');

var args = process.argv.slice(2);

var fs = require('fs');

var filename = args[0];

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

fs.readFile(filename, function(err, data) {

        finder.buildModel(data, "*.csproj", function(model) {

        //Prune to reality if specified:
        if (args.length > 1)
        {
            //Second arg is a checkout directory of present day...
            var checkedoutpath = args[2];
            var checkoutBits = checkedoutpath.split('/');

            for(var q = 0; q < checkoutBits.length; q++)
            {
                console.log('checking ' + checkoutBits[q]);
                for (var r = 0; r < model.children.length; r++)
                {
                    console.log('checking child ' + model.children[r]);
                    if (model.children[r].name === checkoutBits[q])
                    {
                        model = model.children[r];
                        console.log('pruning base to ' + model.children[r].name);
                        break;
                    }
                }
            }

            finder.prune(model, args[1]);
        }

        var reportFile = filename + '.html';

        fs.readFile('index.html', 'utf-8', function(err, data) {
            var token = 'var data;';

            var index = data.indexOf(token);

            var before = data.substr(0, index);
            var after = data.substr(index + token.length);

            var d3js = fs.readFileSync('node_modules/d3/d3.min.js', 'utf-8');

            fs.writeFile(reportFile, before + d3js + 'var data = ' + JSON.stringify(model)+';' + after);
            console.log('Done - view ' + reportFile + ' to see the results.');
        });
        });
});

console.log('processing...');