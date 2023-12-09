import os
import markdown2
from bs4 import BeautifulSoup

#output folder for baked and root of ready website
OUTPUT_FOLDER = "./out"
OUTPUT_ARTICLES_FOLDER = OUTPUT_FOLDER+"/art"
TEMPLATES_FOLDER = "./templates"

def create_folders():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_ARTICLES_FOLDER, exist_ok=True)

def generate_relative_url(location, destination):
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

def generate_html(location=[]):
    create_folders()
    with open(os.path.join(TEMPLATES_FOLDER, "template.html"), "r") as file:
        html_template = file.read()
    html =  html_template.replace("<!--list-group-->", "\n".join(generate_list(location=location)) )
    relative_path_home = generate_relative_url(location, [])
    html = html.replace("{home}", relative_path_home)
    return html

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
    relative_url = generate_relative_url(location, ["art", url])
    print(relative_url)
    html = html.replace("{url}", relative_url)
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
            content_html = markdown2.markdown(markdown_input)
            html = generate_html(location=["art"]).replace("<!--content-->", content_html)
            soup = BeautifulSoup(html, 'html.parser')
            html = soup.prettify()
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

generate_start_page()
generate_articles()
