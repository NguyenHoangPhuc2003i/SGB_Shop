Dim WshShell
Set WshShell = CreateObject("WScript.Shell")

' Set working directory to the project folder (literal path with spaces/diacritics handled)
WshShell.CurrentDirectory = "c:\project cá nhân\webfake\SGB_Shop"

' Optional: set AI provider keys here if you use cloud providers
' To enable OpenAI uncomment the next two lines and set your key:
' WshShell.Environment("Process")("AI_PROVIDER") = "openai"
' WshShell.Environment("Process")("OPENAI_API_KEY") = "YOUR_OPENAI_KEY_HERE"

' To enable Gemini instead, uncomment and set key:
' WshShell.Environment("Process")("AI_PROVIDER") = "gemini"
' WshShell.Environment("Process")("GEMINI_API_KEY") = "YOUR_GEMINI_KEY_HERE"

' Start the Node server hidden (0 = hidden window)
' If Node is not in PATH, edit the command to point to node.exe directly
WshShell.Run "cmd /c node server.js", 0

' Wait a moment for the server to boot, then open the AI page
WScript.Sleep 3000
WshShell.Run "cmd /c start \"\" http://127.0.0.1:3000/style-advisor.html", 0
