## Frontend OnChanges
# Restart Server

cd ~/Biodata-Frontend
# 1. Backup your current website
cp -r ~/cbms.adnyeri.org ~/backups/cbms.adnyeri.org-backup-$(date +%Y%m%d-%H%M%S)
# 2. Remove old files from website directory (be careful!)
rm -rf ~/cbms.adnyeri.org/*
git pull
JoshMith
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
ng build --configuration production
# 3. Copy the built Angular files to your website
cp -r ~/Biodata-Frontend/dist/biodata-system/browser/* ~/cbms.adnyeri.org/
# 5. Verify the deployment
ls -la ~/cbms.adnyeri.org/

## Backend OnChanges
# Restart Server
cd ~/Biodata-Backend
git pull
JoshMith
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
pm2 restart biodata-backend
pm2 delete biodata-backend
pm2 start "npm run start" --name "biodata-backend"
pm2 save
pm2 status
pm2 logs biodata-backend


## You have local changes in package.json that conflict with the incoming changes. Here's how to resolve this:
Option 1: Stash Your Changes (Recommended if you want to keep them)
bash# Save your local changes temporarily
git stash

# Pull the latest changes
git pull

# Reapply your local changes
git stash pop

# Fetch latest without merging
git fetch origin

# Reset to match remote (WARNING: loses local commits)
git reset --hard origin/main