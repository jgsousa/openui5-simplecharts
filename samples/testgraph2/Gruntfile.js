var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
var mountFolder = function(connect, dir){
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt){
    require('load-grunt-tasks')(grunt, {scope: 'devDependencies' });

    grunt.initConfig({
        open:{
            saf: {
                path: 'http://localhost:8080',
                app: 'Safari'
            },
            chr: {
                path: 'http://localhost:8080',
                app: 'Google Chrome'
            },
            win: {
                path: 'http://localhost:8080',
                app: 'chrome.exe'
            }


        },

        watch:{
            scripts:{
                files: ['**/*.js', '!**/node_modules/**','!**/resources/**' ],
                options:{
                    livereload:true,
                    interval:10000
                }
          }
        },
        connect: {
            server: {
                options: {
                    port: 8080,
                    hostname: 'localhost',
                    middleware: function (connect, options){
                        return [
                            proxySnippet,
                            connect.static(options.base[0]),
                            connect.directory(options.base[0]),
                        ]
                    }
                },
                proxies:[
                    {
                        context: '/sap/opu/odata',
                        host: '192.168.1.1',
                        port: '8000',
                        https: false
                    }
                ]
            }
        }
    });

    grunt.registerTask('default',[
        'configureProxies:server',
        'connect',
        'open:saf',
        'watch'
    ]);
    grunt.registerTask('chrome',[
        'configureProxies:server',
        'connect',
        'open:chr',
        'watch'
    ]);
    grunt.registerTask('windows',[
        'configureProxies:server',
        'connect',
        'open:win',
        'watch'
    ]);

}

