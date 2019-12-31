@echo off&setlocal enabledelayedexpansion
for /f "delims=" %%a in ('dir/b *.txt') do (
   set /a n+=1
   if not exist "!n!.txt" (ren "%%a" "!n!.jpg") else call :loop "%%a"
)
pause&exit
:loop
  set /a n+=1
  if exist "!n!.txt" goto loop
  ren "%~1" "!n!.jpg"
goto :eof