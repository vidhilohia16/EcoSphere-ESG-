# Setup portable Node.js environment
$destDir = "C:\Users\ACER\node-env"
$zipPath = "$destDir\node.zip"
$nodeUrl = "https://nodejs.org/dist/v22.13.1/node-v22.13.1-win-x64.zip"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$extractedDir = "$destDir\node-v22.13.1-win-x64"
if (-not (Test-Path "$extractedDir\node.exe")) {
    Write-Host "Downloading Node.js from $nodeUrl..."
    Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath
    Write-Host "Extracting Node.js zip..."
    Expand-Archive -Path $zipPath -DestinationPath $destDir -Force
    Remove-Item -Path $zipPath -Force
    Write-Host "Node.js successfully installed at $extractedDir"
} else {
    Write-Host "Node.js already exists at $extractedDir"
}

# Verify it works
& "$extractedDir\node.exe" -v
& "$extractedDir\npm.cmd" -v
