@echo off
@echo ===============================================================================
@echo                            ______ __                   __
@echo                           / ____// /____   ____   ____/ /
@echo                          / /_   / // __ \ / __ \ / __  / 
@echo                         / __/  / // /_/ // /_/ // /_/ /  
@echo                        /_/    /_/ \____/ \____/ \__,_/  test
@echo ===============================================================================

@if exist "dist" rmdir "dist" /s /q

@echo Enter path to Dynamo bin files (like D:\Dynamo\Bin\Release)

@set /p dynamoBin=^>

@call grunt build

@xcopy %dynamoBin% "dist/dynamo" /E /K /C /I /Y

@call grunt desktop_selenium
@call grunt desktop_dynamo

@ren "dist_desktop\releases\flood\win\flood\flood.exe" "nw.exe"
@xcopy "test/seleniumServer" "dist_desktop/releases/flood/win/flood" /E /K /C /I /Y

@cls

@echo All done! Now you can run application from .\dist_desktop\releases\flood\win\flood

@call %SystemRoot%\explorer.exe %CD%\dist_desktop\releases\flood\win\flood

@pause