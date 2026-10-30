# Generates PNG icons into ./static (run from the project root): powershell -File tools/make-icons.ps1
# build.mjs then packs favicon.ico from the 16/32/48 PNGs and copies everything in ./static to dist/.
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force static | Out-Null

function Brush($hex) { New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex)) }

function Make-Icon([int]$size, [string]$file, [bool]$maskable = $false) {
  $b = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($b)
  $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.Clear([System.Drawing.Color]::Transparent)
  if ($maskable) {
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0f3d2e'))   # full-bleed for Android masks
    $pad = [int]($size * 0.2)
  } else {
    $r = [int]($size * 0.22); $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $r * 2, $r * 2, 180, 90); $path.AddArc($size - $r * 2 - 1, 0, $r * 2, $r * 2, 270, 90)
    $path.AddArc($size - $r * 2 - 1, $size - $r * 2 - 1, $r * 2, $r * 2, 0, 90); $path.AddArc(0, $size - $r * 2 - 1, $r * 2, $r * 2, 90, 90)
    $path.CloseFigure(); $g.FillPath((Brush '#0f3d2e'), $path)
    $pad = [int]($size * 0.1)
  }
  $inner = $size - 2 * $pad
  # golf ball
  $ball = [int]($inner * 0.62); $bx = $pad + [int](($inner - $ball) / 2); $by = $pad + [int]($inner * 0.32)
  $g.FillEllipse((Brush '#f6f4ee'), $bx, $by, $ball, $ball)
  if ($size -ge 48) {
    $d = [Math]::Max(2, [int]($ball * 0.08))
    foreach ($p in @(@(0.30, 0.30), @(0.55, 0.25), @(0.70, 0.50), @(0.40, 0.58), @(0.60, 0.75), @(0.25, 0.55))) {
      $g.FillEllipse((Brush '#c9d8cf'), $bx + [int]($ball * $p[0]), $by + [int]($ball * $p[1]), $d, $d)
    }
  }
  # "A9" mark
  $font = New-Object System.Drawing.Font 'Georgia', ([float]($inner * 0.27)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat; $fmt.Alignment = 'Center'
  $g.DrawString('A9', $font, (Brush '#e9c46a'), (New-Object System.Drawing.RectangleF $pad, ($pad - $inner * 0.02), $inner, ($inner * 0.34)), $fmt)
  $b.Save("$PWD\static\$file", [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $b.Dispose()
}

Make-Icon 16 'favicon-16.png'
Make-Icon 32 'favicon-32x32.png'
Make-Icon 48 'favicon-48.png'
Make-Icon 180 'apple-touch-icon.png'
Make-Icon 192 'icon-192.png'
Make-Icon 512 'icon-512.png'
Make-Icon 512 'icon-maskable-512.png' $true
Write-Output 'icons written to static/'
