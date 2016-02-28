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
        'text-mods':true,
        kind:'file',
        action:'M',
        promods:false,
        file:'/subversion/patch_tests.py'
    };

    Object.assign(defaultPath, obj);

    var res = `<path
                text-mods="${defaultPath['text-mods']}"
                kind="${defaultPath.kind}"
                action="${defaultPath.action}"
                prop-mods="${defaultPath.promods}"
                `;

    if (defaultPath['copyfrom-path'])
    {
        res += 'copyfrom-path="' + defaultPath['copyfrom-path'] + '"';
    }

    return res + `>${defaultPath.file}</path>`;
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
                       "children": [],
                       "name": "patch_tests.py"
                   }
               ],
               "deadchildren": []
           });
           expect(model.deadchildren.length).to.equal(0);
           expect(model.children.length).to.equal(1);
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
                "deadchildren": [{name:"patch_tests.py"}]
            });
            expect(model.children.length).to.equal(0);
        });
    });

    it("a file copied and then deleted should not appear in the reuslts.", function(){
        var input = log(
            entry({paths :[{ file: '/subversion/patch_tests.py', action:'D' }]}) +
            entry({paths :[{ action:'A', 'copyfrom-path': '/subversion/original.py', file: '/subversion/patch_tests.py' }]}) +
            entry({paths :[{ action:'A', file: '/subversion/original.py' }]})
        );

        finder.buildModel(input, function(model) {
            expect(model).to.shallowDeepEqual({
                "name": "svn",
                "children": [],
                "deadchildren": [{name:"patch_tests.py"}]
            });
            expect(model.deadchildren.length).to.equal(1);
            expect(model.children.length).to.equal(0);
        });
    });

    it("a file copied and not deleted should appear in the reuslts once as the final filename.", function(){
        var input = log(
            entry({paths :[{ action:'A', 'copyfrom-path': '/subversion/original.py', file: '/subversion/patch_tests.py' }]}) +
            entry({paths :[{ action:'A', file: '/subversion/original.py' }]})
        );

        finder.buildModel(input, function(model) {
            expect(model).to.shallowDeepEqual({
                "name": "svn",
                "children": [
                    {
                        "children": [],
                        "deadchildren": [],
                        "name": "patch_tests.py",
                        "size": 2 //There have been 2 commits to this file conceptually.
                    }
                ],
                "deadchildren": []
            });
            expect(model.children.length).to.equal(1);
        });
    });

});