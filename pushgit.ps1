param(
  [Parameter(Mandatory = $true)]
  [string]$Message,

  [string]$Branch = "",

  [switch]$NoPullRebase
)

$ErrorActionPreference = "Stop"

function Write-Step($text) {
  Write-Host "==> $text" -ForegroundColor Cyan
}

function Exit-WithError($text) {
  Write-Host "ERROR: $text" -ForegroundColor Red
  exit 1
}

Write-Step "Vérification du dépôt git"
git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
  Exit-WithError "Ce dossier n'est pas un dépôt git."
}

$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch) -or $currentBranch -eq "HEAD") {
  Exit-WithError "Branche détachée détectée. Bascule sur une branche avant push."
}

$targetBranch = if ([string]::IsNullOrWhiteSpace($Branch)) { $currentBranch } else { $Branch }

if ($targetBranch -ne $currentBranch) {
  Write-Step "Changement de branche vers '$targetBranch'"
  git checkout $targetBranch
  if ($LASTEXITCODE -ne 0) {
    Exit-WithError "Impossible de se positionner sur la branche '$targetBranch'."
  }
  $currentBranch = $targetBranch
}

Write-Step "Statut git"
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
  Exit-WithError "Aucun changement à commit."
}

if (-not $NoPullRebase) {
  Write-Step "Synchronisation distante (pull --rebase)"
  git pull --rebase origin $currentBranch
  if ($LASTEXITCODE -ne 0) {
    Exit-WithError "Le pull --rebase a échoué. Résous le conflit puis relance."
  }
}

Write-Step "Ajout des fichiers"
git add -A
if ($LASTEXITCODE -ne 0) {
  Exit-WithError "git add a échoué."
}

Write-Step "Commit"
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) {
  Exit-WithError "git commit a échoué."
}

Write-Step "Push vers origin/$currentBranch"
git push -u origin $currentBranch
if ($LASTEXITCODE -ne 0) {
  Exit-WithError "git push a échoué."
}

Write-Host ""
Write-Host "Push terminé avec succès sur '$currentBranch'." -ForegroundColor Green
