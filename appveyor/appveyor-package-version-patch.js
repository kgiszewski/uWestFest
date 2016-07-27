var jsonfile = require('jsonfile');
var semver = require('semver');

var file = '../urlpicker/config/meta.json';
var buildVersion = process.env.mssemver;

var semversion = semver.valid(buildVersion);

jsonfile.readFile(file, function (err, project) {
	project.version = semversion;
	jsonfile.writeFile(file, project, {spaces: 2}, function(err) {
		console.error(err);
	});
})