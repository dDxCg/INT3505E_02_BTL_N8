## Commands

### Frontend

```bash
git fetch frontend-temp frontend
git subtree pull --prefix=frontend frontend-temp frontend --squash
```

### Backend

```bash
git fetch backend-temp backend
git subtree pull --prefix=backend backend-temp backend --squash
```

```bash
git log --all --no-merges --pretty="%an" --shortstat | \
awk '
  /^[^ ]/ {author=$0; commits[author]++}
  /insertions|deletions/ {
    added=0; deleted=0
    if($4 ~ /^[0-9]+$/) added=$4
    if($6 ~ /^[0-9]+$/) deleted=$6
    insertions[author]+=added
    deletions[author]+=deleted
    lines[author]+=(added + deleted)
  }
  END {
    total_lines=0
    for(a in lines) total_lines += lines[a]

    printf "Author,Commits,Insertions,Deletions,TotalLines,Percentage\n" > "contributors_distribution.csv"
    for(a in lines){
      perc = (lines[a]/total_lines)*100
      printf "%s,%d,%d,%d,%d,%.2f%%\n", a, commits[a], insertions[a], deletions[a], lines[a], perc >> "contributors_distribution.csv"
    }
  }
'
```
