# Daniels Hemsida

The source code for my website that uses custom static site generation build with python. Visit the site at [grgta.xyz](https://grgta.xyz)

## Templates & Content

HTML that is reused across the site is in the template-folder. "template.html" is the backbone and is used for every single page, that page in its turn uses "nav_bar.html" which in its turn uses "nav_item.html". This is as deep as the nesting goes, and the structure is made in a pretty ad hoc fashion to suit the design of my own webpage. 

The Content is found in the generic "content" folder, the "pages" folder, as well as the "articles" folder. As article files are added they will dynamically appear on the site when re-build using the main python script. The files in "pages" are also dynamically generated and added to the navbar.

## The main script

Inside "generate_html.py" the site generation takes place, here all relevant files are read and the output is put into the "out" folder.

## Dependencies

[BeautifulSoup](https://pypi.org/project/beautifulsoup4/) are used for prettification and some html editing and [markdown2](https://github.com/trentm/python-markdown2) are used for html generation.

## Todo
- add darkmode toggle
- add dates for articles
- change margin on content on bg screens
