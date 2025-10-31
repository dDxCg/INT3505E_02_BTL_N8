#Merge command
git fetch frontend-temp frontend
git subtree pull --prefix=frontend frontend-temp frontend --squash

git fetch backend-temp backend
git subtree pull --prefix=backend backend-temp backend --squash
