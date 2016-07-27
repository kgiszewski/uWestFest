cd appveyor
call npm install
call node appveyor-package-version-patch.js
cd..