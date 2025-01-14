SECTIONS = 1_introduction.tex 2_theoretical_framework.tex 3_implementation_mechanisms.tex 4_mass_adaptation.tex 5_case_studies.tex 6_future_directions.tex 7_conclusion.tex

all: paper.pdf

%.tex: %.md
	pandoc -f markdown -t latex --natbib --wrap=none -o $@ $<

paper.pdf: main.tex $(SECTIONS) references.bib
	latexmk -pdf -xelatex main.tex

test: test.tex test_ja.tex references.bib
	latexmk -pdf -xelatex test.tex
	latexmk -pdf -xelatex test_ja.tex

clean:
	rm -f *.aux *.log *.out *.toc *.bbl *.blg *.fls *.fdb_latexmk *.pdf *.tex

.PHONY: all clean test
