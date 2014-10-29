# Resources
[Supported ES5 features](http://kangax.github.io/compat-table/es5/)


# Development

start the _compiler_:

	grunt dev
	
start the API server

	./bin/api_server
	
start the Test runner (server)

	./bin/test_runner
	
each in different terminal

# Releasing

when a new version is ready to be released then run
  
	grunt release         <- bugfix   release
	grunt release:minor   <- feature release
   grunt release:major   <- major   release
   
this will also make a copy to deployed and operation dir

**NOTE: only commit deployed if you have committet in to operations**