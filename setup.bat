@echo off
echo Setting up Mini Praisells...

echo Installing Node.js dependencies...
npm install

echo Copying environment configuration...
if not exist .env (
    copy .env.example .env
    echo Created .env file from template
) else (
    echo .env file already exists
)

echo.
echo Setup complete!
echo.
echo To start the server, run: npm start
echo Or use: start-server.bat
echo.
pause
