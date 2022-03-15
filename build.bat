@echo off
setlocal enableextensions enabledelayedexpansion
@CD /D %~dp0

IF NOT EXIST "node_modules\.bin\uglifyjs.cmd" (
	npm install
	IF NOT "%ERRORLEVEL%"=="0" (
		ECHO Failed to install NPM deps
		GOTO fail
	)
)

type slr.meta.js > slr.user.js
node_modules\.bin\uglifyjs --compress --mangle -- slr.js >> slr.user.js

endlocal
EXIT /b 0

:fail
endlocal
EXIT /b 1
