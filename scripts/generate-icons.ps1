$ErrorActionPreference = "Stop"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$projectRoot = (Get-Location).Path

$svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="dhonn-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>
    <linearGradient id="dhonn-glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#dhonn-bg)" />
  <rect width="512" height="512" rx="116" fill="url(#dhonn-glass)" />
  <rect x="2" y="2" width="508" height="508" rx="114" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.14" />
  
  <g transform="translate(136, 130) scale(10.5)" fill="none" stroke="#ffffff" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
    <path d="M16 9a5 5 0 0 1 0 6" />
    <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
  </g>
</svg>
"@

Set-Content -Path "$projectRoot\public\app-icon.svg" -Value $svg -Encoding utf8
Copy-Item -Path "$projectRoot\public\app-icon.svg" -Destination "$projectRoot\app\icon.svg" -Force

$html512 = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; }
  html, body { width: 512px; height: 512px; overflow: hidden; background: transparent !important; }
  svg { width: 512px; height: 512px; display: block; }
</style>
</head>
<body>
$svg
</body>
</html>
"@

$html192 = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; }
  html, body { width: 192px; height: 192px; overflow: hidden; background: transparent !important; }
  svg { width: 192px; height: 192px; display: block; }
</style>
</head>
<body>
$svg
</body>
</html>
"@

Set-Content -Path "$projectRoot\public\temp-512.html" -Value $html512 -Encoding utf8
Set-Content -Path "$projectRoot\public\temp-192.html" -Value $html192 -Encoding utf8

$file512Url = "file:///" + "$projectRoot/public/temp-512.html".Replace("\", "/")
$file192Url = "file:///" + "$projectRoot/public/temp-192.html".Replace("\", "/")

Start-Process -FilePath $edgePath -ArgumentList @(
  "--headless=new",
  "--disable-gpu",
  "--default-background-color=00000000",
  "--window-size=512,512",
  "--screenshot=$projectRoot\public\app-icon-512.png",
  $file512Url
) -Wait

Start-Process -FilePath $edgePath -ArgumentList @(
  "--headless=new",
  "--disable-gpu",
  "--default-background-color=00000000",
  "--window-size=192,192",
  "--screenshot=$projectRoot\public\app-icon-192.png",
  $file192Url
) -Wait

Copy-Item -Path "$projectRoot\public\app-icon-192.png" -Destination "$projectRoot\app\apple-icon.png" -Force

Remove-Item -Path "$projectRoot\public\temp-512.html" -Force
Remove-Item -Path "$projectRoot\public\temp-192.html" -Force

# Generate favicon.ico using System.Drawing
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("$projectRoot\public\app-icon-512.png")
$bmp = New-Object System.Drawing.Bitmap 32, 32
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($img, 0, 0, 32, 32)
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::Create("$projectRoot\app\favicon.ico")
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$bmp.Dispose()
$g.Dispose()
$img.Dispose()

Copy-Item -Path "$projectRoot\app\favicon.ico" -Destination "$projectRoot\public\favicon.ico" -Force

Write-Host "All icons generated successfully!"
