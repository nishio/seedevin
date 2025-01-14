#!/bin/bash
for file in *.md; do
    if [ -f "$file" ]; then
        base="${file%.md}"
        echo "Converting $file to $base.tex"
        pandoc -f markdown -t latex --natbib --wrap=none -o "$base.tex" "$file"
        # Fix citation format
        sed -i 's/@\([^]]*\)\]/\\citep{\1}/g' "$base.tex"
        sed -i 's/@\([^]]*\)/\\citep{\1}/g' "$base.tex"
    fi
done
