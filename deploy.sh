cd ./dist
git init
git add .
git commit -m "deploy"
git push -f 
git push -f git@github.com:OceanPresentChao/Peintre.git master:gh-pages
cd -