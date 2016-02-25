var finder = require('../finder');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-shallow-deep-equal'));

function log(logentries)
{
    return `<?xml version="1.0" encoding="UTF-8"?>
           <log>` + logentries +'</log>';
}

function path(obj) {
    var defaultPath = {
        textmods:true,
        kind:'file',
        action:'M',
        promods:false,
        file:'/subversion/patch_tests.py'
    };

    Object.assign(defaultPath, obj);

    return `<path
                text-mods="${defaultPath.textmods}"
                kind="${defaultPath.kind}"
                action="${defaultPath.action}"
                prop-mods="${defaultPath.promods}">${defaultPath.file}</path>`;
}

function entry(obj) {
    //Defaults:
    var entry = {
        revision : 1,
        date : '2016-02-22',
        author : 'rhuijben',
        paths : [],
        msg:'...'
    };
    Object.assign(entry, obj);

    var result = `<logentry revision="${entry.revision}">
                   <author>${entry.author}</author>
                   <date>${entry.date}T17:42:58.254660Z</date>
                   <paths>`;

    for(var aPath of entry.paths) {
        result += path(aPath);
    }

    return result + `</paths>
                   <msg>${entry.message}</msg>
               </logentry>`;
}

describe("zombiecodefinder", function() {
   it("should should be able to transform subversion xml", function(){
       var input = log(
           entry({paths :[{ file: '/subversion/patch_tests.py' }]})
       );

       finder.buildModel(input, function(model) {
           expect(model).to.shallowDeepEqual({
               "name": "svn",
               "children": [
                   {
                       "ageInDays": 3,
                       "children": [],
                       "name": "patch_tests.py",
                   }
               ],
               "deadchildren": [],
           });
       });
   });

    it("should should exclude a deleted file from the results", function(){
        var input = log(
            entry({paths :[{ file: '/subversion/patch_tests.py', action:'D' }]}) +
            entry({paths :[{ file: '/subversion/patch_tests.py' }]})
        );

        finder.buildModel(input, function(model) {
            expect(model).to.shallowDeepEqual({
                "name": "svn",
                "children": [],
                "deadchildren": [{name:"patch_tests.py"}],
            });
        });
    });
});