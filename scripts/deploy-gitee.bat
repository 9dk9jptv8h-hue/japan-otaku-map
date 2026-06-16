@echo off
chcp 65001 >nul 2>&1
setlocal

echo ============================================
echo   Japan Otaku Map - Gitee Pages Deploy
echo ============================================
echo.

REM ============================================
REM  配置区 - 请修改为你的Gitee信息
REM ============================================
set "GITEE_USER=YOUR_GITEE_USERNAME"
set "GITEE_REPO=japan-otaku-map"
REM ============================================

if "%GITEE_USER%"=="YOUR_GITEE_USERNAME" (
    echo [ERROR] 请先编辑此脚本，将 GITEE_USER 改为你的Gitee用户名！
    echo         打开 scripts\deploy-gitee.bat 修改第14行
    pause
    exit /b 1
)

echo [1/4] Building project...
cd /d "%~dp0.."
set GITEE_PAGES=true
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Preparing git repo in dist...
cd dist
if exist .git (rmdir /s /q .git)
git init
git checkout -b master

echo.
echo [3/4] Committing files...
git add -A
git commit -m "deploy: %date:~0,4%-%date:~5,2%-%date:~8,2% %time:~0,8%"

echo.
echo [4/4] Pushing to Gitee...
git push -f "https://gitee.com/%GITEE_USER%/%GITEE_REPO%.git" master:master
if errorlevel 1 (
    echo.
    echo [ERROR] Push failed! Check:
    echo   1. Gitee repo exists: https://gitee.com/%GITEE_USER%/%GITEE_REPO%
    echo   2. Your Gitee credentials are correct
    echo   3. Try: git config --global credential.helper store
    pause
    exit /b 1
)

cd ..
echo.
echo ============================================
echo   Deploy complete!
echo ============================================
echo.
echo   Next steps:
echo   1. Go to https://gitee.com/%GITEE_USER%/%GITEE_REPO%
echo   2. Click "Services" (服务) - "Gitee Pages"
echo   3. Deploy branch: master
echo   4. Deploy directory: / (root)
echo   5. Click "Start" (启动)
echo.
echo   Your site will be at:
echo   https://%GITEE_USER%.gitee.io/%GITEE_REPO%/
echo.
pause
