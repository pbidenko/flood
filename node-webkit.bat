@echo off
@echo ===============================================================================
@echo                            ______ __                   __
@echo                           / ____// /____   ____   ____/ /
@echo                          / /_   / // __ \ / __ \ / __  / 
@echo                         / __/  / // /_/ // /_/ // /_/ /  
@echo                        /_/    /_/ \____/ \____/ \__,_/   
@echo ===============================================================================

@if exist "dist" rmdir "dist" /s /q

@echo Enter path to Dynamo bin files (like D:\Dynamo\Bin\Release)

@set /p dynamoBin=^>

@call grunt build

@xcopy %dynamoBin% "dist/dynamo" /E /C /I /Y

@call grunt desktop_dynamo

@cls

@echo All done! Now you can run application from .\dist_desktop\releases\flood\win\flood

@pause