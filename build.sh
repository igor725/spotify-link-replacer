#!/bin/bash
cd dirname "$(readlink -f "$0")"
if [ ! -f "node_modules/uglify-js/bin/uglifyjs" ]; then
	npm install
	if [ $? -ne 0 ]; then
		echo "npm install failed"
		exit 1
	fi
fi

cat slr.meta.js > slr.user.js
node_modules/uglify-js/bin/uglifyjs --compress --mangle -- slr.js >> slr.user.js
