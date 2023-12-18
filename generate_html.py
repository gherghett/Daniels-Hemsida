import os
import markdown2
from bs4 import BeautifulSoup

#output folder for baked and root of ready website
OUTPUT_FOLDER = "./out"
OUTPUT_ARTICLES_FOLDER = OUTPUT_FOLDER+"/art"
TEMPLATES_FOLDER = "./templates"
PAGES_FOLDER = "./pages"

def create_folders():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_ARTICLES_FOLDER, exist_ok=True)

def relative_url(location, destination):
    result = []
    back = 0
    if len(location) > len(destination):
        back = len(location)-len(destination)
    common_length = min(len(location), len(destination))
    break_index = common_length
    for i in range(common_length-1, -1, -1):
        if location[i] != destination[i] :
            back += 1
            break_index = i
    result = [".."]*back + destination[break_index:]
    if len(result)>0:
        return "/".join(result)
    return ""

def apply_styles(html):
    soup = BeautifulSoup(html, "html.parser")
    pre_tag_classes = [
        "border",
        "border-secondary",
        "rounded",
        "bg-secondary"
    ]
    for pre_tag in soup.find_all('pre'):
        pre_tag['class'] = pre_tag.get('class', []) + pre_tag_classes
    for img_tag in soup.find_all('img'):
        img_tag['class'] = img_tag.get('class', []) + ["img-fluid"]
    return str(soup)

def make_img_urls_relative(html, location):
    soup = BeautifulSoup(html, "html.parser")
    for img_tag in soup.find_all('img'):
        img_tag['src'] = relative_url(location, [img_tag['src']])
    return str(soup)

def generate_html(location=[]):
    create_folders()
    with open(os.path.join(TEMPLATES_FOLDER, "template.html"), "r") as file:
        html_template = file.read()
    html =  html_template.replace("<!--list-group-->", "\n".join(generate_list(location=location)) )
    relative_path_home = relative_url(location, ["index.html"])
    html = html.replace("{home}", relative_path_home)
    html = html.replace("<!--navbar-->", generate_navbar(location))
    return html

def generate_navbar(location=[]):
    with open(os.path.join(TEMPLATES_FOLDER, "navbar.html"), "r") as navbar_file:
        navbar_html = navbar_file.read()
    pages = [ #the links must be in same order as in the template file navbar.html
        ["index.html"],
        ["artiklar.html"],
    ] 
    pages += [[file_name.split(".")[0]+".html"] for file_name in os.listdir(PAGES_FOLDER)]

    soup = BeautifulSoup(navbar_html, 'html.parser')
    nav_links = soup.find_all('a', class_='nav-link')
    if len(nav_links) <= len(pages):
        links_to_add = len(pages) - len(nav_links)
        with open(os.path.join(TEMPLATES_FOLDER, "nav_item.html"), "r") as link_html_file:
            new_link = link_html_file.read()      
        for i in range(links_to_add):
            navbar_html = navbar_html.replace("<!--add-->", new_link)
        soup = BeautifulSoup(navbar_html, 'html.parser')
        nav_links = soup.find_all('a', class_='nav-link')
    page = 0
    for link in nav_links:
        link['href'] = relative_url(location, pages[page])
        if( pages[page] == location ):
            link['aria-current'] = page
            link['class'].append('active')
        if page > 0:
            link.string = pages[page][0].split(".")[0].title()
        page += 1
    return str(soup)

def generate_list(location=[]):
    items = []
    directory = './articles'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            with open(filepath, "r") as file:
                template = file.read()
            title = template[3:template.index("\n")] #every document should start with a h2 so " ##" 
            desc = template.splitlines()[2] #the first line of the text
            url = filename.split(".")[0]+".html"
            print(url)
            items.append(generate_list_group_item(title, desc, url, location))
    return items

def generate_list_group_item(title, desc, url, location=[]):
    with open(os.path.join(TEMPLATES_FOLDER, "list_group_item_template.html"), "r") as file:
        list_group_item_template = file.read()
    html = list_group_item_template
    html = html.replace("{title}", title)
    html = html.replace("{desc}", desc)
    r_url = relative_url(location, ["art", url])
    # print(r_url)
    html = html.replace("{url}", r_url)
    return html

def generate_intro():
    with open( "content/intro.md", "r") as intro_markdown_file:
        intro_md = intro_markdown_file.read()
    content = markdown2.markdown(intro_md)
    with open( os.path.join(TEMPLATES_FOLDER, "intro.html"), "r") as intro_template_file:
        intro_template = intro_template_file.read()
    html = intro_template.replace("<!--content-->", content )
    return html

def generate_articles():
    create_folders()
    directory = './articles'
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            with open(filepath, "r") as file:
                markdown_input = file.read()
            content_html = make_img_urls_relative(markdown2.markdown(markdown_input), ["art"])
            html = generate_html(location=["art"]).replace("<!--content-->", content_html)
            soup = BeautifulSoup(html, 'html.parser')
            html = soup.prettify()
            html = apply_styles(str(html))
            output_filename = filename.split(".")[0]+".html"
            with open("./out/art/"+output_filename, "w") as output_file:
                output_file.write(html)
            
def generate_start_page():
    create_folders()
    articles_dir = './articles'
    listing = os.listdir(articles_dir)
    articles = [entry for entry in listing if os.path.isfile(os.path.join(articles_dir, entry))]
    articles.sort(reverse=True)
    with open( os.path.join(articles_dir, articles[0]), "r") as article_markdown_file:
        article_md = article_markdown_file.read()
    content = generate_intro() + "<span>Senaste:</span>" + markdown2.markdown(article_md)
    html = generate_html().replace("<!--content-->", content)
    soup = BeautifulSoup(html, 'html.parser')
    formatted = soup.prettify()
    with open(OUTPUT_FOLDER+"/index.html", "w") as output:
        output.write(formatted)

#länken kan vara till första artiklen
def generate_artiklar_page():
    create_folders()
    articles_dir = './articles'
    listing = os.listdir(articles_dir)
    articles = [entry for entry in listing if os.path.isfile(os.path.join(articles_dir, entry))]
    articles.sort(reverse=True)
    with open( os.path.join(articles_dir, articles[0]), "r") as article_markdown_file:
        article_md = article_markdown_file.read()
    content = markdown2.markdown(article_md)
    html = generate_html([]).replace("<!--content-->", content)
    soup = BeautifulSoup(html, 'html.parser')
    content_div = soup.find(id='content')

    # add classes to hide content on small screens
    additional_classes = ['d-none', 'd-lg-block']
    if content_div.has_attr('class'):
        content_div['class'].extend(additional_classes)
    else:
        content_div['class'] = additional_classes

    formatted = soup.prettify()
    with open(OUTPUT_FOLDER+"/artiklar.html", "w") as output:
        output.write(formatted)

#makes all pages in the pages folder
def generate_pages():
    for entry in os.listdir(PAGES_FOLDER):
        full_file_path = os.path.join(PAGES_FOLDER, entry)
        with open(full_file_path, "r") as file:
            md = file.read()
        content = markdown2.markdown(md)
        html = generate_html().replace("<!--content-->", content)
        soup = BeautifulSoup(html, 'html.parser')
        formatted = soup.prettify()
        html_file_name = entry.split(".")[0]+".html"
        with open(os.path.join(OUTPUT_FOLDER, html_file_name), "w") as output:
            output.write(formatted)
        
        
generate_start_page()
generate_articles()
generate_artiklar_page()
generate_pages()
