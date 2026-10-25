$ErrorActionPreference = "Stop"

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$projectFile = Join-Path $repositoryRoot "src\PowerMonitorLab\PowerMonitorLab.csproj"
$artifactsRoot = Join-Path $repositoryRoot "artifacts"
$publishDirectory = Join-Path $artifactsRoot "PowerMonitorLab-win-x64"
$archivePath = Join-Path $artifactsRoot "PowerMonitorLab-win-x64.zip"

if (-not (Test-Path -LiteralPath $projectFile -PathType Leaf)) {
    throw "Project file was not found: $projectFile"
}

New-Item -ItemType Directory -Path $artifactsRoot -Force | Out-Null
if (Test-Path -LiteralPath $publishDirectory) {
    $resolvedOutput = (Resolve-Path -LiteralPath $publishDirectory).Path
    if (-not $resolvedOutput.StartsWith($artifactsRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a publish directory outside artifacts: $resolvedOutput"
    }
    Remove-Item -LiteralPath $resolvedOutput -Recurse -Force
}
if (Test-Path -LiteralPath $archivePath) {
    $resolvedArchive = (Resolve-Path -LiteralPath $archivePath).Path
    if (-not $resolvedArchive.StartsWith($artifactsRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to replace an archive outside artifacts: $resolvedArchive"
    }
    Remove-Item -LiteralPath $resolvedArchive -Force
}

dotnet publish $projectFile --configuration Release --runtime win-x64 --self-contained true `
    --output $publishDirectory -p:PublishSingleFile=false
if ($LASTEXITCODE -ne 0) {
    throw "dotnet publish failed with exit code $LASTEXITCODE"
}

Compress-Archive -Path (Join-Path $publishDirectory "*") -DestinationPath $archivePath -CompressionLevel Optimal
Write-Output "Published folder: $publishDirectory"
Write-Output "Portable archive: $archivePath"
