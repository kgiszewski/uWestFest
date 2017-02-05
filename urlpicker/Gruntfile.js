module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  var path = require('path')

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    pkgMeta: grunt.file.readJSON('config/meta.json'),
    dest: grunt.option('target') || 'dist',
    basePath: path.join('<%= dest %>', 'App_Plugins', '<%= pkgMeta.name %>'),

    concat: {
      dist: {
        src: [
          'app/scripts/controllers/url.picker.controller.js',
          'app/scripts/controllers/default.type.js',
          'app/scripts/controllers/additional.types.controller.js',
          'app/scripts/service.js'
        ],
        dest: '<%= basePath %>/js/url.picker.js',
        nonull: true
      }
    },

    less: {
      dist: {
        options: {
          paths: ["app/styles"],
        },
        files: {
          '<%= basePath %>/css/url.picker.css': 'app/styles/url.picker.less',
        }
      }
    },

    watch: {
      less: {
        files: ['app/styles/**/*.less'],
        tasks: ['less:dist'],
        options: {
          spawn: false
        }
      },

      js: {
        files: ['app/scripts/**/*.js'],
        tasks: ['concat:dist'],
        options: {
          spawn: false
        }
      },

      html: {
        files: ['app/views/**/*.html'],
        tasks: ['copy:views'],
        options: {
          spawn: false
        }
      }
    },

    copy: {
      config: {
        src: 'config/package.manifest',
        dest: '<%= basePath %>/package.manifest',
      },
      
      lang: {
        expand: true,
        cwd: 'config/lang/',
        src: '**',
        dest: '<%= basePath %>/lang/'
      },

      views: {
        expand: true,
        cwd: 'app/views/',
        src: '**',
        dest: '<%= basePath %>/views/'
      },

      dll: {
        expand: true,
        flatten: true,
        cwd: 'src/UrlPicker.Umbraco/bin/Debug/',
        src: '**',
        dest: '<%= dest %>/bin/'
      },

      nugetContent: {
        expand: true,
        cwd: '<%= dest %>',
        src: ['**/*','!bin/**'],
        dest: 'tmp/nuget/content/'
      },

      nugetLib: {
        expand: true,
        cwd: '<%= dest %>',
        src: 'bin/*.*',
        dest: 'tmp/nuget/lib/net40/',
        flatten: true
      },

      umbraco: {
        expand: true,
        cwd: '<%= dest %>/',
        src: '**',
        dest: 'tmp/umbraco/'
      }
    },

    copy: {
      config: {
        src: 'config/package.manifest',
        dest: '<%= basePath %>/package.manifest',
      },
      lang: {
        expand: true,
        cwd: 'config/lang/',
        src: '**',
        dest: '<%= basePath %>/lang/'
      },
      views: {
        expand: true,
        cwd: 'app/views/',
        src: '**',
        dest: '<%= basePath %>/views/'
      },
      dll: {
        cwd: 'src/UrlPicker.Umbraco/bin/Debug/',
        src: 'UrlPicker.dll',
        dest: '<%= dest %>/bin/',
        expand: true
      },
      nuget: {
        files: [
          {
            cwd: '<%= dest %>/App_Plugins',
            src: ['**/*', '!bin', '!bin/*'],
            dest: 'tmp/nuget/content/App_Plugins',
            expand: true
          },
          {
            cwd: '<%= dest %>/UrlPicker/',
            src: ['**/*'],
            dest: 'tmp/nuget/content/UrlPicker',
            expand: true
          },
          {
            cwd: '<%= dest %>/bin',
            src: ['*.dll'],
            dest: 'tmp/nuget/lib/net40',
            expand: true
          }
        ]
      },
      umbraco: {
        cwd: '<%= dest %>',
        src: '**/*',
        dest: 'tmp/umbraco',
        expand: true
      }
    },
    nugetpack: {
        dist: {
            src: 'tmp/nuget/package.nuspec',
            dest: 'pkg'
        }
    },
    template: {
        'nuspec': {
            'options': {
                'data': { 
                    name: '<%= pkgMeta.name %>',
                    version: '<%= pkgMeta.version %>',
                    url: '<%= pkgMeta.url %>',
                    license: '<%= pkgMeta.license %>',
                    licenseUrl: '<%= pkgMeta.licenseUrl %>',
                    author: '<%= pkgMeta.author %>',
                    authorUrl: '<%= pkgMeta.authorUrl %>',
                    description: '<%= pkgMeta.description %>',
                    files: [{ path: 'tmp/nuget/content/App_Plugins', target: 'content/App_Plugins'}]
                }
            },
            'files': { 
                'tmp/nuget/package.nuspec': ['config/package.nuspec']
            }
        }
    },
    umbracoPackage: {
      options: {
        name: "<%= pkgMeta.name %>",
        version: '<%= pkgMeta.version %>',
        url: '<%= pkgMeta.url %>',
        license: '<%= pkgMeta.license %>',
        licenseUrl: '<%= pkgMeta.licenseUrl %>',
        author: '<%= pkgMeta.author %>',
        authorUrl: '<%= pkgMeta.authorUrl %>',
        manifest: 'config/package.xml',
        readme: 'config/readme.txt',
        sourceDir: 'tmp/umbraco',
        outputDir: 'pkg',
      }
    },
    clean: {
      build: '<%= grunt.config("basePath").substring(0, 4) == "dist" ? "dist/**/*" : "null" %>',
      tmp: ['tmp']
    },
    assemblyinfo: {
      options: {
        files: ['src/UrlPicker.Umbraco/UrlPicker.Umbraco.csproj'],
        filename: 'AssemblyInfo.cs',
        info: {
          version: '<%= (pkgMeta.version.indexOf("-") ? pkgMeta.version.substring(0, pkgMeta.version.indexOf("-")) : pkgMeta.version) %>', 
          fileVersion: '<%= pkgMeta.version %>'
        }
      }
    },
    msbuild: {
      options: {
        stdout: true,
        verbosity: 'quiet',
        maxCpuCount: 4,
        version: 4.0,
        buildParameters: {
          WarningLevel: 2,
          NoWarn: 1607
        }
      },
      dist: {
        src: ['src/UrlPicker.Umbraco/UrlPicker.Umbraco.csproj'],
        options: {
          projectConfiguration: 'Debug',
          targets: ['Clean', 'Rebuild'],
        }
      }
    }
  });

  grunt.registerTask('default', ['clean', 'assemblyinfo', 'less', 'concat', 'msbuild:dist', 'copy:config', 'copy:lang', 'copy:views', 'copy:dll']);
  grunt.registerTask('nuget',   ['clean:tmp', 'default', 'copy:nuget', 'template:nuspec', 'nugetpack']);
  grunt.registerTask('umbraco', ['clean:tmp', 'default', 'copy:umbraco', 'umbracoPackage']);
  grunt.registerTask('package', ['clean:tmp', 'default', 'copy:nuget', 'template:nuspec', 'nugetpack', 'copy:umbraco', 'umbracoPackage', 'clean:tmp']);
};

